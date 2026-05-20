import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  EyeOff,
  ExternalLink,
  Filter,
  Globe2,
  Newspaper,
  RadioTower,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import './styles.css';
import {
  listedCompanySamples,
  marketSources,
  newsItems,
  quantRegions,
  regions,
  type NewsCategory,
  type RegionKey,
} from './data';

const categoryOptions: Array<NewsCategory | '全部'> = ['全部', '政策', '商业化', '适航', '基建', '技术', '融资'];
const regionOptions = ['全部', '中国', '美国', '欧洲', '中东', '东南亚', '全球'] as const;
const sourceTypeOptions = ['全部', '官方发布', '地方政府', '企业公告', '主流媒体', '行业媒体', '自媒体观察', '研究报告'] as const;
const auditStorageKey = 'low-altitude-news-audit-v1';
const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type DisplayNewsItem = {
  id: string | number;
  country: string;
  category: NewsCategory;
  priority: '重点跟踪' | '观察';
  sourceType: string;
  credibility: string;
  cacheMode: string;
  date: string;
  title: string;
  summary: string;
  source: string;
  url: string;
};

type NewsSnapshot = {
  generatedAt: string;
  collected: Array<{
    id: string;
    market: string;
    category: NewsCategory;
    sourceType: string;
    credibility: string;
    cacheMode: string;
    date?: string;
    title: string;
    summary: string;
    source: string;
    url: string;
  }>;
};

type AuditState = {
  hiddenIds: string[];
  verifiedIds: string[];
  categoryOverrides: Record<string, NewsCategory>;
};

const emptyAuditState: AuditState = {
  hiddenIds: [],
  verifiedIds: [],
  categoryOverrides: {},
};

