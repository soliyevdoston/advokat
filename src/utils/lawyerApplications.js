const LAWYER_APPLICATIONS_KEY = 'legallink_lawyer_applications_v1';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeText = (value) => String(value || '').trim();

const normalizeApplication = (row = {}) => ({
  id: row.id || row._id || `law_app_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  fullName: normalizeText(row.fullName || row.name),
  email: normalizeText(row.email).toLowerCase(),
  phone: normalizeText(row.phone),
  specialization: normalizeText(row.specialization || 'civil'),
  experience: Number(row.experience || 1) || 1,
  city: normalizeText(row.city || 'toshkent'),
  district: normalizeText(row.district),
  license: normalizeText(row.license),
  bio: normalizeText(row.bio),
  languages: Array.isArray(row.languages)
    ? row.languages
    : normalizeText(row.languages || "O'zbek").split(',').map((x) => x.trim()).filter(Boolean),
  loginPassword: normalizeText(row.loginPassword || row.password),
  status: normalizeText(row.status || 'pending').toLowerCase(),
  source: normalizeText(row.source || 'site_lawyer_apply'),
  createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  approvedAt: row.approvedAt || null,
  approvedBy: row.approvedBy || null,
  rejectReason: row.rejectReason || '',
});

export const readLawyerApplications = () => {
  const rows = readJSON(LAWYER_APPLICATIONS_KEY, []);
  return Array.isArray(rows) ? rows.map(normalizeApplication) : [];
};

export const writeLawyerApplications = (rows) => {
  const list = Array.isArray(rows) ? rows.map(normalizeApplication) : [];
  writeJSON(LAWYER_APPLICATIONS_KEY, list);
  return list;
};

export const submitLawyerApplication = (payload = {}) => {
  const current = readLawyerApplications();
  const normalized = normalizeApplication({
    ...payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  const next = [normalized, ...current];
  writeLawyerApplications(next);
  return normalized;
};

export const updateLawyerApplication = (id, patch = {}) => {
  const key = String(id || '').trim();
  if (!key) return null;
  const current = readLawyerApplications();

  let updated = null;
  const next = current.map((item) => {
    if (String(item.id) !== key) return item;
    updated = normalizeApplication({ ...item, ...patch, id: item.id });
    return updated;
  });

  writeLawyerApplications(next);
  return updated;
};

export { LAWYER_APPLICATIONS_KEY };
