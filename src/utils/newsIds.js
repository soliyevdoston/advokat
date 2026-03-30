const toText = (value) => String(value || '').trim();

const hashString = (value) => {
  const text = toText(value) || 'news';
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const slugify = (value) => {
  return toText(value)
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

export const buildNewsId = ({ rawId, title, externalUrl, index = 0 } = {}) => {
  const sourceId = toText(rawId);
  const sourceUrl = toText(externalUrl);

  if (sourceId && /^[a-zA-Z0-9_-]{1,80}$/.test(sourceId)) {
    return sourceId;
  }

  const seed = sourceId || sourceUrl || `${toText(title)}_${index}`;
  const slug = slugify(title) || 'news';
  const hash = hashString(seed).toString(36);
  return `${slug}-${hash}`;
};
