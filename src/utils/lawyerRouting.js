import { lawyers as seedLawyers } from '../data/lawyers';
import { readLocalLawyers } from './localLawyers';

const TOPIC_SPECIALIZATION = {
  document: 'civil',
  consult: 'civil',
  dispute: 'criminal',
  general: 'civil',
  court: 'criminal',
  consultation: 'civil',
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeText = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ʼ|`/g, "'")
    .replace(/_/g, ' ')
);

const normalizeLawyer = (raw = {}) => ({
  ...raw,
  id: raw.id || raw._id || raw.lawyerId || `lawyer_${Date.now()}`,
  name: raw.name || "Noma'lum advokat",
  email: String(raw.email || '').trim().toLowerCase(),
  specialization: String(raw.specialization || 'civil').toLowerCase(),
  rating: toNumber(raw.rating, 0),
  location: raw.location && typeof raw.location === 'object'
    ? raw.location
    : { city: raw.city || '', district: raw.district || '' },
});

const dedupeLawyers = (rows) => {
  const list = Array.isArray(rows) ? rows.map(normalizeLawyer) : [];
  const out = [];
  list.forEach((item) => {
    const exists = out.some((row) => (
      String(row.id) === String(item.id)
      || (row.email && item.email && row.email === item.email)
    ));
    if (!exists) out.push(item);
  });
  return out;
};

export const buildLawyerPool = () => {
  try {
    return dedupeLawyers([...seedLawyers, ...readLocalLawyers()]);
  } catch {
    return dedupeLawyers(seedLawyers);
  }
};

const scoreLawyer = ({ lawyer, region, specialization }) => {
  const city = normalizeText(lawyer?.location?.city || '');
  const spec = normalizeText(lawyer?.specialization || '');
  const targetRegion = normalizeText(region);
  const targetSpec = normalizeText(specialization);

  let score = toNumber(lawyer?.rating, 0) * 10;
  if (targetRegion && city === targetRegion) score += 30;
  if (targetSpec && spec === targetSpec) score += 40;
  if (targetSpec && spec.includes(targetSpec)) score += 10;
  return score;
};

export const resolveSpecializationByTopic = (topic = '') => {
  const key = normalizeText(topic);
  return TOPIC_SPECIALIZATION[key] || 'civil';
};

export const pickLawyerForApplication = ({
  preferredLawyer = null,
  preferredLawyerId = null,
  preferredLawyerEmail = '',
  region = '',
  specialization = '',
  pool = [],
} = {}) => {
  const lawyers = dedupeLawyers(pool?.length ? pool : buildLawyerPool());
  if (!lawyers.length) return null;

  if (preferredLawyer && (preferredLawyer.id || preferredLawyer.email)) {
    const selected = lawyers.find((item) => (
      String(item.id) === String(preferredLawyer.id)
      || (item.email && preferredLawyer.email && item.email === String(preferredLawyer.email).toLowerCase())
    ));
    if (selected) return selected;
  }

  if (preferredLawyerId || preferredLawyerEmail) {
    const byIdentity = lawyers.find((item) => (
      (preferredLawyerId && String(item.id) === String(preferredLawyerId))
      || (preferredLawyerEmail && item.email === String(preferredLawyerEmail).toLowerCase())
    ));
    if (byIdentity) return byIdentity;
  }

  const scored = lawyers
    .map((lawyer) => ({ lawyer, score: scoreLawyer({ lawyer, region, specialization }) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.lawyer || lawyers[0];
};

