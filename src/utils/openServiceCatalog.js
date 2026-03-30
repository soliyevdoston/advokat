import { fetchOpenLegalDatasets } from './openLegalData';

const CACHE_KEY = 'legallink_open_service_catalog_v1';
const CACHE_TTL_MS = 1000 * 60 * 30;

export const SERVICE_IDS = ['protection', 'consultation', 'business', 'documents', 'international', 'labor'];

export const SERVICE_MATCHERS = {
  protection: /(sud|qaror|huquqbuz|jinoyat|fuqarolik|iqtisodiy sud|prokur|ruling|judgment)/i,
  consultation: /(maslahat|murojaat|onlayn|qabul|call|chat|axborot|help)/i,
  business: /(biznes|tadbirkor|korxona|kompani|shartnoma|soliq|litsenziya|company)/i,
  documents: /(hujjat|ariza|blank|shablon|form|document|davlat xizmat)/i,
  international: /(xalqaro|international|konvens|treaty|human rights|migration)/i,
  labor: /(mehnat|bandlik|ish beruvchi|xodim|employment|labor)/i,
};

const SERVICE_FALLBACKS = {
  protection: {
    sourceOrg: 'e-qaror.gov.uz',
    sourceTitle: 'Sud va qarorlar qidiruvi',
    sourceUrl: 'https://e-qaror.gov.uz/search',
  },
  consultation: {
    sourceOrg: 'adliya.uz',
    sourceTitle: 'Yuridik yangilik va murojaatlar sahifasi',
    sourceUrl: 'https://adliya.uz/uz/news',
  },
  business: {
    sourceOrg: 'lex.uz',
    sourceTitle: 'Biznes va shartnoma bo‘yicha hujjatlar qidiruvi',
    sourceUrl: 'https://lex.uz/search/all?query=biznes%20shartnoma',
  },
  documents: {
    sourceOrg: 'lex.uz',
    sourceTitle: 'Hujjat va arizalar bo‘yicha normativ baza',
    sourceUrl: 'https://lex.uz/search/all?query=hujjat%20ariza',
  },
  international: {
    sourceOrg: 'lex.uz',
    sourceTitle: 'Xalqaro huquq va konvensiyalar qidiruvi',
    sourceUrl: 'https://lex.uz/search/all?query=xalqaro%20huquq',
  },
  labor: {
    sourceOrg: 'lex.uz',
    sourceTitle: 'Mehnat huquqi bo‘yicha normativ qidiruv',
    sourceUrl: 'https://lex.uz/search/all?query=mehnat%20huquqi',
  },
};

export const SERVICE_SPECIALIZATION_MAP = {
  protection: 'criminal',
  consultation: 'civil',
  business: 'business',
  documents: 'civil',
  international: 'international',
  labor: 'labor',
};

const toDateValue = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.expireAt || Date.now() > Number(parsed.expireAt)) return null;
    if (!Array.isArray(parsed.items)) return null;
    return parsed.items;
  } catch {
    return null;
  }
};

const writeCache = (items) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        expireAt: Date.now() + CACHE_TTL_MS,
        items,
      })
    );
  } catch {
    // ignore cache write errors
  }
};

const pickDatasetForService = (serviceId, datasets) => {
  if (!Array.isArray(datasets) || !datasets.length) return null;

  const matched = datasets.filter((item) => matchDatasetToService(serviceId, item));

  if (!matched.length) return null;

  return [...matched].sort((a, b) => {
    const scoreA = Number(a.score || 0);
    const scoreB = Number(b.score || 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return toDateValue(b.updatedAt || b.publishedAt) - toDateValue(a.updatedAt || a.publishedAt);
  })[0];
};

export const matchDatasetToService = (serviceId, dataset = {}) => {
  const matcher = SERVICE_MATCHERS[serviceId];
  if (!matcher) return false;
  const title = String(dataset.title || '');
  const org = String(dataset.organization || '');
  const sphere = String(dataset.sphere || '');
  return matcher.test(`${title} ${org} ${sphere}`);
};

const mapServiceSource = (serviceId, dataset) => {
  const fallback = SERVICE_FALLBACKS[serviceId];
  if (!fallback) return null;

  if (!dataset) {
    return {
      id: serviceId,
      sourceOrg: fallback.sourceOrg,
      sourceTitle: fallback.sourceTitle,
      sourceUrl: fallback.sourceUrl,
      updatedAt: null,
      sourceType: 'fallback',
    };
  }

  return {
    id: serviceId,
    sourceOrg: String(dataset.organization || fallback.sourceOrg || 'Nomaʼlum manba'),
    sourceTitle: String(dataset.title || fallback.sourceTitle || 'Huquqiy manba'),
    sourceUrl: String(dataset.url || fallback.sourceUrl || '#'),
    updatedAt: dataset.updatedAt || dataset.publishedAt || null,
    sourceType: 'api',
  };
};

export async function fetchOpenServiceCatalog({ signal, force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached?.length) return cached;
  }

  let datasets = [];
  try {
    datasets = await fetchOpenLegalDatasets({ limit: 80, signal });
  } catch {
    datasets = [];
  }

  const items = SERVICE_IDS.map((serviceId) => {
    const bestDataset = pickDatasetForService(serviceId, datasets);
    return mapServiceSource(serviceId, bestDataset);
  }).filter(Boolean);

  writeCache(items);
  return items;
}
