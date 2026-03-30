import { buildNewsId } from './newsIds';
import { pickNewsFallbackImage } from './newsImages';

const UZA_API_ROOT = import.meta.env.VITE_UZA_API_ROOT || 'https://api.uza.uz/api/v1';
const UZA_LANG = import.meta.env.VITE_UZA_NEWS_LANG || 'oz';

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

export async function fetchUzaNews({ limit = 20, signal } = {}) {
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
