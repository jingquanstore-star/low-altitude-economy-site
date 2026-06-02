export type RegionKey = 'china' | 'us' | 'europe' | 'middleEast' | 'southEastAsia';
export type NewsCategory = '政策' | '商业化' | '适航' | '基建' | '技术' | '融资';
export type NewsPriority = '重点跟踪' | '观察';

export type Region = {
  key: RegionKey;
  name: string;
  label: string;
  coordinates: { left: string; top: string };
  summary: string;
  signals: string[];
  risks: string[];
};

export type NewsItem = {
  id: number;
  region: RegionKey;
  country: string;
  category: NewsCategory;
  priority: NewsPriority;
  sourceType: '官方发布' | '地方政府' | '企业公告' | '主流媒体' | '行业媒体' | '自媒体观察' | '研究报告';
  credibility: '高' | '中高' | '中' | '待核验';
  cacheMode: '摘要缓存' | '标题与摘要缓存' | '人工核验';
  date: string;
  title: string;
  summary: string;
  source: string;
  url: string;
};

export type QuantRegion = {
  region: RegionKey;
  listedMarketCapUsdB: number | null;
  listedSampleCount: number;
  marketPotential: string;
  marketPotentialNote: string;
  trackedCompanies: number;
  activeSectors: string[];
  dataCaveat: string;
};

export type ListedCompanySample = {
  ticker: string;
  name: string;
  region: RegionKey;
  marketCapUsdB: number;
  sharePriceUsd: number;
  track: string;
};

export type MarketSource = {
  title: string;
  value: string;
  source: string;
  url: string;
};

export type Company = {
  name: string;
  region: RegionKey;
  track: string;
  status: string;
};

export const regions: Region[] = [
  {
    key: 'china',
    name: '中国',
    label: '中国市场',
    coordinates: { left: '73%', top: '47%' },
    summary: '政策牵引强、城市试点密集，物流、文旅、应急和载人电动垂直起降飞行器形成多线推进。',
    signals: ['地方低空经济专班增加', '无人机物流和文旅航线增长', '电动垂直起降飞行器适航与示范运行提速'],
    risks: ['跨城空域协同仍复杂', '运营安全标准需要更统一', '商业闭环依赖场景密度'],
  },
  {
    key: 'us',
    name: '美国',
    label: '美国市场',
    coordinates: { left: '24%', top: '42%' },
    summary: '美国联邦航空管理局与美国国家航空航天局长期推动先进空中交通，企业在适航、订单、机场接入和城市试点上持续推进。',
    signals: ['美国联邦航空管理局路线图清晰', '电动垂直起降飞行器企业资本与订单活跃', '机场和垂直起降场标准讨论升温'],
    risks: ['适航周期长', '社区噪声与城市接纳度', '制造爬坡和现金流压力'],
  },
  {
    key: 'europe',
    name: '欧洲',
    label: '欧洲市场',
    coordinates: { left: '51%', top: '39%' },
    summary: '监管体系较细，U-space 和城市空中交通规则成熟，但商业化节奏偏审慎。',
    signals: ['欧洲航空安全局规则框架完善', '无人机空域服务试点推进', '城市交通一体化讨论充分'],
    risks: ['跨国协调成本高', '企业资金压力', '示范到规模化周期较长'],
  },
  {
    key: 'middleEast',
    name: '中东',
    label: '中东市场',
    coordinates: { left: '58%', top: '51%' },
    summary: '迪拜、沙特等以智慧城市和大型活动场景导入，适合先做高端出行示范。',
    signals: ['政府采购和示范意愿强', '旅游与商务出行场景清晰', '基础设施可集中规划'],
    risks: ['长期需求密度待验证', '极端气候考验电池与运维', '依赖外部整机供应'],
  },
  {
    key: 'southEastAsia',
    name: '东南亚',
    label: '东南亚市场',
    coordinates: { left: '70%', top: '61%' },
    summary: '岛屿、物流、应急和旅游具备天然需求，但监管和基础设施仍在早期。',
    signals: ['海岛物流需求明显', '旅游飞行想象空间大', '农业和巡检场景可先规模化'],
    risks: ['监管碎片化', '支付能力差异大', '起降与维修网络不足'],
  },
];

