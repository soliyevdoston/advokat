import { buildApiUrl } from '../config/appConfig';
import { readLocalLawyers } from './localLawyers';

const LOCAL_USERS_KEY = 'advokat_local_users_v1';
const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
const LOCAL_MESSAGES_KEY = 'advokat_support_messages_v1';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const getTodayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const toTs = (value) => {
  const ts = new Date(value || '').getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const extractList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const fetchAny = async (paths) => {
  let lastError = null;
  for (const path of paths) {
    try {
      const response = await fetch(buildApiUrl(path));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }
      return data;
    } catch (err) {
      lastError = err;
      if (err?.status === 401 || err?.status === 403 || err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }
  throw lastError || new Error('Endpoint topilmadi');
};

const calcAverageFirstResponse = (messages) => {
  const grouped = new Map();
  toArray(messages).forEach((msg) => {
    const convId = String(msg?.conversationId || msg?.chatId || msg?.roomId || '');
    if (!convId) return;
    if (!grouped.has(convId)) grouped.set(convId, []);
    grouped.get(convId).push(msg);
  });

  const deltas = [];
  grouped.forEach((rows) => {
    const sorted = [...rows].sort((a, b) => toTs(a.createdAt || a.created_at) - toTs(b.createdAt || b.created_at));
    const firstUser = sorted.find((row) => String(row.senderRole || '').toLowerCase() === 'user');
    if (!firstUser) return;
    const firstReply = sorted.find((row) => {
      const role = String(row.senderRole || '').toLowerCase();
      return toTs(row.createdAt || row.created_at) >= toTs(firstUser.createdAt || firstUser.created_at)
        && role
        && role !== 'user';
    });
    if (!firstReply) return;
    const deltaMs = toTs(firstReply.createdAt || firstReply.created_at) - toTs(firstUser.createdAt || firstUser.created_at);
    if (deltaMs > 0) deltas.push(deltaMs);
  });

  if (!deltas.length) return null;
  const avgMs = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  return Math.max(1, Math.round(avgMs / 60000));
};

const calcSatisfaction = (messages) => {
  const ratings = [];
  toArray(messages).forEach((msg) => {
    const text = String(msg?.text || msg?.message || '');
    const match = text.match(/\[Feedback\]\s*Baho:\s*([1-5])/i);
    if (match) ratings.push(Number(match[1]));
  });
  if (!ratings.length) return null;
  const avg = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
  return Number(avg.toFixed(1));
};

export const loadPlatformStats = async () => {
  const usersLocal = toArray(readJSON(LOCAL_USERS_KEY, []));
  const appsLocal = toArray(readJSON(LOCAL_APPLICATIONS_KEY, []));
  const messagesLocal = toArray(readJSON(LOCAL_MESSAGES_KEY, []));
  const lawyersLocal = toArray(readLocalLawyers());
  const todayStart = getTodayStart();

  const localStats = {
    totalUsers: usersLocal.length,
    totalLawyers: Math.max(
      lawyersLocal.length,
      usersLocal.filter((item) => String(item?.role || '').toLowerCase() === 'lawyer').length
    ),
    resolvedCases: appsLocal.filter((item) => ['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())).length,
    todayRequests: appsLocal.filter((item) => toTs(item?.createdAt || item?.created_at || item?.submittedAt) >= todayStart).length,
    avgFirstResponseMin: calcAverageFirstResponse(messagesLocal),
    satisfaction: calcSatisfaction(messagesLocal),
  };

  try {
    const [usersPayload, lawyersPayload, applicationsPayload, usersStatsPayload, resolvedStatsPayload] = await Promise.all([
      fetchAny(['/admin/user/users/count', '/user/list', '/user/users', '/users', '/users/', '/auth/users']),
      fetchAny(['/admin/user/lawyers/count', '/advokat/lawyers', '/advokat/list', '/advokat', '/lawyers', '/api/lawyers']),
      fetchAny(['/admin/ariza/requests', '/xissobot/stats', '/xissobot%20/stats', '/applications', '/api/applications', '/documents', '/api/documents']),
      fetchAny(['/list/stats', '/list%20/stats']),
      fetchAny(['/xissobot/stats', '/xissobot%20/stats']),
    ]);

    const usersRemote = extractList(usersPayload, ['users', 'items']);
    const lawyersRemote = extractList(lawyersPayload, ['lawyers', 'items']);
    const appsRemote = extractList(applicationsPayload, ['applications', 'documents', 'items', 'requests']);

    const usersCountDirect = Number(usersPayload?.users || usersPayload?.count || usersPayload?.total || 0);
    const lawyersCountDirect = Number(lawyersPayload?.lawyers || lawyersPayload?.count || lawyersPayload?.total || 0);
    const usersToday = Number(usersStatsPayload?.usersToday || 0);
    const resolvedToday = Number(resolvedStatsPayload?.resolvedToday || 0);

    const remoteTodayRequests = appsRemote.filter(
      (item) => toTs(item?.createdAt || item?.created_at || item?.submittedAt) >= todayStart
    ).length;
    const remoteResolved = appsRemote.filter((item) =>
      ['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())
    ).length;

    return {
      totalUsers: usersCountDirect || usersRemote.length || localStats.totalUsers,
      totalLawyers: lawyersCountDirect || lawyersRemote.length || localStats.totalLawyers,
      resolvedCases: remoteResolved || resolvedToday || localStats.resolvedCases,
      todayRequests: remoteTodayRequests || usersToday || localStats.todayRequests,
      avgFirstResponseMin: localStats.avgFirstResponseMin,
      satisfaction: localStats.satisfaction,
    };
  } catch {
    return localStats;
  }
};
