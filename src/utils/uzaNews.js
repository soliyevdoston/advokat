import { buildNewsId } from './newsIds';
import { pickNewsFallbackImage } from './newsImages';
import { buildApiUrl } from '../config/appConfig';

const UZA_API_ROOT = import.meta.env.VITE_UZA_API_ROOT || 'https://api.uza.uz/api/v1';
const UZA_LANG = import.meta.env.VITE_UZA_NEWS_LANG || 'oz';
const BACKEND_NEWS_ENDPOINTS = ['/list/news', '/list', '/list%20/news', '/list%20'];

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const htmlToText = (html) => {
  const source = String(html || '').trim();
  if (!source) return '';

  if (typeof DOMParser === 'undefined') {
    return cleanText(source.replace(/<[^>]+>/g, ' '));
  }

  const doc = new DOMParser().parseFromString(source, 'text/html');
  doc.querySelectorAll('script,style,noscript,iframe').forEach((node) => node.remove());
  const paragraphs = [...doc.querySelectorAll('p')]
    .map((p) => cleanText(p.textContent))
    .filter((text) => text.length > 10);

  if (paragraphs.length) return paragraphs.join('\n\n');
  return cleanText(doc.body?.textContent || '');
};

const makeExcerpt = (text) => {
  const source = cleanText(text);
  if (!source) return "Qisqacha ma'lumot mavjud emas.";
  if (source.length <= 190) return source;
  return `${source.slice(0, 190).trim()}...`;
};

const estimateReadTime = (text) => {
  const words = cleanText(text).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
};

const buildUzaImageUrl = (files, seed = '') => {
  const file = files && typeof files === 'object' ? files : {};
  const domain = String(file.domain || '').trim();
  const folder = String(file.folder || '').trim();
  const fileName = String(file.file || '').trim();

  if (domain && folder && fileName) {
    return `${domain}${folder}${fileName}`;
  }

  return pickNewsFallbackImage(seed || file.slug || file.id);
};

const normalizeUzaItem = (raw = {}, index = 0) => {
  const rawId = raw.id || raw.slug || raw.old_id;
  const title = raw.title || "Yangi yangilik";
  const externalUrl = raw.slug ? `https://uza.uz/oz/posts/${raw.slug}` : '';
  const id = buildNewsId({
    rawId,
    title,
    externalUrl,
    index,
  });

  const textContent = htmlToText(raw.content || raw.description || '');
  const categoryTitle = raw.category?.title || raw.category?.slug || '';

  return {
    id,
    uzaId: String(raw.id || ''),
    uzaSlug: String(raw.slug || ''),
    title,
    excerpt: makeExcerpt(raw.description || textContent),
    content: textContent,
    category: String(raw.category?.slug || raw.category_id || 'general').toLowerCase(),
    categoryTitle: cleanText(categoryTitle),
    image: buildUzaImageUrl(raw.files, id),
    author: 'UZA.uz',
    date: raw.publish_time || raw.created_at || raw.updated_at || new Date().toISOString(),
    readTime: estimateReadTime(textContent || raw.description || ''),
    externalUrl,
    source: 'uza',
  };
};

const normalizeBackendNewsItem = (raw = {}, index = 0) => {
  const rawId = raw.id || raw._id || raw.news_id || raw.slug || raw.uuid;
  const title = cleanText(raw.title || raw.name || 'Yangi yangilik');
  const contentText = htmlToText(raw.content || raw.body || raw.text || raw.description || '');
  const excerpt = makeExcerpt(raw.excerpt || raw.summary || contentText);
  const externalUrl = String(raw.externalUrl || raw.link || raw.url || '').trim();
  const id = buildNewsId({
    rawId,
    title,
    externalUrl,
    index,
  });

  return {
    id,
    title,
    excerpt,
    content: contentText || excerpt,
    category: String(raw.category || raw.type || 'general').toLowerCase(),
    categoryTitle: cleanText(raw.categoryTitle || raw.category_name || ''),
    image: raw.image || raw.imageUrl || raw.photo || pickNewsFallbackImage(id),
    author: cleanText(raw.author || raw.source || 'LegalLink'),
    date: raw.date || raw.published_at || raw.created_at || raw.updated_at || new Date().toISOString(),
    readTime: estimateReadTime(contentText || excerpt),
    externalUrl,
    source: 'backend',
  };
};

const extractBackendNewsList = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.news || payload?.items || payload?.data || payload?.list || []);

  return Array.isArray(list) ? list : [];
};

const buildEndpointWithLimit = (endpoint, limit) => {
  const suffix = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${suffix}limit=${encodeURIComponent(String(limit))}`;
};

async function fetchBackendNews({ limit = 20, signal } = {}) {
  let lastError = null;

  for (const endpoint of BACKEND_NEWS_ENDPOINTS) {
    try {
      const response = await fetch(buildApiUrl(buildEndpointWithLimit(endpoint, Math.max(1, Math.min(limit, 50)))), { signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(payload?.message || payload?.error || `Backend news API xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const list = extractBackendNewsList(payload).map((item, index) => normalizeBackendNewsItem(item, index));
      if (list.length) return list;
    } catch (err) {
      lastError = err;
      if (err?.name === 'AbortError') throw err;
      if (err?.status === 404 || err?.status === 405) continue;
    }
  }

  throw lastError || new Error('Backend yangilik endpoint topilmadi');
}

async function fetchBackendNewsDetail({ id, signal } = {}) {
  const key = String(id || '').trim();
  if (!key) throw new Error('Yangilik identifikatori topilmadi');

  const encoded = encodeURIComponent(key);
  const endpoints = [
    `/list/news/${encoded}`,
    `/list/${encoded}`,
    `/list%20/news/${encoded}`,
    `/list%20/${encoded}`,
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(buildApiUrl(endpoint), { signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(payload?.message || payload?.error || `Backend detail API xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const direct = payload?.news || payload?.item || payload?.data || payload;
      return normalizeBackendNewsItem(direct, 0);
    } catch (err) {
      lastError = err;
      if (err?.name === 'AbortError') throw err;
      if (err?.status === 404 || err?.status === 405) continue;
    }
  }

  throw lastError || new Error('Backend detail endpoint topilmadi');
}

export async function fetchUzaNews({ limit = 20, signal } = {}) {
  try {
    const backendList = await fetchBackendNews({ limit, signal });
    if (backendList.length) return backendList;
  } catch {
    // backend endpoint bo'lmasa UZA API orqali davom etamiz
  }

  const params = new URLSearchParams({
    limit: String(Math.max(1, Math.min(limit, 50))),
    _f: 'json',
    _l: UZA_LANG,
  });

  const response = await fetch(`${UZA_API_ROOT}/posts?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`UZA API xatosi: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  const list = Array.isArray(payload?.data) ? payload.data : [];
  return list.map(normalizeUzaItem);
}

export async function fetchUzaNewsDetail({ id, slug, signal } = {}) {
  try {
    return await fetchBackendNewsDetail({ id: id || slug, signal });
  } catch {
    // backend detail endpoint bo'lmasa UZA detail orqali davom etamiz
  }

  const key = String(id || slug || '').trim();
  if (!key) throw new Error('UZA detail uchun id yoki slug kerak');

  const params = new URLSearchParams({
    _f: 'json',
    _l: UZA_LANG,
  });

  const response = await fetch(`${UZA_API_ROOT}/posts/${encodeURIComponent(key)}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`UZA detail API xatosi: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  return normalizeUzaItem(payload, 0);
}
