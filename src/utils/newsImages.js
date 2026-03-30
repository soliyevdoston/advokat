import { buildApiUrl } from '../config/appConfig';

const LEGAL_NEWS_FALLBACK_PAIRS = [
  ['#0f172a', '#1e3a8a'],
  ['#1f2937', '#164d88'],
  ['#111827', '#334155'],
  ['#1e1b4b', '#312e81'],
  ['#0b1324', '#1d4ed8'],
  ['#172554', '#1e40af'],
  ['#0f172a', '#0f766e'],
  ['#111827', '#155e75'],
];

const IMG_HTML_RE = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
const IMG_MD_RE = /!\[[^\]]*\]\(([^)]+)\)/i;

const toText = (value) => String(value || '').trim();

const normalizePossibleUrl = (value) => {
  const source = toText(value);
  if (!source) return '';

  if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('data:image/')) {
    return source.startsWith('http://') ? source.replace(/^http:\/\//i, 'https://') : source;
  }

  if (source.startsWith('//')) {
    return `https:${source}`;
  }

  if (source.startsWith('/')) {
    return buildApiUrl(source);
  }

  return buildApiUrl(`/${source}`);
};

const pickFirstString = (values = []) => {
  for (const value of values) {
    if (typeof value === 'string' && toText(value)) return value;
  }
  return '';
};

const pickImageFromMediaArray = (value) => {
  if (!Array.isArray(value) || !value.length) return '';
  const first = value[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    return pickFirstString([
      first.url,
      first.src,
      first.image,
      first.secure_url,
      first.path,
      first.thumbnail,
    ]);
  }
  return '';
};

const extractImageFromText = (value) => {
  const text = toText(value);
  if (!text) return '';

  const htmlMatch = text.match(IMG_HTML_RE);
  if (htmlMatch?.[1]) return htmlMatch[1];

  const mdMatch = text.match(IMG_MD_RE);
  if (mdMatch?.[1]) return mdMatch[1];

  return '';
};

const hashString = (value) => {
  const text = toText(value) || 'news';
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const pickNewsFallbackImage = (seed) => {
  const index = hashString(seed) % LEGAL_NEWS_FALLBACK_PAIRS.length;
  const [from, to] = LEGAL_NEWS_FALLBACK_PAIRS[index];
  const label = encodeURIComponent('Legal News');
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1400' height='900' viewBox='0 0 1400 900'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${from}' />
          <stop offset='100%' stop-color='${to}' />
        </linearGradient>
      </defs>
      <rect width='1400' height='900' fill='url(#g)' />
      <circle cx='1180' cy='120' r='190' fill='rgba(255,255,255,0.08)' />
      <circle cx='180' cy='760' r='230' fill='rgba(255,255,255,0.07)' />
      <text x='96' y='750' fill='rgba(255,255,255,0.9)' font-family='Segoe UI, Arial, sans-serif' font-size='74' font-weight='700'>${decodeURIComponent(label)}</text>
      <text x='96' y='806' fill='rgba(255,255,255,0.72)' font-family='Segoe UI, Arial, sans-serif' font-size='34'>LegalLink</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const resolveNewsImage = (raw = {}, seed = '') => {
  const direct = pickFirstString([
    raw.image,
    raw.imageUrl,
    raw.image_url,
    raw.thumbnail,
    raw.thumb,
    raw.photo,
    raw.photoUrl,
    raw.picture,
    raw.pictureUrl,
    raw.cover,
    raw.coverImage,
    raw.cover_image,
    raw.banner,
    raw.poster,
    raw.previewImage,
    raw.preview_image,
    raw.mainImage,
    raw.main_image,
    raw.heroImage,
    raw.hero_image,
    raw.featuredImage,
    raw.featured_image,
    raw.ogImage,
    raw.og_image,
    raw.socialimage,
    raw.socialImage,
  ]);

  const nested = pickFirstString([
    raw.media?.image,
    raw.media?.url,
    raw.media?.src,
    raw.media?.thumbnail,
    raw.assets?.image,
    raw.assets?.cover,
    raw.seo?.image,
    raw.meta?.image,
    pickImageFromMediaArray(raw.images),
    pickImageFromMediaArray(raw.attachments),
    pickImageFromMediaArray(raw.files),
    pickImageFromMediaArray(raw.gallery),
    pickImageFromMediaArray(raw.media),
  ]);

  const fromText = pickFirstString([
    extractImageFromText(raw.content),
    extractImageFromText(raw.body),
    extractImageFromText(raw.text),
    extractImageFromText(raw.description),
    extractImageFromText(raw.summary),
    extractImageFromText(raw.excerpt),
  ]);

  const candidate = direct || nested || fromText;
  const normalized = normalizePossibleUrl(candidate);
  if (normalized) return normalized;

  return pickNewsFallbackImage(seed || raw.id || raw.slug || raw.title);
};