export const newsItems: NewsItem[] = [
  {
    id: 1,
    region: 'china',
    country: '中国',
    category: '政策',
    priority: '重点跟踪',
    sourceType: '官方发布',
    credibility: '高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-10',
    title: '低空经济进入地方产业规划核心议题',
    summary: '多个城市把低空经济纳入产业招商、空域试点和基础设施规划，政策信号继续强化。',
    source: '中国政府网 / 地方政府公开信息',
    url: 'https://www.gov.cn/',
  },
  {
    id: 2,
    region: 'us',
    country: '美国',
    category: '适航',
    priority: '重点跟踪',
    sourceType: '官方发布',
    credibility: '高',
    cacheMode: '摘要缓存',
    date: '2026-05-07',
    title: '美国联邦航空管理局先进空中交通路线图继续影响电动垂直起降飞行器商业化时间表',
    summary: '适航、运行规则、机场接入和飞行员训练仍是美国先进空中交通商业落地的关键门槛。',
    source: '美国联邦航空管理局先进空中交通',
    url: 'https://www.faa.gov/AAM',
  },
  {
    id: 3,
    region: 'china',
    country: '中国',
    category: '商业化',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-04-28',
    title: '低空文旅、城市巡检、无人机物流成为近期高频应用',
    summary: '相较于载人空中出租车，非载人和轻载场景更容易形成早期收入和运营数据。',
    source: '民航局 / 企业公告 / 地方新闻',
    url: 'https://www.caac.gov.cn/',
  },
  {
    id: 4,
    region: 'us',
    country: '美国',
    category: '基建',
    priority: '重点跟踪',
    sourceType: '官方发布',
    credibility: '高',
    cacheMode: '摘要缓存',
    date: '2026-04-20',
    title: '机场、城市起降点与充电设施成为先进空中交通基建焦点',
    summary: '美国路径更强调既有机场网络、社区影响评估和垂直起降场规范化设计。',
    source: '美国联邦航空管理局先进空中交通基础设施',
    url: 'https://www.faa.gov/airports/new_entrants/aam_infrastructure',
  },
  {
    id: 5,
    region: 'europe',
    country: '欧洲',
    category: '政策',
    priority: '观察',
    sourceType: '官方发布',
    credibility: '高',
    cacheMode: '摘要缓存',
    date: '2026-04-15',
    title: '欧洲继续以无人机空域服务与城市空中交通规则牵引市场',
    summary: '欧洲监管更细，适合观察复杂空域下的无人机和载人航空融合管理经验。',
    source: '欧洲航空安全局城市空中交通',
    url: 'https://www.easa.europa.eu/en/domains/drones-air-mobility/topics/urban-air-mobility-uam',
  },
  {
    id: 6,
    region: 'us',
    country: '美国',
    category: '技术',
    priority: '重点跟踪',
    sourceType: '官方发布',
    credibility: '高',
    cacheMode: '摘要缓存',
    date: '2026-04-02',
    title: '美国国家航空航天局先进空中交通研究继续提供噪声、空域和运营仿真参考',
    summary: '美国国家航空航天局的先进空中交通研究对城市接纳度、飞行网络仿真和安全评估具有长期参考价值。',
    source: '美国国家航空航天局先进空中交通',
    url: 'https://www.nasa.gov/mission/advanced-air-mobility/',
  },
  {
    id: 101,
    region: 'china',
    country: '中国',
    category: '适航',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-20',
    title: '亿航智能围绕 EH216-S 推进载人无人驾驶航空器商业运营',
    summary: '亿航智能是中国低空载人飞行器商业化观察样本，适航、生产和运营资质进展决定后续文旅与城市空中交通放量节奏。',
    source: '亿航智能公开信息',
    url: 'https://www.ehang.com/cn/',
  },
  {
    id: 102,
    region: 'china',
    country: '中国',
    category: '适航',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-18',
    title: '峰飞航空大型电动垂直起降飞行器聚焦货运和城际物流',
    summary: '峰飞航空以吨级货运电动垂直起降飞行器为核心切入，适合观察低空物流、海岛运输和应急配送的早期商业闭环。',
    source: '峰飞航空公开信息',
    url: 'https://www.autoflight.com/',
  },
  {
    id: 103,
    region: 'china',
    country: '中国',
    category: '商业化',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-16',
    title: '小鹏汇天飞行汽车路线强化低空经济消费端想象空间',
    summary: '小鹏汇天的分体式飞行汽车路线更偏消费产品与低空出行入口，关键变量是量产节奏、场景开放和驾驶培训体系。',
    source: '小鹏汇天公开信息',
    url: 'https://www.aeroht.com/',
  },
  {
    id: 104,
    region: 'china',
    country: '中国',
    category: '适航',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-15',
    title: '沃飞长空 AE200 推进载人电动垂直起降飞行器适航验证',
    summary: '沃飞长空处于中国载人电动垂直起降飞行器的重要梯队，后续看适航验证、订单转化和运营伙伴落地。',
    source: '沃飞长空公开信息',
    url: 'https://www.aerofugia.com/',
  },
  {
    id: 105,
    region: 'china',
    country: '中国',
    category: '技术',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-14',
    title: '沃兰特和时的科技等创业公司延展中国载人低空出行梯队',
    summary: '复合翼载人电动垂直起降飞行器创业公司持续推进试飞、融资和适航准备，是观察中国低空出行供给侧的重要线索。',
    source: '产业链企业公开信息',
    url: 'https://www.volantaero.com/',
  },
  {
    id: 106,
    region: 'china',
    country: '中国',
    category: '商业化',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-12',
    title: '大疆行业无人机和农业无人机仍是低空经济规模化基础盘',
    summary: '相较载人低空出行，行业无人机、农业无人机、巡检和测绘已经形成更成熟的产品和渠道，是现金流更清晰的低空经济底座。',
    source: '大疆行业应用公开信息',
    url: 'https://enterprise.dji.com/cn',
  },
  {
    id: 107,
    region: 'china',
    country: '中国',
    category: '商业化',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-11',
    title: '美团无人机、丰翼科技和迅蚁科技验证低空物流运营模型',
    summary: '即时配送、医疗配送、海岛和山地物流是中国低空经济更容易形成运营数据的场景，关键看航线密度、单均成本和监管协同。',
    source: '物流无人机企业公开信息',
    url: 'https://www.meituan.com/',
  },
  {
    id: 108,
    region: 'china',
    country: '中国',
    category: '商业化',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-06',
    title: '中信海直在通航运营和低空服务网络中具备存量优势',
    summary: '中信海直的直升机运营、海上油气服务和应急救援经验，使其成为从传统通航向低空经济过渡的重要上市样本。',
    source: '中信海直公开信息',
    url: 'https://www.cohc.citic/',
  },
  {
    id: 109,
    region: 'china',
    country: '中国',
    category: '基建',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-05',
    title: '莱斯信息等空管数字化公司受益于低空监管和运行平台需求',
    summary: '低空经济规模化离不开空域管理、飞行服务、态势感知和运行监管平台，空管信息化企业处在基础设施关键环节。',
    source: '莱斯信息公开信息',
    url: 'https://www.les.cn/',
  },
  {
    id: 110,
    region: 'china',
    country: '中国',
    category: '技术',
    priority: '重点跟踪',
    sourceType: '企业公告',
    credibility: '中高',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-02',
    title: '宁德时代等电池企业是电动垂直起降飞行器续航和安全的关键变量',
    summary: '电池能量密度、快充、热管理和安全冗余直接影响电动垂直起降飞行器航程、载荷与运营经济性。',
    source: '宁德时代公开信息',
    url: 'https://www.catl.com/',
  },
  {
    id: 111,
    region: 'china',
    country: '中国',
    category: '基建',
    priority: '重点跟踪',
    sourceType: '研究报告',
    credibility: '中',
    cacheMode: '标题与摘要缓存',
    date: '2026-05-01',
    title: '通信、导航、监视和气象能力决定低空基础设施真实承载力',
    summary: '低空经济不是单一飞行器产业，通信感知、导航定位、低空气象、起降场和运营平台共同决定商业化上限。',
    source: '产业链公开资料整理',
    url: 'https://www.gov.cn/',
  },
];

