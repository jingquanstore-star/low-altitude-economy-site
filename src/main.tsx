import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  ExternalLink,
  FileText,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import './styles.css';
import {
  companyLibrary,
  newsItems,
  productLibrary,
  quantRegions,
  reportLibrary,
  regions,
  type CompanyLibraryItem,
  type NewsCategory,
  type ProductLibraryItem,
  type RegionKey,
  type ReportLibraryItem,
} from './data';

const categoryOptions: Array<NewsCategory | '全部'> = ['全部', '政策', '商业化', '适航', '基建', '技术', '融资'];
const feedModes = ['行业资讯', '公司', '投融资', 'IPO'] as const;
const auditStorageKey = 'low-altitude-news-audit-v1';
const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const templateCoverIds = new Set(['1', '2', '105']);

type DisplayNewsItem = {
  id: string | number;
  region?: RegionKey;
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
  content?: string[];
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
  const [feedMode, setFeedMode] = useState<(typeof feedModes)[number]>('行业资讯');
  const [query, setQuery] = useState('');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [cachedNews, setCachedNews] = useState<DisplayNewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<DisplayNewsItem | null>(null);
  const [activeSpotlight, setActiveSpotlight] = useState(0);
  const [auditState, setAuditState] = useState<AuditState>(() => loadAuditState());
  const [appRoute, setAppRoute] = useState(() => getAppRoute());

  useEffect(() => {
    loadNewsSnapshot(publicUrl('data/news-snapshot.json'))
      .then((snapshot) => {
        if (!snapshot?.collected?.length) return;
        setCachedNews(snapshot.collected.map((item) => ({
          id: item.id,
          region: countryToRegionKey(item.market),
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
          content: buildArticleContent({
            country: item.market,
            category: item.category,
            sourceType: item.sourceType,
            credibility: item.credibility,
            title: item.title,
            summary: item.summary,
            source: item.source,
          }),
        })));
      })
      .catch(() => setCachedNews([]));
  }, []);

  useEffect(() => {
    window.localStorage?.setItem(auditStorageKey, JSON.stringify(auditState));
  }, [auditState]);

  useEffect(() => {
    const onHashChange = () => setAppRoute(getAppRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const rawNews: DisplayNewsItem[] = useMemo(() => mergeNews(newsItems, cachedNews), [cachedNews]);
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
      const modeMatch = feedModeMatches(item, feedMode);
      const queryMatch = [item.title, item.summary, item.country, item.source, item.category, item.sourceType].join(' ').toLowerCase().includes(query.toLowerCase());
      return modeMatch && queryMatch;
    });
  }, [allNews, feedMode, query]);

  const visibleNews = filteredNews;
  const spotlightNews = useMemo(() => getSpotlightNews(allNews), [allNews]);

  useEffect(() => {
    if (activeSpotlight >= spotlightNews.length) {
      setActiveSpotlight(0);
    }
  }, [activeSpotlight, spotlightNews.length]);

  useEffect(() => {
    if (spotlightNews.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSpotlight((index) => (index + 1) % spotlightNews.length);
    }, 5800);
    return () => window.clearInterval(timer);
  }, [spotlightNews.length]);

  if (appRoute === 'admin') {
    return (
      <AdminPage
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
    );
  }

  return (
    <main className="visualTheme-sunrise">
      <nav className="topNav appNav">
        <div className="brand siteBrand" aria-label="新浪低空">
          <span className="brandTextMark" aria-hidden="true">
            <span className="brandTextDark">新浪</span>
            <span className="brandTextAir">低空</span>
          </span>
        </div>
        <div className="navPills">
          <a href="#news">低空资讯</a>
          <a href="#companies">企业库</a>
          <a href="#products">产品库</a>
          <a href="#reports">报告库</a>
        </div>
      </nav>

      {appRoute === 'public' && (
        <section className="section newsSection homeNewsOnly" id="news">
          <div className="newsIntroPanel">
            <p className="eyebrow sectionOnlyTitle">低空资讯</p>
            <label className="searchBox heroSearch"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索政策、企业、地区、融资、上市" /></label>
          </div>
          {spotlightNews.length > 0 && (
            <SpotlightCarousel
              items={spotlightNews}
              activeIndex={activeSpotlight}
              onOpen={setSelectedNews}
              onPrev={() => setActiveSpotlight((index) => (index - 1 + spotlightNews.length) % spotlightNews.length)}
              onNext={() => setActiveSpotlight((index) => (index + 1) % spotlightNews.length)}
            />
          )}
          <div className="feedTabs">
            {feedModes.map((mode) => (
              <button key={mode} className={feedMode === mode ? 'selected' : ''} onClick={() => setFeedMode(mode)}>{mode}</button>
            ))}
          </div>
          <div className="newsGrid">
            {visibleNews.map((item) => {
              const heroImage = newsHeroImage(item);
              return (
                <button className="newsCard" onClick={() => setSelectedNews(item)} key={item.id}>
                  <div
                    className={`newsVisual ${newsVisualType(item)} ${newsImageClass(item)} ${heroImage ? 'hasNewsImage' : ''}`}
                    style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
                    aria-hidden="true"
                  >
                    {!heroImage && <span className="visualTitle">低空资讯</span>}
                  </div>
                  <div className="newsCardBody">
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
                  </div>
                </button>
              );
            })}
          </div>
          {!filteredNews.length && <div className="emptyState">当前筛选下没有可展示的资讯，建议放宽分类、来源或地区条件。</div>}
          {!!filteredNews.length && (
            <div className="infiniteLoader" aria-live="polite">
              <span className="loaderPulse" aria-hidden="true" />
              <b>当前筛选下已显示 {filteredNews.length} 条资讯</b>
              <small>后续抓取进入后，信息流会继续向下延展。</small>
            </div>
          )}
        </section>
      )}

      {appRoute === 'companies' && (
        <CompanyLibraryPage query={libraryQuery} onQueryChange={setLibraryQuery} />
      )}

      {appRoute === 'products' && (
        <ProductLibraryPage query={libraryQuery} onQueryChange={setLibraryQuery} />
      )}

      {appRoute === 'reports' && (
        <ReportLibraryPage query={libraryQuery} onQueryChange={setLibraryQuery} />
      )}

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

function SpotlightCarousel({
  items,
  activeIndex,
  onOpen,
  onPrev,
  onNext,
}: {
  items: DisplayNewsItem[];
  activeIndex: number;
  onOpen: (item: DisplayNewsItem) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const activeItem = items[activeIndex] ?? items[0];
  const heroImage = activeItem ? newsHeroImage(activeItem) : '';

  return (
    <section className="spotlightCarousel" aria-label="重点资讯轮播">
      <article
        className={`spotlightStage ${newsImageClass(activeItem)} ${heroImage ? 'hasSpotlightImage' : 'spotlightTemplate'}`}
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        onClick={() => onOpen(activeItem)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(activeItem);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="spotlightNoise" aria-hidden="true" />
        <div className="spotlightCopy">
          <h3>{activeItem.title}</h3>
          <div className="spotlightMeta">
            <span>{activeItem.country}</span>
            <span>{activeItem.category}</span>
            <span>{activeItem.source}</span>
          </div>
        </div>
        <div className="spotlightControls" onClick={(event) => event.stopPropagation()}>
          <button aria-label="上一条重点资讯" onClick={onPrev}><ChevronLeft size={18} /></button>
          <button aria-label="下一条重点资讯" onClick={onNext}><ChevronRight size={18} /></button>
        </div>
      </article>
      <aside className="spotlightRail fixedFocusVisual" aria-label="新浪低空固定焦点图">
        <div
          className="fixedFocusImage"
          style={{ backgroundImage: `url(${publicUrl('images/low-altitude-hero.png')})` }}
          aria-hidden="true"
        />
        <div className="fixedFocusOverlay">
          <span className="featureBadge"><Sparkles size={14} /> 特别呈现</span>
          <b><span>城市低空</span><span>运行窗口</span></b>
        </div>
      </aside>
    </section>
  );
}

function CompanyLibraryPage({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const items = useMemo(() => companyLibrary.filter((item) => libraryMatch(item, query)), [query]);

  return (
    <section className="section librarySection routePage" id="companies">
      <LibraryHeader
        icon={<Building2 size={18} />}
        title="企业库"
        count={items.length}
        total={companyLibrary.length}
        query={query}
        onQueryChange={onQueryChange}
        placeholder="搜索企业、赛道、产品、国家"
      />
      <div className="libraryFeatureBand">
        <div>
          <span>企业画像</span>
          <h2>从公司、产品、适航与场景理解低空产业链</h2>
        </div>
        <p>第一版先沉淀核心企业样本，后续可以继续扩展融资、订单、适航节点和关联资讯。</p>
      </div>
      <div className="libraryGrid companyLibraryGrid">
        {items.map((item) => (
          <a className="libraryCard companyLibraryCard" href={item.url} target="_blank" rel="noreferrer" key={item.id}>
            <div className="libraryCardTop">
              <span>{item.country}</span>
              <span>{item.role}</span>
            </div>
            <div className="libraryIdentity">
              <div className="libraryIconMark"><Building2 size={20} /></div>
              <div>
                <h3>{item.name}</h3>
                <strong>{item.track}</strong>
              </div>
            </div>
            <div className="libraryStatusPanel">
              <span>当前阶段</span>
              <b>{item.status}</b>
            </div>
            <div className="libraryFactGrid">
              <div>
                <span>核心产品</span>
                <b>{item.products.slice(0, 2).join(' / ')}</b>
              </div>
              <div>
                <span>重点观察</span>
                <b>{item.latestSignal}</b>
              </div>
            </div>
            <div className="libraryTags">
              {item.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <p className="librarySummary">{item.summary}</p>
          </a>
        ))}
      </div>
      {!items.length && <LibraryEmpty />}
    </section>
  );
}

function ProductLibraryPage({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const items = useMemo(() => productLibrary.filter((item) => libraryMatch(item, query)), [query]);

  return (
    <section className="section librarySection routePage" id="products">
      <LibraryHeader
        icon={<Boxes size={18} />}
        title="产品库"
        count={items.length}
        total={productLibrary.length}
        query={query}
        onQueryChange={onQueryChange}
        placeholder="搜索产品、企业、适航、物流、飞行汽车"
      />
      <div className="libraryGrid productLibraryGrid">
        {items.map((item) => (
          <a className="libraryCard productLibraryCard" href={item.url} target="_blank" rel="noreferrer" key={item.id}>
            <div className="libraryCardTop">
              <span>{regionName(item.region)}</span>
              <span>{item.status}</span>
            </div>
            <div className="libraryIdentity">
              <div className="libraryIconMark productMark"><Boxes size={20} /></div>
              <div>
                <h3>{item.name}</h3>
                <strong>{item.company}</strong>
              </div>
            </div>
            <div className="productScenario">
              <span>产品类型</span>
              <b>{item.type}</b>
            </div>
            <div className="productScenario">
              <span>应用场景</span>
              <b>{item.scenario}</b>
            </div>
            <div className="specList">
              {item.specs.map((spec) => <span key={spec}>{spec}</span>)}
            </div>
            <p className="librarySummary">{item.summary}</p>
          </a>
        ))}
      </div>
      {!items.length && <LibraryEmpty />}
    </section>
  );
}

function ReportLibraryPage({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const items = useMemo(() => reportLibrary.filter((item) => libraryMatch(item, query)), [query]);

  return (
    <section className="section librarySection routePage" id="reports">
      <LibraryHeader
        icon={<FileText size={18} />}
        title="报告库"
        count={items.length}
        total={reportLibrary.length}
        query={query}
        onQueryChange={onQueryChange}
        placeholder="搜索报告、机构、政策、市场规模"
      />
      <div className="reportTimeline">
        {items.map((item) => (
          <a className="reportCard" href={item.url} target="_blank" rel="noreferrer" key={item.id}>
            <div className="reportDate">
              <span>{item.date}</span>
              <b>{regionName(item.region)}</b>
            </div>
            <div className="reportBody">
              <div className="libraryCardTop">
                <span>{item.type}</span>
                <span>{item.publisher}</span>
              </div>
              <div className="reportHeadline">
                <FileText size={20} />
                <h3>{item.title}</h3>
              </div>
              <div className="libraryTags">
                {item.focus.map((focus) => <span key={focus}>{focus}</span>)}
              </div>
              <div className="librarySignal">
                <span>阅读价值</span>
                <p>{item.readValue}</p>
              </div>
              <p className="librarySummary">{item.summary}</p>
            </div>
          </a>
        ))}
      </div>
      {!items.length && <LibraryEmpty />}
    </section>
  );
}

function LibraryHeader({
  icon,
  title,
  count,
  total,
  query,
  onQueryChange,
  placeholder,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  total: number;
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="libraryHeader">
      <div className="libraryTitle">
        <p className="eyebrow sectionOnlyTitle">{icon} {title}</p>
        <span>{count} / {total} 条</span>
      </div>
      <label className="searchBox heroSearch librarySearch">
        <Search size={19} />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={placeholder} />
      </label>
    </div>
  );
}

function LibraryEmpty() {
  return <div className="emptyState">当前搜索下没有匹配内容，可以换一个企业、产品、场景或地区关键词。</div>;
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

function AdminPage({
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
    <main className="adminPage">
      <section className="adminShell">
        <div className="adminHeader">
          <div>
            <p className="eyebrow"><Settings2 size={16} /> 后台管理</p>
            <h1>资讯审核</h1>
            <p>这个界面不在首页展示，用于内部过滤噪音、修正分类和标记有效线索。</p>
          </div>
          <a className="textButton" href="#news">返回前台</a>
        </div>
        <div className="auditToolbar adminOnly">
          <span>已隐藏 {auditState.hiddenIds.length} 条，已标记有效 {auditState.verifiedIds.length} 条</span>
        </div>
        <AuditPanel
          items={items}
          auditState={auditState}
          onHide={onHide}
          onVerify={onVerify}
          onCategoryChange={onCategoryChange}
          onRestoreAll={onRestoreAll}
        />
      </section>
    </main>
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
          <div><span>展示方式</span><strong>站内解读，原文保留外链</strong></div>
        </div>
        <section className="articleBody" aria-label="站内文章正文">
          <h3>站内解读</h3>
          {(item.content?.length ? item.content : buildArticleContent(item)).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <div className="detailNotice">
          以上为本站基于公开标题、摘要和来源信息整理的原创解读，不搬运外站全文；自媒体和行业媒体内容建议结合官方或企业公告交叉核验。
        </div>
        <a className="primaryAction detailLink" href={item.url} target="_blank" rel="noreferrer">查看原文 <ExternalLink size={17} /></a>
      </article>
    </div>
  );
}

function buildArticleContent(item: Pick<DisplayNewsItem, 'country' | 'category' | 'sourceType' | 'credibility' | 'title' | 'summary' | 'source'>) {
  const regionLead = item.country === '全球' ? '全球市场' : `${item.country}市场`;
  const credibilityNote = item.credibility === '待核验'
    ? '这类线索目前仍需要结合官方公告、企业披露或更多媒体报道交叉确认。'
    : '这类线索的参考价值相对更高，但仍需要结合发布时间、统计口径和后续执行进展一起判断。';

  return [
    `${item.title}，核心看点并不只是单条新闻本身，而是它放在${regionLead}低空经济进程里释放出的信号。${item.summary}`,
    `从分类上看，这条动态属于“${item.category}”，来源类型为“${item.sourceType}”。对低空经济来说，这类信息通常会影响产业链预期、企业商业化节奏，以及地方政府或监管机构接下来的资源投入方向。`,
    `如果把它放进更长的时间线里观察，值得关注的不是短期热度，而是后续是否出现更具体的落地动作。比如政策是否变成试点项目，企业公告是否变成真实订单，基础设施规划是否进入招标、建设或运营阶段。`,
    `对投资者、产业从业者和城市运营方来说，这条信息更适合作为观察入口，而不是单独作为判断依据。可以继续跟踪同一来源“${item.source}”的后续更新，也可以和监管部门、企业公告、地方公开文件进行对照。`,
    credibilityNote,
  ];
}

function itemRegionKey(item: DisplayNewsItem) {
  return item.region ?? countryToRegionKey(item.country);
}

function countryToRegionKey(country: string): RegionKey | undefined {
  const normalized = country.toLowerCase();
  if (country.includes('中国') || normalized.includes('china')) return 'china';
  if (country.includes('美国') || normalized.includes('united states') || normalized.includes('usa') || normalized.includes('us')) return 'us';
  if (country.includes('欧洲') || normalized.includes('europe')) return 'europe';
  if (country.includes('中东') || normalized.includes('dubai') || normalized.includes('saudi') || normalized.includes('uae')) return 'middleEast';
  if (country.includes('东南亚') || normalized.includes('singapore') || normalized.includes('indonesia') || normalized.includes('thailand')) return 'southEastAsia';
  return undefined;
}

function feedModeMatches(item: DisplayNewsItem, mode: (typeof feedModes)[number]) {
  const text = `${item.title} ${item.summary} ${item.source} ${item.sourceType} ${item.category}`.toLowerCase();
  const ipoKeywords = ['ipo', '首次公开募股', '公开募股', '招股', '递表', '上市申请', '上市聆讯', '上市样本', '上市公司', '二级市场', '市值', 'spac', '纳斯达克', '纽交所', '港交所'];
  const fundingKeywords = ['融资', '投融资', '投资', '募资', '增资', '基金', '风投', '创投', 'pre-a', 'series', 'funding', 'capital', 'investor'];
  const companyKeywords = ['joby', 'archer', '亿航', 'ehang', '峰飞', '小鹏', '沃飞', '沃兰特', '时的科技', '大疆', '美团', '丰翼', '迅蚁', '中信海直', '莱斯信息', 'volocopter', 'everdrone'];
  const isIpo = ipoKeywords.some((keyword) => text.includes(keyword));
  const isFunding = item.category === '融资' || fundingKeywords.some((keyword) => text.includes(keyword));
  const isCompany = item.sourceType === '企业公告'
    || item.category === '商业化'
    || companyKeywords.some((keyword) => text.includes(keyword));

  if (mode === '公司') {
    return isCompany && !isFunding && !isIpo;
  }
  if (mode === '投融资') {
    return isFunding && !isIpo;
  }
  if (mode === 'IPO') {
    return isIpo;
  }
  return !isFunding && !isIpo;
}

function getSpotlightNews(items: DisplayNewsItem[]) {
  return [...items]
    .sort((a, b) => spotlightScore(b) - spotlightScore(a))
    .slice(0, 5);
}

function spotlightScore(item: DisplayNewsItem) {
  const time = new Date(item.date).getTime();
  const recency = Number.isNaN(time) ? 0 : time / 1000000000000;
  const imageScore = newsHeroImage(item) ? 90 : 0;
  const priorityScore = item.priority === '重点跟踪' ? 60 : 0;
  const companyScore = item.sourceType === '企业公告' ? 28 : 0;
  const chinaScore = item.country === '中国' ? 12 : 0;
  return imageScore + priorityScore + companyScore + chinaScore + recency;
}

function newsVisualType(item: DisplayNewsItem) {
  return shouldUseTemplateCover(item) ? 'visualTemplate' : 'visualMatched';
}

function newsImageClass(item: DisplayNewsItem) {
  const id = String(item.id);
  const classById: Record<string, string> = {
    '101': 'newsImageEhang',
    '102': 'newsImageAutoflight',
    '103': 'newsImageAeroht',
    '104': 'newsImageAerofugia',
    '106': 'newsImageDji',
    '107': 'newsImageMeituan',
  };
  return classById[id] ?? '';
}

function newsHeroImage(item: DisplayNewsItem) {
  if (shouldUseTemplateCover(item)) return '';
  const id = String(item.id);
  const imageById: Record<string, string> = {
    '2': publicUrl('images/news/aerofugia-ae200.jpg'),
    '3': publicUrl('images/news/meituan-drone.jpg'),
    '4': publicUrl('images/low-altitude-hero.png'),
    '5': publicUrl('images/news/aerofugia-ae200.jpg'),
    '6': publicUrl('images/low-altitude-hero.png'),
    '101': publicUrl('images/news/ehang-eh216s.jpg'),
    '102': publicUrl('images/news/autoflight-carryall.jpg'),
    '103': publicUrl('images/news/aeroht-flying-car.jpg'),
    '104': publicUrl('images/news/aerofugia-ae200.jpg'),
    '105': publicUrl('images/news/aerofugia-ae200.jpg'),
    '106': publicUrl('images/news/dji-agriculture.jpg'),
    '107': publicUrl('images/news/meituan-drone.jpg'),
    '108': publicUrl('images/news/ehang-eh216s.jpg'),
    '109': publicUrl('images/low-altitude-hero.png'),
    '110': publicUrl('images/news/aerofugia-ae200.jpg'),
    '111': publicUrl('images/low-altitude-hero.png'),
  };
  return imageById[id] ?? fallbackNewsImage(item);
}

function shouldUseTemplateCover(item: DisplayNewsItem) {
  return templateCoverIds.has(String(item.id));
}

function fallbackNewsImage(item: DisplayNewsItem) {
  const text = `${item.title} ${item.summary} ${item.source} ${item.category}`.toLowerCase();
  if (text.includes('大疆') || text.includes('农业') || text.includes('植保') || text.includes('巡检')) {
    return publicUrl('images/news/dji-agriculture.jpg');
  }
  if (text.includes('物流') || text.includes('配送') || text.includes('货运') || text.includes('丰翼') || text.includes('美团')) {
    return publicUrl('images/news/meituan-drone.jpg');
  }
  if (text.includes('飞行汽车') || text.includes('小鹏') || text.includes('消费')) {
    return publicUrl('images/news/aeroht-flying-car.jpg');
  }
  if (text.includes('适航') || text.includes('垂直起降') || text.includes('载人') || text.includes('电动')) {
    return publicUrl('images/news/aerofugia-ae200.jpg');
  }
  return publicUrl('images/low-altitude-hero.png');
}

function formatUsdBillion(value: number) {
  return `约${(value * 10).toFixed(1)}亿美元`;
}

function regionName(region: RegionKey | 'global') {
  if (region === 'global') return '全球';
  return regions.find((item) => item.key === region)?.name ?? region;
}

function libraryMatch(item: CompanyLibraryItem | ProductLibraryItem | ReportLibraryItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return JSON.stringify(item).toLowerCase().includes(normalizedQuery);
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

function getAppRoute() {
  if (typeof window === 'undefined') return 'public';
  const hash = window.location.hash;
  if (hash === '#admin') return 'admin';
  if (hash === '#companies') return 'companies';
  if (hash === '#products') return 'products';
  if (hash === '#reports') return 'reports';
  return 'public';
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function mergeNews(...groups: DisplayNewsItem[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((item) => {
    const key = String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

createRoot(document.getElementById('root')!).render(<App />);