function App() {
  const [activeRegion, setActiveRegion] = useState<RegionKey>('china');
  const [compareRegion, setCompareRegion] = useState<RegionKey>('us');
  const [category, setCategory] = useState<NewsCategory | '全部'>('全部');
  const [priorityOnly, setPriorityOnly] = useState(true);
  const [query, setQuery] = useState('');
  const [cachedNews, setCachedNews] = useState<DisplayNewsItem[]>([]);
  const [newsRegion, setNewsRegion] = useState<(typeof regionOptions)[number]>('全部');
  const [sourceType, setSourceType] = useState<(typeof sourceTypeOptions)[number]>('全部');
  const [selectedNews, setSelectedNews] = useState<DisplayNewsItem | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [auditState, setAuditState] = useState<AuditState>(() => loadAuditState());

  const active = regions.find((region) => region.key === activeRegion) ?? regions[0];
  const compare = regions.find((region) => region.key === compareRegion) ?? regions[1];
  const activeQuant = quantRegions.find((item) => item.region === activeRegion) ?? quantRegions[0];
  const compareQuant = quantRegions.find((item) => item.region === compareRegion) ?? quantRegions[1];

  useEffect(() => {
    loadNewsSnapshot(publicUrl('data/news-snapshot.json'))
      .then((snapshot) => {
        if (!snapshot?.collected?.length) return;
        setCachedNews(snapshot.collected.map((item) => ({
          id: item.id,
          country: item.market,
          category: item.category,
          priority: item.credibility === '待核验' || item.sourceType === '自媒体观察' ? '观察' : '重点跟踪',
          sourceType: item.sourceType,
          credibility: item.credibility,
          cacheMode: item.cacheMode,
          date: normalizeDate(item.date || snapshot.generatedAt),
          title: item.title,
          summary: item.summary,
          source: item.source,
          url: item.url,
        })));
      })
      .catch(() => setCachedNews([]));
  }, []);

  useEffect(() => {
    window.localStorage?.setItem(auditStorageKey, JSON.stringify(auditState));
  }, [auditState]);

  const rawNews: DisplayNewsItem[] = cachedNews.length ? cachedNews : newsItems;
  const allNews: DisplayNewsItem[] = useMemo(() => {
    return rawNews
      .filter((item) => !auditState.hiddenIds.includes(String(item.id)))
      .map((item) => ({
        ...item,
        category: auditState.categoryOverrides[String(item.id)] ?? item.category,
        priority: auditState.verifiedIds.includes(String(item.id)) ? '重点跟踪' : item.priority,
        credibility: auditState.verifiedIds.includes(String(item.id)) && item.credibility === '待核验' ? '中' : item.credibility,
      }));
  }, [auditState, rawNews]);

  const filteredNews = useMemo(() => {
    return allNews.filter((item) => {
      const categoryMatch = category === '全部' || item.category === category;
      const priorityMatch = !priorityOnly || item.priority === '重点跟踪';
      const regionMatch = newsRegion === '全部' || item.country === newsRegion;
      const sourceTypeMatch = sourceType === '全部' || item.sourceType === sourceType;
      const queryMatch = [item.title, item.summary, item.country, item.source].join(' ').toLowerCase().includes(query.toLowerCase());
      return categoryMatch && priorityMatch && regionMatch && sourceTypeMatch && queryMatch;
    });
  }, [allNews, category, newsRegion, priorityOnly, query, sourceType]);

  return (
    <main>
      <section className="hero">
        <img className="heroImage" src={publicUrl('images/low-altitude-hero.png')} alt="" />
        <div className="heroShade" />
        <nav className="topNav">
          <div className="brand"><RadioTower size={20} /> 全球低空经济观察站</div>
          <div className="navPills">
            <a href="#news">动态流</a>
            <a href="#radar">全球雷达</a>
            <a href="#compare">量化对比</a>
          </div>
        </nav>
        <div className="heroContent">
          <div>
            <p className="eyebrow"><Globe2 size={16} /> 全球低空经济情报</p>
            <h1 className="heroTitle">
              <span>看全球<i>低空经济</i></span>
              <span>政策、商业化</span>
              <span>与趋势变化</span>
            </h1>
            <p className="heroLead">把低空空域、无人机物流、电动垂直起降飞行器、起降基础设施和资本动态放到同一个可交互视图里，先看事实线索，再做趋势判断。</p>
            <div className="heroActions">
              <a href="#news" className="primaryAction">查看全球动态 <Newspaper size={18} /></a>
              <a href="#compare" className="ghostAction">国家对比 <ArrowRightLeft size={18} /></a>
            </div>
            <div className="heroFocus">
              <span>政策</span>
              <span>商业化</span>
              <span>适航</span>
              <span>基础设施</span>
              <span>资本市场</span>
            </div>
          </div>
          <div className="livePanel">
            <div className="panelHeader">
              <span>今日雷达</span>
              <TrendingUp size={18} />
            </div>
            <div className="pulseGrid">
              <Metric label="跟踪地区" value={regions.length} suffix="个" />
              <Metric label="动态条目" value={allNews.length} suffix="条" />
              <Metric label="参考来源" value={marketSources.length} suffix="个" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="news">
        <div className="sectionTitle wide">
          <div>
            <p className="eyebrow">新闻收集</p>
            <h2>全球动态流</h2>
            <p className="sectionLead">优先展示和政策、适航、商业化有关的可追踪事件。</p>
          </div>
          <div className="controls">
            <label className="searchBox"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索政策、企业、地区" /></label>
            <button className={`toggle ${priorityOnly ? 'on' : ''}`} onClick={() => setPriorityOnly(!priorityOnly)}><Filter size={16} /> 重点</button>
          </div>
        </div>
        <div className="filterPanel">
          <label>地区<SelectText value={newsRegion} onChange={(value) => setNewsRegion(value as typeof newsRegion)} options={regionOptions} /></label>
          <label>来源<SelectText value={sourceType} onChange={(value) => setSourceType(value as typeof sourceType)} options={sourceTypeOptions} /></label>
          <button className="textButton" onClick={() => {
            setCategory('全部');
            setNewsRegion('全部');
            setSourceType('全部');
            setPriorityOnly(false);
            setQuery('');
          }}>清除筛选</button>
        </div>
        <div className="auditToolbar">
          <button className={`toggle ${showAuditPanel ? 'on' : ''}`} onClick={() => setShowAuditPanel(!showAuditPanel)}><Settings2 size={16} /> 审核面板</button>
          <span>已隐藏 {auditState.hiddenIds.length} 条，已标记有效 {auditState.verifiedIds.length} 条</span>
        </div>
        {showAuditPanel && (
          <AuditPanel
            items={rawNews}
            auditState={auditState}
            onHide={(id) => setAuditState((state) => ({ ...state, hiddenIds: unique([...state.hiddenIds, id]) }))}
            onVerify={(id) => setAuditState((state) => ({ ...state, verifiedIds: unique([...state.verifiedIds, id]) }))}
            onCategoryChange={(id, nextCategory) => setAuditState((state) => ({
              ...state,
              categoryOverrides: { ...state.categoryOverrides, [id]: nextCategory },
            }))}
            onRestoreAll={() => setAuditState(emptyAuditState)}
          />
        )}
        <div className="tabs">
          {categoryOptions.map((option) => (
            <button key={option} className={category === option ? 'selected' : ''} onClick={() => setCategory(option)}>{option}</button>
          ))}
        </div>
        <div className="newsGrid">
          {filteredNews.map((item, index) => (
            <button className={`newsCard ${index === 0 ? 'featuredNews' : ''}`} onClick={() => setSelectedNews(item)} key={item.id}>
              <div className="newsMeta">
                <span>{item.country}</span>
                <span>{item.category}</span>
                <span>{item.sourceType}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="newsFooter">
                <span><CalendarDays size={15} /> {item.date}</span>
                <span>{item.cacheMode}</span>
                <span>{item.source}</span>
              </div>
            </button>
          ))}
        </div>
        {!filteredNews.length && <div className="emptyState">当前筛选下没有可展示的资讯，建议放宽来源或可信度条件。</div>}
      </section>

      <section className="section mapSection" id="radar">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">互动地图</p>
            <h2>全球发展雷达</h2>
          </div>
          <p className="sectionLead">点击地区，快速查看当前机会信号与主要风险。</p>
        </div>
        <div className="mapLayout">
          <div className="worldMap">
            <div className="globeShell">
              <div className="globeGrid" />
              <div className="globeGlow" />
              {regions.map((region) => (
                <button
                  key={region.key}
                  className={`mapNode ${region.key === activeRegion ? 'active' : ''}`}
                  style={region.coordinates}
                  onClick={() => setActiveRegion(region.key)}
                  aria-label={`查看${region.name}`}
                >
                  <span>{region.name}</span>
                </button>
              ))}
            </div>
            <div className="orbitLine orbitOne" />
            <div className="orbitLine orbitTwo" />
          </div>
          <article className="regionCard">
            <div className="regionTop">
              <div>
                <p className="eyebrow">{active.label}</p>
                <h3>{active.name}</h3>
              </div>
            </div>
            <p>{active.summary}</p>
            <div className="signalColumns">
              <SignalList title="机会信号" items={active.signals} />
              <SignalList title="风险提醒" items={active.risks} />
            </div>
          </article>
        </div>
      </section>

      <section className="section compareSection" id="compare">
        <div className="sectionTitle">
          <div>
            <p className="eyebrow">市场对比</p>
            <h2>国家与地区量化对比</h2>
          </div>
          <p className="sectionLead">用公开样本市值、市场潜力口径和活跃赛道做横向浏览。</p>
        </div>
        <div className="methodNote">
          <ShieldCheck size={18} />
          <span>数据口径：市值仅为公开上市公司样本，不代表完整低空经济规模；市场潜力来自公开报告或报道口径，需结合来源时间和统计范围解读。</span>
        </div>
        <div className="compareControls">
          <SelectRegion value={activeRegion} onChange={setActiveRegion} />
          <ArrowRightLeft size={22} />
          <SelectRegion value={compareRegion} onChange={setCompareRegion} />
        </div>
        <div className="compareGrid">
          <QuantCard region={active} quant={activeQuant} />
          <QuantCard region={compare} quant={compareQuant} />
        </div>
        <div className="companyTable">
          <div className="tableHeader">
            <h3>上市公司样本</h3>
            <span>市值为原型数据，后续可接行情接口自动刷新</span>
          </div>
          <div className="tableRows">
            <div className="companyRow companyHead">
              <strong>代码</strong>
              <span>公司</span>
              <span>地区</span>
              <span>赛道</span>
              <b>样本市值</b>
            </div>
            {listedCompanySamples.map((company) => {
              const region = regions.find((item) => item.key === company.region);
              return (
                <div className="companyRow" key={company.ticker}>
                  <strong>{company.ticker}</strong>
                  <span>{company.name}</span>
                  <span>{region?.name}</span>
                  <span>{company.track}</span>
                  <b>{formatUsdBillion(company.marketCapUsdB)}</b>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sourceGrid marketSourceGrid">
          {marketSources.map((source) => (
            <a className="sourceCard" href={source.url} target="_blank" rel="noreferrer" key={source.title}>
              <h3>{source.title}</h3>
              <strong>{source.value}</strong>
              <p>{source.source}</p>
            </a>
          ))}
        </div>
      </section>

      {selectedNews && <NewsDetailModal item={selectedNews} onClose={() => setSelectedNews(null)} />}

    </main>
  );
}

function Metric({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return <div className="metricTile"><span>{label}</span><strong>{value}{suffix}</strong></div>;
}

function SignalList({ title, items }: { title: string; items: string[] }) {
  return <div><h4>{title}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function QuantCard({ region, quant }: { region: typeof regions[number]; quant: typeof quantRegions[number] }) {
  return (
    <article className="compareCard quantCard">
      <div className="quantTop">
        <div>
          <p className="eyebrow">{region.label}</p>
          <h3>{region.name}</h3>
        </div>
        <span>{quant.listedSampleCount} 家上市样本</span>
      </div>
      <div className="quantTiles">
        <div>
          <span>样本公司市值</span>
          <strong>{quant.listedMarketCapUsdB === null ? '暂无样本' : formatUsdBillion(quant.listedMarketCapUsdB)}</strong>
        </div>
        <div>
          <span>跟踪企业/主体</span>
          <strong>{quant.trackedCompanies}</strong>
        </div>
      </div>
      <div className="potentialBox">
        <span>市场潜力口径</span>
        <strong>{quant.marketPotential}</strong>
        <p>{quant.marketPotentialNote}</p>
      </div>
      <div className="sectorChips">
        {quant.activeSectors.map((sector) => <span key={sector}>{sector}</span>)}
      </div>
      <p className="dataCaveat">{quant.dataCaveat}</p>
    </article>
  );
}

function SelectRegion({ value, onChange }: { value: RegionKey; onChange: (value: RegionKey) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as RegionKey)}>
      {regions.map((region) => <option key={region.key} value={region.key}>{region.name}</option>)}
    </select>
  );
}

function SelectText<T extends string>({ value, onChange, options }: { value: T; onChange: (value: string) => void; options: readonly T[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function AuditPanel({
  items,
  auditState,
  onHide,
  onVerify,
  onCategoryChange,
  onRestoreAll,
}: {
  items: DisplayNewsItem[];
  auditState: AuditState;
  onHide: (id: string) => void;
  onVerify: (id: string) => void;
  onCategoryChange: (id: string, category: NewsCategory) => void;
  onRestoreAll: () => void;
}) {
  return (
    <section className="auditPanel" aria-label="资讯审核面板">
      <div className="auditHeader">
        <div>
          <h3>资讯质量控制</h3>
          <p>本地审核结果仅保存在当前浏览器，用于先过滤噪音和修正分类。</p>
        </div>
        <button className="textButton" onClick={onRestoreAll}><RotateCcw size={16} /> 恢复全部</button>
      </div>
      <div className="auditRows">
        {items.map((item) => {
          const id = String(item.id);
          const hidden = auditState.hiddenIds.includes(id);
          const verified = auditState.verifiedIds.includes(id);
          return (
            <article className={`auditRow ${hidden ? 'muted' : ''}`} key={id}>
              <div>
                <div className="newsMeta">
                  <span>{item.country}</span>
                  <span>{auditState.categoryOverrides[id] ?? item.category}</span>
                  <span>{item.sourceType}</span>
                  <span>{verified ? '已标记有效' : `可信度：${item.credibility}`}</span>
                  {hidden && <span>已隐藏</span>}
                </div>
                <h4>{item.title}</h4>
                <p>{item.source}</p>
              </div>
              <div className="auditActions">
                <SelectText
                  value={(auditState.categoryOverrides[id] ?? item.category) as NewsCategory}
                  onChange={(value) => onCategoryChange(id, value as NewsCategory)}
                  options={categoryOptions.filter((option): option is NewsCategory => option !== '全部')}
                />
                <button className="textButton" onClick={() => onVerify(id)} disabled={verified}><CheckCircle2 size={16} /> 有效</button>
                <button className="textButton danger" onClick={() => onHide(id)} disabled={hidden}><EyeOff size={16} /> 隐藏</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NewsDetailModal({ item, onClose }: { item: DisplayNewsItem; onClose: () => void }) {
  return (
    <div className="modalBackdrop" role="presentation" onClick={onClose}>
      <article className="newsModal" role="dialog" aria-modal="true" aria-label="资讯详情" onClick={(event) => event.stopPropagation()}>
        <button className="iconButton" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="newsMeta detailMeta">
          <span>{item.country}</span>
          <span>{item.category}</span>
          <span>{item.sourceType}</span>
          <span>{item.cacheMode}</span>
        </div>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <div className="detailFacts">
          <div><span>发布时间</span><strong>{item.date}</strong></div>
          <div><span>来源</span><strong>{item.source}</strong></div>
          <div><span>展示方式</span><strong>站内摘要缓存，原文保留外链</strong></div>
        </div>
        <div className="detailNotice">
          本站仅保存摘要、来源和链接，不搬运外站全文；自媒体和行业媒体内容建议结合官方或企业公告交叉核验。
        </div>
        <a className="primaryAction detailLink" href={item.url} target="_blank" rel="noreferrer">查看原文 <ExternalLink size={17} /></a>
      </article>
    </div>
  );
}

function formatUsdBillion(value: number) {
  return `约${(value * 10).toFixed(1)}亿美元`;
}

function normalizeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '待确认';
  return date.toISOString().slice(0, 10);
}

function loadNewsSnapshot(url: string): Promise<NewsSnapshot | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        resolve(null);
        return;
      }
      if (request.response) {
        resolve(request.response as NewsSnapshot);
        return;
      }
      try {
        resolve(JSON.parse(request.responseText) as NewsSnapshot);
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(new Error('无法读取资讯快照'));
    request.send();
  });
}

function loadAuditState(): AuditState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return emptyAuditState;
    const stored = window.localStorage.getItem(auditStorageKey);
    if (!stored) return emptyAuditState;
    const parsed = JSON.parse(stored) as Partial<AuditState>;
    return {
      hiddenIds: Array.isArray(parsed.hiddenIds) ? parsed.hiddenIds : [],
      verifiedIds: Array.isArray(parsed.verifiedIds) ? parsed.verifiedIds : [],
      categoryOverrides: parsed.categoryOverrides && typeof parsed.categoryOverrides === 'object' ? parsed.categoryOverrides : {},
    };
  } catch {
    return emptyAuditState;
  }
}

function unique(values: string[]) {
  return [...new Set(values)];
}

createRoot(document.getElementById('root')!).render(<App />);
