import { buildNewsId } from './newsIds';
import { resolveNewsImage } from './newsImages';

const GUARDIAN_SEARCH_URL = 'https://content.guardianapis.com/search';
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY || 'test';
const DEFAULT_QUERY =
  import.meta.env.VITE_GUARDIAN_QUERY || '(law OR legal OR court OR justice OR constitution OR rights)';

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
    .filter((text) => text.length > 20);
  if (paragraphs.length) return paragraphs.join('\n\n');

  return cleanText(doc.body?.textContent || '');
};

const makeExcerpt = (text) => {
  const source = cleanText(text);
  if (!source) return "Qisqacha ma'lumot mavjud emas.";
  if (source.length <= 180) return source;
  return `${source.slice(0, 180).trim()}...`;
};

const estimateReadTime = (text) => {
  const words = cleanText(text).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
};

const sectionToCategory = (sectionName) => {
  const key = cleanText(sectionName).toLowerCase();
  if (key.includes('law') || key.includes('legal') || key.includes('court')) return 'court';
  if (key.includes('politics') || key.includes('government')) return 'legislation';
  return 'general';
};

const normalizeGuardianItem = (raw = {}, index = 0) => {
  const fields = raw.fields || {};
  const bodyText = htmlToText(fields.body || '');
  const trail = htmlToText(fields.trailText || '');
  const title = raw.webTitle || fields.headline || "Huquqiy yangilik";
  const externalUrl = raw.webUrl || '';
  const id = buildNewsId({
    rawId: raw.id,
    title,
    externalUrl,
    index,
  });

  const content = bodyText || trail || title;
  return {
    id,
    guardianId: String(raw.id || ''),
    title,
    excerpt: makeExcerpt(trail || content),
    content,
    contentHtml: String(fields.body || ''),
    category: sectionToCategory(raw.sectionName),
    image: resolveNewsImage(
      {
        image: fields.thumbnail,
        content: fields.body,
        summary: fields.trailText,
      },
      id
    ),
    author: fields.byline || 'The Guardian',
    date: raw.webPublicationDate || new Date().toISOString(),
    readTime: estimateReadTime(content),
    externalUrl,
    source: 'guardian',
  };
};

export async function fetchGuardianLegalNews({ limit = 20, query = DEFAULT_QUERY, signal } = {}) {
  const params = new URLSearchParams({
    q: query,
    'show-fields': 'headline,trailText,body,thumbnail,byline',
    'order-by': 'newest',
    'page-size': String(Math.max(1, Math.min(limit, 50))),
    'api-key': GUARDIAN_API_KEY,
  });

  const response = await fetch(`${GUARDIAN_SEARCH_URL}?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`Guardian API xatosi: ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  const list = payload?.response?.results;
  if (!Array.isArray(list)) return [];

  return list.map(normalizeGuardianItem);
}
