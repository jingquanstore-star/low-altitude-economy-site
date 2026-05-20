import { mkdir, writeFile } from 'node:fs/promises';
import { crawlerPolicy, sourceCatalog } from './source-catalog.mjs';

const outDir = new URL('../public/data/', import.meta.url);
const outFile = new URL('news-snapshot.json', outDir);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decode(value) {
  return value
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value) {
  return decode(value.replace(/<[^>]+>/g, ' '));
}

function localizeTerms(value) {
  return value
    .replace(/\bAdvanced Air Mobility\b/gi, '先进空中交通')
    .replace(/\bUrban Air Mobility\b/gi, '城市空中交通')
    .replace(/\beVTOL\b/gi, '电动垂直起降飞行器')
    .replace(/\bVTOL\b/gi, '垂直起降飞行器')
    .replace(/\bUAM\b/g, '城市空中交通')
    .replace(/\bAAM\b/g, '先进空中交通')
    .replace(/\bUAS\b/g, '无人驾驶航空系统')
    .replace(/\bvertiports?\b/gi, '垂直起降场')
    .replace(/\bdrones?\b/gi, '无人机')
    .replace(/\bAir Mobility\b/g, '空中交通');
}

function isNoiseTitle(title) {
  return [
    /^skip to content$/i,
    /^digital magazine$/i,
    /^subscribe$/i,
    /^contact$/i,
    /^privacy/i,
    /^terms/i,
    /whatsapp group/i,
    /stay updated/i,
    /cookie/i,
    /^podcasts$/i,
    /^knowledge partners$/i,
    /^conferences? & expos?$/i,
    /^about us$/i,
    /^media pack/i,
    /^middle east$/i,
    /^featured$/i,
    /^interviews$/i,
    /^jason pritchard$/i,
    /^thought leadership/i,
    /^women in/i,
    /^\d{1,2}\s+[a-z]+\s+\d{4}$/i,
  ].some((pattern) => pattern.test(title.trim()));
}

function textBetween(input, tag) {
  const match = input.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decode(match[1]) : '';
}

function relevant(item, keywords) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function normalizeUrl(url, base) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function classifyCategory(text) {
  const value = text.toLowerCase();
  if (/适航|certification|airworthiness/.test(value)) return '适航';
  if (/融资|funding|capital|investor|上市|市值/.test(value)) return '融资';
  if (/基础设施|机场|起降|充电|vertiport|infrastructure/.test(value)) return '基建';
  if (/运营|订单|商业|commercial|delivery|route/.test(value)) return '商业化';
  if (/技术|电池|飞控|noise|simulation|research/.test(value)) return '技术';
  return '政策';
}

function stableId(item) {
  return Buffer.from(`${item.sourceId}:${item.canonicalUrl || item.title}`).toString('base64url').slice(0, 18);
}

async function fetchText(url, source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), crawlerPolicy.timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': crawlerPolicy.userAgent,
        accept: 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.7',
      },
    });
    if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function collectFromFeed(source) {
  if (!source.feed) return [];
  const xml = await fetchText(source.feed, source);
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
    .map((match) => {
      const title = localizeTerms(textBetween(match[0], 'title'));
      const summary = localizeTerms(stripTags(textBetween(match[0], 'description')));
      const url = normalizeUrl(textBetween(match[0], 'link'), source.url);
      return {
        title,
        summary: summary.slice(0, 180),
        url,
        canonicalUrl: url,
        date: textBetween(match[0], 'pubDate'),
        market: source.market,
        source: source.name,
        sourceId: source.id,
        sourceType: source.type,
        credibility: source.credibility,
        category: classifyCategory(`${title} ${summary}`),
        cacheMode: '摘要缓存',
      };
    })
    .filter((item) => item.title && relevant(item, source.keywords))
    .slice(0, crawlerPolicy.maxItemsPerSource);
}

function collectLinksFromHtml(html, source) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      const title = localizeTerms(stripTags(match[2]));
      const url = normalizeUrl(match[1], source.url);
      return {
        title,
        summary: `来自${source.name}的公开页面线索，需进入原文核验细节。`,
        url,
        canonicalUrl: url,
        date: '',
        market: source.market,
        source: source.name,
        sourceId: source.id,
        sourceType: source.type,
        credibility: source.credibility,
        category: classifyCategory(title),
        cacheMode: '标题与摘要缓存',
      };
    })
    .filter((item) => item.title.length >= 8 && item.title.length <= 140)
    .filter((item) => !isNoiseTitle(item.title))
    .filter((item) => relevant(item, source.keywords));

  const seen = new Set();
  return links.filter((item) => {
    const key = `${item.title}:${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, crawlerPolicy.maxItemsPerSource);
}

async function collectFromWatchPage(source) {
  const html = await fetchText(source.url, source);
  return collectLinksFromHtml(html, source);
}

async function collectSource(source) {
  if (source.crawlMode === 'rss') return collectFromFeed(source);
  if (source.crawlMode === 'watch-page') return collectFromWatchPage(source);
  return [];
}

async function main() {
  const collected = [];
  const errors = [];

  for (const source of sourceCatalog) {
    try {
      const items = await collectSource(source);
      collected.push(...items.map((item) => ({ id: stableId(item), ...item })));
    } catch (error) {
      errors.push({ source: source.name, type: source.type, message: error.message });
    }
    await wait(crawlerPolicy.requestDelayMs);
  }

  const deduped = [];
  const seen = new Set();
  for (const item of collected) {
    const key = item.canonicalUrl || item.title;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    policy: {
      note: '仅缓存标题、摘要、来源、链接与可信度标签；不搬运媒体全文。',
      ...crawlerPolicy,
    },
    collected: deduped,
    sourceCatalog: sourceCatalog.map(({ id, market, type, credibility, name, url, crawlMode, cadenceHours, keywords }) => ({
      id,
      market,
      type,
      credibility,
      name,
      url,
      crawlMode,
      cadenceHours,
      keywords,
    })),
    errors,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(snapshot, null, 2));
  console.log(`Saved ${deduped.length} cached items from ${sourceCatalog.length} sources to ${outFile.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
