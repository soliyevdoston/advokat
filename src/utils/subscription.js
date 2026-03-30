const LOCAL_SUBSCRIPTIONS_KEY = 'legallink_user_subscriptions_v1';

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

const toIsoDate = (value, fallback = new Date().toISOString()) => {
  const ts = new Date(value || '').getTime();
  return Number.isFinite(ts) ? new Date(ts).toISOString() : fallback;
};

const getIdentity = (user) => {
  const email = String(user?.email || '').trim().toLowerCase();
  if (email) return email;
  const id = String(user?.id || '').trim();
  return id || '';
};

const normalizeSubscription = (row = {}) => ({
  id: row.id || row._id || `sub_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  plan: row.plan || row.tariff || row.type || 'PRO',
  gateway: String(row.gateway || row.provider || '').toLowerCase(),
  status: String(row.status || 'pending').toLowerCase(),
  amount: Number(row.amount || row.price || 0) || 0,
  userEmail: String(row.userEmail || row.email || '').trim().toLowerCase(),
  userId: String(row.userId || row.clientId || '').trim(),
  createdAt: toIsoDate(row.createdAt || row.created_at),
  activatedAt: row.activatedAt ? toIsoDate(row.activatedAt) : null,
  expiresAt: row.expiresAt ? toIsoDate(row.expiresAt) : null,
});

const isActiveStatus = (value) => ['active', 'paid', 'success'].includes(String(value || '').toLowerCase());

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt).getTime();
  return Number.isFinite(expiry) && expiry < Date.now();
};

export const readSubscriptions = () => {
  const rows = readJSON(LOCAL_SUBSCRIPTIONS_KEY, []);
  return Array.isArray(rows) ? rows.map(normalizeSubscription) : [];
};

export const writeSubscriptions = (rows) => {
  const list = Array.isArray(rows) ? rows.map(normalizeSubscription) : [];
  writeJSON(LOCAL_SUBSCRIPTIONS_KEY, list);
  return list;
};

export const hasActiveSubscription = (user, list = null) => {
  const identity = getIdentity(user);
  if (!identity) return false;

  const rows = Array.isArray(list) ? list : readSubscriptions();
  return rows.some((row) => {
    const rowEmail = String(row.userEmail || '').trim().toLowerCase();
    const rowId = String(row.userId || '').trim();
    const owned = identity === rowEmail || identity === rowId;
    if (!owned) return false;
    if (!isActiveStatus(row.status)) return false;
    return !isExpired(row.expiresAt);
  });
};

export const createPendingSubscription = ({ user, gateway, amount, plan = 'PRO' }) => {
  const rows = readSubscriptions();
  const now = new Date().toISOString();
  const identityEmail = String(user?.email || '').trim().toLowerCase();
  const identityId = String(user?.id || '').trim();

  const pending = normalizeSubscription({
    id: `sub_${Date.now()}`,
    plan,
    gateway,
    amount,
    status: 'pending',
    userEmail: identityEmail,
    userId: identityId,
    createdAt: now,
  });

  const next = [pending, ...rows];
  writeSubscriptions(next);
  return pending;
};

export const activateSubscription = ({ user, gateway, amount, plan = 'PRO', periodDays = 30 }) => {
  const rows = readSubscriptions();
  const now = new Date();
  const activatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();
  const identityEmail = String(user?.email || '').trim().toLowerCase();
  const identityId = String(user?.id || '').trim();

  const active = normalizeSubscription({
    id: `sub_${Date.now()}`,
    plan,
    gateway,
    amount,
    status: 'active',
    userEmail: identityEmail,
    userId: identityId,
    createdAt: activatedAt,
    activatedAt,
    expiresAt,
  });

  const next = [active, ...rows];
  writeSubscriptions(next);
  return active;
};

export const activateSubscriptionForIdentity = ({
  email = '',
  userId = '',
  gateway = 'manual',
  amount = 0,
  plan = 'PRO',
  periodDays = 30,
}) => {
  const rows = readSubscriptions();
  const now = new Date();
  const activatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();

  const active = normalizeSubscription({
    id: `sub_${Date.now()}`,
    plan,
    gateway,
    amount,
    status: 'active',
    userEmail: String(email || '').trim().toLowerCase(),
    userId: String(userId || '').trim(),
    createdAt: activatedAt,
    activatedAt,
    expiresAt,
  });

  const next = [active, ...rows];
  writeSubscriptions(next);
  return active;
};

export { LOCAL_SUBSCRIPTIONS_KEY };