export const companies: Company[] = [
  { name: 'Joby Aviation', region: 'us', track: '载人电动垂直起降飞行器', status: '适航与商业化准备' },
  { name: 'Archer Aviation', region: 'us', track: '载人电动垂直起降飞行器', status: '订单、适航和机场合作' },
  { name: 'Wisk Aero', region: 'us', track: '自动驾驶电动垂直起降飞行器', status: '自动化运行路径' },
  { name: '亿航智能', region: 'china', track: '载人电动垂直起降飞行器', status: '适航与商业示范' },
  { name: '峰飞航空', region: 'china', track: '电动垂直起降飞行器 / 货运', status: '适航、试飞和订单拓展' },
  { name: '小鹏汇天', region: 'china', track: '飞行汽车', status: '消费级形态探索' },
  { name: 'Volocopter', region: 'europe', track: '载人电动垂直起降飞行器', status: '城市示范与资金压力并存' },
  { name: 'Vertiport operators', region: 'middleEast', track: '起降基础设施', status: '高端出行示范导入' },
];

export const quantRegions: QuantRegion[] = [
  {
    region: 'china',
    listedMarketCapUsdB: 1.18,
    listedSampleCount: 1,
    marketPotential: '2025 年 1.5 万亿元；2035 年 3.5 万亿元',
    marketPotentialNote: '中国低空经济规模预测，人民币口径。',
    trackedCompanies: 3,
    activeSectors: ['载人电动垂直起降飞行器', '无人机物流', '飞行汽车', '低空文旅'],
    dataCaveat: '上市样本仅含美股 EH，未覆盖未上市企业和 A 股产业链公司。',
  },
  {
    region: 'us',
    listedMarketCapUsdB: 14.31,
    listedSampleCount: 2,
    marketPotential: '全球城市空中交通 2030 年约 291.9 亿美元',
    marketPotentialNote: '美国对比使用全球城市空中交通预测作参照，不代表美国单一市场规模。',
    trackedCompanies: 3,
    activeSectors: ['载人电动垂直起降飞行器', '自动驾驶航空', '机场接入', '空域研究'],
    dataCaveat: '上市样本包含 JOBY、ACHR，未覆盖 Boeing/Wisk 等非独立上市主体。',
  },
  {
    region: 'europe',
    listedMarketCapUsdB: 0.54,
    listedSampleCount: 1,
    marketPotential: 'U-space 与城市空中交通规则牵引',
    marketPotentialNote: '欧洲更适合作为监管与 U-space 规则参照。',
    trackedCompanies: 1,
    activeSectors: ['无人机空域服务', '城市空中交通', '载人电动垂直起降飞行器'],
    dataCaveat: '上市样本仅含 EVTL，欧洲企业融资和退市/重组会显著影响可比性。',
  },
  {
    region: 'middleEast',
    listedMarketCapUsdB: null,
    listedSampleCount: 0,
    marketPotential: '高端出行、旅游和智慧城市示范',
    marketPotentialNote: '以项目导入和政府采购为主要观察口径。',
    trackedCompanies: 1,
    activeSectors: ['机场接驳', '旅游观光', '垂直起降场基建'],
    dataCaveat: '暂无稳定可比的本地上市电动垂直起降飞行器样本。',
  },
  {
    region: 'southEastAsia',
    listedMarketCapUsdB: null,
    listedSampleCount: 0,
    marketPotential: '岛屿物流、农业、旅游与应急场景',
    marketPotentialNote: '市场分散，适合按国家和场景拆分追踪。',
    trackedCompanies: 0,
    activeSectors: ['海岛物流', '农业植保', '低空旅游', '应急救援'],
    dataCaveat: '暂无统一公开市场规模口径，需后续按国家补数据。',
  },
];

