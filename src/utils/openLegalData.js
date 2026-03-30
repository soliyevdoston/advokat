const OPEN_DATA_BASE_URL = 'https://data.egov.uz';
const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

const LEGAL_SPHERE_IDS = [
  '607ff4ba7b6428eee08802c2', // Adliya va sud
  '607ff3e67b6428eee08802bf', // Huquqbuzarlik
];

const KEYWORD_GROUPS = {
  constitution: /(konstit|constitution|qomus|asosiy qonun)/i,
  decisions: /(qaror|sud qaror|decision|judgment|hukm|ruling|precedent|sud)/i,
  legalNews: /(yangilik|news|xabar|axborot|press|matbuot)/i,
  international: /(xalqaro|international|human rights|inson huquq|konvensiya|treaty)/i,
};

const GDELT_QUERY_LEGAL_NEWS = '((Uzbekistan OR O\'zbekiston OR Ozbekiston) AND (law OR legal OR constitution OR regulation OR sud OR qaror))';
const GDELT_QUERY_DECISIONS = '((court OR judgment OR decision OR ruling OR sud qarori) AND (Uzbekistan OR O\'zbekiston OR Ozbekiston))';

const OFFICIAL_CONSTITUTION_DATASETS = [
  {
    id: 'constitution_uz_official',
    code: 'constitution.uz',
    title: 'O\'zbekiston Respublikasi Konstitutsiyasi (rasmiy portal)',
    organization: 'constitution.uz',
    sphere: 'Konstitutsiya',
    updatedAt: null,
    publishedAt: null,
    url: 'https://constitution.uz/en/pages/constitution',
    focus: 'constitution',
    score: 3,
    source: 'official',
    summary: 'Konstitutsiya bo\'yicha rasmiy matn va yangilangan tahrir.',
  },
  {
    id: 'lex_uz_constitution',
    code: 'lex.uz',
    title: 'Lex.uz: Konstitutsiya va normativ hujjatlar qidiruvi',
    organization: 'lex.uz',
    sphere: 'Normativ-huquqiy baza',
    updatedAt: null,
    publishedAt: null,
    url: 'https://lex.uz/search/all?query=konstitutsiya',
    focus: 'constitution',
    score: 3,
    source: 'official',
    summary: 'Konstitutsiya va unga aloqador normativ hujjatlarni qidirish sahifasi.',
  },
  {
    id: 'dataegov_court_decisions',
    code: 'data.egov.uz',
    title: 'Sud qarorlari to‘g‘risidagi ochiq data to‘plami',
    organization: 'data.egov.uz',
    sphere: 'Sud amaliyoti',
    updatedAt: null,
    publishedAt: null,
    url: 'https://data.egov.uz/data/60fb9f382a2e256d868e8260',
    focus: 'decisions',
    score: 3,
    source: 'official',
    summary: 'Sud qarorlari bo‘yicha ochiq ma’lumotlar sahifasi.',
  },
  {
    id: 'eqaror_search',
    code: 'e-qaror.gov.uz',
    title: 'E-qaror hujjat va qarorlar qidiruvi',
    organization: 'e-qaror.gov.uz',
    sphere: 'Hokimlik qarorlari',
    updatedAt: null,
    publishedAt: null,
    url: 'https://e-qaror.gov.uz/search',
    focus: 'decisions',
    score: 3,
    source: 'official',
    summary: 'Mahalliy davlat hokimiyati hujjatlari va qarorlarini qidirish.',
  },
  {
    id: 'adliya_news',
    code: 'adliya.uz',
    title: 'Adliya vazirligi yuridik yangiliklari',
    organization: 'adliya.uz',
    sphere: 'Huquqiy yangiliklar',
    updatedAt: null,
    publishedAt: null,
    url: 'https://adliya.uz/uz/news',
    focus: 'legal_news',
    score: 2,
    source: 'official',
    summary: 'Adliya tizimi bo‘yicha rasmiy yangiliklar.',
  },
];

