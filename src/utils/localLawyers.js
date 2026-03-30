const LOCAL_LAWYERS_KEY = 'legallink_local_lawyers_v1';

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

export const readLocalLawyers = () => {
  const rows = readJSON(LOCAL_LAWYERS_KEY, []);
  return Array.isArray(rows) ? rows : [];
};

export const writeLocalLawyers = (rows) => {
  const next = Array.isArray(rows) ? rows : [];
  writeJSON(LOCAL_LAWYERS_KEY, next);
  return next;
};

export const upsertLocalLawyer = (payload = {}) => {
  const current = readLocalLawyers();
  const id = String(payload.id || payload._id || `lawyer_${Date.now()}`).trim();
  const email = String(payload.email || '').trim().toLowerCase();

  const idx = current.findIndex((item) => {
    const itemId = String(item.id || item._id || '').trim();
    const itemEmail = String(item.email || '').trim().toLowerCase();
    return (id && itemId === id) || (email && itemEmail === email);
  });

  const normalized = {
    ...payload,
    id,
    email,
  };

  if (idx >= 0) {
    current[idx] = { ...current[idx], ...normalized };
  } else {
    current.unshift(normalized);
  }

  writeLocalLawyers(current);
  return normalized;
};

export const removeLocalLawyer = (idOrEmail) => {
  const needle = String(idOrEmail || '').trim().toLowerCase();
  if (!needle) return [];
  const next = readLocalLawyers().filter((item) => {
    const itemId = String(item.id || '').trim().toLowerCase();
    const itemEmail = String(item.email || '').trim().toLowerCase();
    return itemId !== needle && itemEmail !== needle;
  });
  writeLocalLawyers(next);
  return next;
};

export { LOCAL_LAWYERS_KEY };