export const listedCompanySamples: ListedCompanySample[] = [
  { ticker: 'JOBY', name: 'Joby Aviation', region: 'us', marketCapUsdB: 9.77, sharePriceUsd: 10.35, track: '载人电动垂直起降飞行器' },
  { ticker: 'ACHR', name: 'Archer Aviation', region: 'us', marketCapUsdB: 4.54, sharePriceUsd: 5.92, track: '载人电动垂直起降飞行器' },
  { ticker: 'EH', name: 'EHang', region: 'china', marketCapUsdB: 1.18, sharePriceUsd: 9.32, track: '自动驾驶载人航空器' },
  { ticker: 'EVTL', name: 'Vertical Aerospace', region: 'europe', marketCapUsdB: 0.54, sharePriceUsd: 2.43, track: '载人电动垂直起降飞行器' },
];

export const marketSources: MarketSource[] = [
  {
    title: '中国低空经济规模预测',
    value: '2025 年 1.5 万亿元；2035 年 3.5 万亿元',
    source: '公开报道转述中国民航局预测',
    url: 'https://finance.sina.com.cn/wm/2026-03-06/doc-inhpzeqs2623622.shtml',
  },
  {
    title: '全球城市空中交通市场预测',
    value: '2030 年约 291.9 亿美元',
    source: 'Grand View Research',
    url: 'https://www.grandviewresearch.com/horizon/outlook/urban-air-mobility-uam-market-size/global',
  },
  {
    title: '全球先进空中交通市场规模',
    value: '2024 年约 99 亿美元',
    source: 'IMARC Group',
    url: 'https://www.imarcgroup.com/advanced-air-mobility-market',
  },
];

export const sourcePlan = [
  { market: '中国优先', sources: ['中国政府网', '民航局 CAAC', '工信部', '地方发改委/交通委', '企业公告', '财联社/证券时报等产业新闻'] },
  { market: '美国优先', sources: ['FAA AAM', 'NASA AAM', 'DOT', 'NTSB 安全信息', '企业投资者关系', 'Aviation Week / eVTOL Insights'] },
  { market: '全球观察', sources: ['EASA', 'ICAO', 'GCAA / GACA', '机场集团公告', '主流财经与航空媒体'] },
];