const toDateValue = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const pickLocaleText = (multilang = {}) => (
  multilang?.uzbText
  || multilang?.uzbKrText
  || multilang?.rusText
  || multilang?.engText
  || ''
);

const parseDomain = (value) => {
  const text = String(value || '').trim();
  if (!text) return 'Noma\'lum manba';

  try {
    return new URL(text).hostname.replace(/^www\./, '');
  } catch {
    return 'Noma\'lum manba';
  }
};

const parseGdeltDate = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;

  const match = text.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!match) {
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const [, year, month, day, hour, minute, second] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const resolveFocus = (title) => {
  const source = String(title || '').toLowerCase();

  if (KEYWORD_GROUPS.constitution.test(source)) {
    return 'constitution';
  }

  if (KEYWORD_GROUPS.decisions.test(source)) {
    return 'decisions';
  }

  if (KEYWORD_GROUPS.legalNews.test(source)) {
    return 'legal_news';
  }

  if (KEYWORD_GROUPS.international.test(source)) {
    return 'international';
  }

  return 'general';
};

const scoreByFocus = (focus) => {
  if (focus === 'constitution') return 3;
  if (focus === 'decisions') return 3;
  if (focus === 'legal_news') return 2;
  if (focus === 'international') return 2;
  return 1;
};

const mapDataset = (raw = {}) => {
  const title = pickLocaleText(raw.dataName);
  const focus = resolveFocus(title);

  return {
    id: String(raw.structId || raw.name || Math.random().toString(16).slice(2)),
    code: String(raw.name || ''),
    title: title || "Huquqiy ma'lumotlar to'plami",
    organization: pickLocaleText(raw.orgName) || "Noma'lum tashkilot",
    sphere: pickLocaleText(raw.sphereName) || 'Huquqiy soha',
    updatedAt: raw.lastUpdate || raw.updateDate || null,
    publishedAt: raw.createDate || raw.lastUpdate || null,
    url: raw.structId ? `${OPEN_DATA_BASE_URL}/data/${raw.structId}` : OPEN_DATA_BASE_URL,
    focus,
    score: scoreByFocus(focus),
    source: 'data.egov.uz',
    summary: `Ochiq data to'plami: ${title || "Huquqiy ma'lumot"}`,
  };
};

const mapGdeltArticle = (raw = {}, index = 0, defaultFocus = 'legal_news') => {
  const title = String(raw.title || '').trim() || `Huquqiy yangilik #${index + 1}`;
  const publishedAt = parseGdeltDate(raw.seendate || raw.seendatefull || raw.date);
  const focus = resolveFocus(title) === 'general' ? defaultFocus : resolveFocus(title);
  const domain = parseDomain(raw.url || raw.domain || raw.url_mobile);
  const description = String(raw.seendate || '').trim();

  return {
    id: String(raw.url || raw.url_mobile || `gdelt_${defaultFocus}_${index}_${Date.now()}`),
    code: '',
    title,
    organization: domain,
    sphere: defaultFocus === 'decisions' ? 'Sud qarorlari va precedentlar' : 'Huquqiy yangiliklar',
    updatedAt: publishedAt,
    publishedAt,
    url: raw.url || raw.url_mobile || 'https://api.gdeltproject.org/',
    focus,
    score: scoreByFocus(focus),
    source: 'api.gdeltproject.org',
    summary: description ? `GDELT kuzatuv vaqti: ${description}` : 'Global ochiq yangiliklar API manbasi.',
    image: raw.socialimage || raw.image || null,
  };
};

async function fetchSphereDatasets(sphereId, { signal, limit = 30 } = {}) {
  const params = new URLSearchParams({
    offset: '0',
    limit: String(limit),
    sphereId: String(sphereId),
    sortType: '2',
  });

  const response = await fetch(`${OPEN_DATA_BASE_URL}/apiClient/main/gettable?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Open data xatosi: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  const list = payload?.result?.data;
  return Array.isArray(list) ? list : [];
}

async function fetchGdeltArticles({ query, maxrecords = 20, signal, focus = 'legal_news' } = {}) {
  const params = new URLSearchParams({
    query: String(query || '').trim(),
    mode: 'ArtList',
    maxrecords: String(maxrecords),
    format: 'json',
    sort: 'DateDesc',
  });

  const response = await fetch(`${GDELT_API_URL}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`GDELT API xatosi: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  const list = Array.isArray(payload?.articles) ? payload.articles : [];

  return list.map((item, index) => mapGdeltArticle(item, index, focus));
}

const sortAndLimit = (items, limit = 10) => {
  const unique = new Map();

  items.forEach((item) => {
    const key = String(item.id || `${item.url}_${item.title}`);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return toDateValue(b.updatedAt || b.publishedAt) - toDateValue(a.updatedAt || a.publishedAt);
    })
    .slice(0, limit);
};

export async function fetchOpenLegalDatasets(options = {}) {
  const { signal, limit = 10 } = options;

  const sphereResults = await Promise.allSettled(
    LEGAL_SPHERE_IDS.map((sphereId) => fetchSphereDatasets(sphereId, { signal }))
  );

  const merged = sphereResults
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value)
    .map(mapDataset);

  if (merged.length) {
    return sortAndLimit([...merged, ...OFFICIAL_CONSTITUTION_DATASETS], limit);
  }

  // Agar data.egov vaqtincha ishlamasa, GDELT fallback orqali bo'limni bo'sh qoldirmaymiz.
  const [newsResult, decisionResult] = await Promise.allSettled([
    fetchGdeltArticles({ query: GDELT_QUERY_LEGAL_NEWS, maxrecords: 20, signal, focus: 'legal_news' }),
    fetchGdeltArticles({ query: GDELT_QUERY_DECISIONS, maxrecords: 20, signal, focus: 'decisions' }),
  ]);

  const fallback = [
    ...(newsResult.status === 'fulfilled' ? newsResult.value : []),
    ...(decisionResult.status === 'fulfilled' ? decisionResult.value : []),
    ...OFFICIAL_CONSTITUTION_DATASETS,
  ];

  return sortAndLimit(fallback, limit);
}

export async function fetchOpenLegalDecisions(options = {}) {
  const { limit = 8, signal } = options;
  const items = await fetchOpenLegalDatasets({ limit: 80, signal });

  const primary = items.filter((item) => item.focus === 'decisions');
  if (primary.length >= limit) return primary.slice(0, limit);

  try {
    const gdelt = await fetchGdeltArticles({
      query: GDELT_QUERY_DECISIONS,
      maxrecords: Math.max(limit * 2, 12),
      signal,
      focus: 'decisions',
    });

    return sortAndLimit([...primary, ...gdelt], limit);
  } catch {
    return primary.slice(0, limit);
  }
}

export async function fetchOpenLegalNews(options = {}) {
  const { limit = 8, signal } = options;

  let gdeltNews = [];
  try {
    gdeltNews = await fetchGdeltArticles({
      query: GDELT_QUERY_LEGAL_NEWS,
      maxrecords: Math.max(limit * 2, 12),
      signal,
      focus: 'legal_news',
    });
  } catch {
    gdeltNews = [];
  }

  const datasets = await fetchOpenLegalDatasets({ limit: 60, signal });
  const legalNews = datasets.filter((item) => item.focus === 'legal_news');
  const legalFallback = datasets.filter((item) => item.focus === 'general' || item.focus === 'international');

  return sortAndLimit([...gdeltNews, ...legalNews, ...legalFallback], limit);
}

export const OPEN_LEGAL_APIS = [
  `${OPEN_DATA_BASE_URL}/apiClient/main/gettable?offset=0&limit=30&sphereId=<ID>&sortType=2`,
  `${GDELT_API_URL}?query=<QUERY>&mode=ArtList&maxrecords=20&format=json&sort=DateDesc`,
  'https://constitution.uz/en/pages/constitution',
  'https://lex.uz/search/all?query=konstitutsiya',
];
