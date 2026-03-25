import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BellRing,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  FileText,
  Loader2,
  LogOut,
  MessageCircleMore,
  Newspaper,
  PlusCircle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  TimerReset,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  UserSquare2,
  Workflow,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SupportChat from '../components/chat/SupportChat';

const NAV_ITEMS = [
  { key: 'overview', label: 'Umumiy', icon: ShieldCheck },
  { key: 'users', label: 'Foydalanuvchilar', icon: Users },
  { key: 'admins', label: 'Adminlar', icon: UserPlus },
  { key: 'lawyers', label: 'Advokatlar', icon: UserSquare2 },
  { key: 'chats', label: 'Chat markazi', icon: MessageCircleMore },
  { key: 'applications', label: 'Arizalar', icon: FileCheck2 },
  { key: 'subscriptions', label: 'Obunalar', icon: CreditCard },
  { key: 'funnel', label: 'Lead Funnel', icon: Activity },
  { key: 'audit', label: 'Audit Log', icon: BellRing },
  { key: 'settings', label: 'Sozlamalar', icon: Settings2 },
  { key: 'content', label: 'Sayt kontenti', icon: FileText },
];

const EMPTY_LAWYER_FORM = {
  name: '',
  email: '',
  phone: '',
  telegram: '',
  specialization: 'civil',
  experience: 1,
  city: 'toshkent',
  district: '',
  license: '',
  workHours: '09:00 - 18:00',
  image: '',
  languages: "O'zbek",
  bio: '',
  loginPassword: '',
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';

const toArray = (value) => (Array.isArray(value) ? value : []);
const toNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeLawyer = (raw = {}) => ({
  id: raw.id || raw._id || raw.lawyerId || `lawyer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  name: raw.name || 'Noma\'lum advokat',
  specialization: raw.specialization || 'civil',
  experience: toNum(raw.experience, 1),
  email: raw.email || '',
  phone: raw.phone || '',
  telegram: raw.telegram || '',
  location: raw.location && typeof raw.location === 'object'
    ? raw.location
    : { city: raw.city || 'toshkent', district: raw.district || '' },
  license: raw.license || '',
  workHours: raw.workHours || '09:00 - 18:00',
  image: raw.image || DEFAULT_AVATAR,
  languages: Array.isArray(raw.languages)
    ? raw.languages
    : String(raw.languages || "O'zbek").split(',').map((x) => x.trim()).filter(Boolean),
  bio: raw.bio || '',
  created_at: raw.created_at || raw.createdAt || new Date().toISOString(),
});

const mapCount = (payload, keyCandidates = []) => {
  if (Array.isArray(payload)) return payload.length;
  for (const key of keyCandidates) {
    if (Array.isArray(payload?.[key])) return payload[key].length;
    if (typeof payload?.[key] === 'number') return payload[key];
  }
  if (Array.isArray(payload?.data)) return payload.data.length;
  if (typeof payload?.count === 'number') return payload.count;
  return 0;
};

const toTimestamp = (value) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
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

const ADMIN_AUDIT_KEY = 'legallink_admin_audit_v1';
const SUPPORT_APPROVALS_KEY = 'advokat_support_approvals_v1';
const readAuditLogs = () => {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    return Array.isArray(logs) ? logs : [];
  } catch {
    return [];
  }
};

const readSupportApprovals = () => readJSON(SUPPORT_APPROVALS_KEY, {});

const writeAuditLog = (entry) => {
  const next = [entry, ...readAuditLogs()].slice(0, 120);
  localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(next));
  return next;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    user,
    authToken,
    apiBase,
    logout,
    getAllUsers,
    createAdmin,
    createLawyerAccount,
    listSupportConversations,
    sendSupportMessage,
    setSupportConversationApproval,
    safeError,
  } = useAuth();

  const [section, setSection] = useState('overview');
  const [globalQuery, setGlobalQuery] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [lawyerSearch, setLawyerSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const [lawyerForm, setLawyerForm] = useState(EMPTY_LAWYER_FORM);
  const [lawyerSaving, setLawyerSaving] = useState(false);
  const [lawyerError, setLawyerError] = useState('');
  const [lawyerSuccess, setLawyerSuccess] = useState('');

  const [contentStats, setContentStats] = useState({
    constitutionSections: 0,
    constitutionArticles: 0,
    newsCount: 0,
    documentsCount: 0,
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(null);

  const [applications, setApplications] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError] = useState('');
  const [opsNotice, setOpsNotice] = useState('');

  const [chatTarget, setChatTarget] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatSuccess, setChatSuccess] = useState('');
  const [auditLogs, setAuditLogs] = useState(() => readAuditLogs());

  const buildUrl = useCallback((path) => `${apiBase}${path}`, [apiBase]);

  const normalizePeer = useCallback((value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'admin' || raw.includes('admin')) return 'admin';
    return String(value || '').trim();
  }, []);

  const makeConversationId = useCallback((a, b) => {
    const pair = [normalizePeer(a), normalizePeer(b)].sort();
    return `pair|${pair[0]}|${pair[1]}`;
  }, [normalizePeer]);

  const apiFetch = useCallback(
    async (path, { method = 'GET', body, auth = true } = {}) => {
      const response = await fetch(buildUrl(path), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(auth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const err = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      return data;
    },
    [authToken, buildUrl]
  );

  const requestAny = useCallback(
    async (paths, options) => {
      let lastErr = null;

      for (const path of paths) {
        try {
          return await apiFetch(path, options);
        } catch (err) {
          lastErr = err;
          if (err?.status === 404 || err?.status === 405) continue;
          throw err;
        }
      }

      throw lastErr || new Error('Endpoint topilmadi');
    },
    [apiFetch]
  );

  const pushAuditLog = useCallback(
    async ({ action, target, detail }) => {
      const entry = {
        id: `audit_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`,
        action,
        actor: user?.email || 'admin',
        target: String(target || '-'),
        detail: detail || '-',
        createdAt: new Date().toISOString(),
      };

      setAuditLogs(writeAuditLog(entry));

      try {
        await requestAny(
          ['/audit-logs', '/api/audit-logs', '/admin/audit-logs', '/logs/audit'],
          { method: 'POST', body: entry, auth: true }
        );
      } catch {
        // Backend endpoint mavjud bo'lmasa local audit ishlashda davom etadi.
      }
    },
    [requestAny, user?.email]
  );

  const loadLawyers = useCallback(async () => {
    const data = await requestAny(['/lawyers', '/api/lawyers'], { method: 'GET', auth: false });
    const raw = Array.isArray(data) ? data : (data.lawyers || data.data || data.items || []);
    setLawyers(toArray(raw).map(normalizeLawyer));
  }, [requestAny]);

  const loadServerStatus = useCallback(async () => {
    try {
      await apiFetch('/ping', { auth: false });
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    }
  }, [apiFetch]);

  const loadContentStats = useCallback(async () => {
    setContentLoading(true);

    try {
      const [sectionsRes, articlesRes, newsRes, docsRes] = await Promise.allSettled([
        apiFetch('/constitution/sections', { auth: false }),
        apiFetch('/constitution', { auth: false }),
        requestAny(['/news', '/api/news'], { method: 'GET', auth: false }),
        requestAny(['/documents', '/api/documents'], { method: 'GET', auth: true }),
      ]);

      const constitutionSections = sectionsRes.status === 'fulfilled'
        ? mapCount(sectionsRes.value, ['sections', 'items'])
        : 0;

      const constitutionArticles = articlesRes.status === 'fulfilled'
        ? mapCount(articlesRes.value, ['articles', 'items'])
        : 0;

      const newsCount = newsRes.status === 'fulfilled'
        ? mapCount(newsRes.value, ['news', 'items'])
        : 0;

      const documentsCount = docsRes.status === 'fulfilled'
        ? mapCount(docsRes.value, ['documents', 'items'])
        : 0;

      setContentStats({ constitutionSections, constitutionArticles, newsCount, documentsCount });
    } finally {
      setContentLoading(false);
    }
  }, [apiFetch, requestAny]);

  const loadOpsPanels = useCallback(async () => {
    setOpsLoading(true);
    setOpsError('');

    try {
      const [applicationsRes, subscriptionsRes, settingsRes] = await Promise.allSettled([
        requestAny(
          ['/applications', '/api/applications', '/documents', '/api/documents', '/requests', '/api/requests'],
          { method: 'GET', auth: true }
        ),
        requestAny(
          ['/subscriptions', '/api/subscriptions', '/users/subscriptions', '/billing/subscriptions'],
          { method: 'GET', auth: true }
        ),
        requestAny(['/settings', '/api/settings', '/config', '/api/config'], { method: 'GET', auth: true }),
      ]);

      const applicationsPayload = applicationsRes.status === 'fulfilled' ? applicationsRes.value : [];
      const subscriptionsPayload = subscriptionsRes.status === 'fulfilled' ? subscriptionsRes.value : [];
      const settingsPayload = settingsRes.status === 'fulfilled' ? settingsRes.value : null;

      const remoteApplications = toArray(applicationsPayload).length
        ? toArray(applicationsPayload)
        : (applicationsPayload?.applications || applicationsPayload?.documents || applicationsPayload?.items || applicationsPayload?.data || []);
      const remoteSubscriptions = toArray(subscriptionsPayload).length
        ? toArray(subscriptionsPayload)
        : (subscriptionsPayload?.subscriptions || subscriptionsPayload?.items || subscriptionsPayload?.data || []);

      const localApplications = readJSON(LOCAL_APPLICATIONS_KEY, []);
      const localSubscriptions = readJSON(LOCAL_SUBSCRIPTIONS_KEY, []);
      const approvalMap = readSupportApprovals();

      const mergedApplications = (remoteApplications.length ? remoteApplications : localApplications).map((item) => {
        const id = String(item?.id || item?._id || '');
        const chatApproval = approvalMap[id];
        return {
          ...item,
          assignedLawyerId: item?.assignedLawyerId || item?.lawyerId || null,
          assignedLawyerEmail: item?.assignedLawyerEmail || item?.lawyerEmail || '',
          assignedLawyerName: item?.assignedLawyerName || item?.lawyerName || '',
          chatApproved: typeof item?.chatApproved === 'boolean'
            ? item.chatApproved
            : (chatApproval ? Boolean(chatApproval.approved) : false),
        };
      });

      const mergedSubscriptions = remoteSubscriptions.length ? remoteSubscriptions : localSubscriptions;

      setApplications(mergedApplications);
      setSubscriptions(mergedSubscriptions);
      setPlatformSettings(settingsPayload);

      writeJSON(LOCAL_APPLICATIONS_KEY, mergedApplications);
      writeJSON(LOCAL_SUBSCRIPTIONS_KEY, mergedSubscriptions);

      if (
        applicationsRes.status === 'rejected' &&
        subscriptionsRes.status === 'rejected' &&
        settingsRes.status === 'rejected'
      ) {
        setOpsError('Ariza, obuna yoki sozlama endpointlari topilmadi.');
      }
    } finally {
      setOpsLoading(false);
    }
  }, [requestAny]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [users, chats] = await Promise.all([getAllUsers(), listSupportConversations()]);
      setUsersList(Array.isArray(users) ? users : []);
      setConversations(Array.isArray(chats) ? chats : []);

      await Promise.all([loadLawyers(), loadContentStats(), loadOpsPanels(), loadServerStatus()]);
      setLastSyncedAt(new Date());
    } catch (err) {
      setError(safeError(err, "Ma'lumotlarni yuklashda xatolik yuz berdi"));
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, listSupportConversations, loadLawyers, loadContentStats, loadOpsPanels, loadServerStatus, safeError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    if (createLoading) return;

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      await createAdmin(newAdminEmail.trim(), newAdminPassword.trim());
      setCreateSuccess('Admin muvaffaqiyatli yaratildi');
      await pushAuditLog({
        action: 'admin_created',
        target: newAdminEmail.trim(),
        detail: 'Yangi admin yaratildi',
      });
      setNewAdminEmail('');
      setNewAdminPassword('');
      await fetchData();
    } catch (err) {
      setCreateError(safeError(err, 'Admin yaratishda xatolik yuz berdi'));
    } finally {
      setCreateLoading(false);
    }
  };

  const buildLawyerPayload = () => ({
    name: lawyerForm.name.trim(),
    email: lawyerForm.email.trim(),
    phone: lawyerForm.phone.trim(),
    telegram: lawyerForm.telegram.trim(),
    specialization: lawyerForm.specialization,
    experience: toNum(lawyerForm.experience, 1),
    location: {
      city: lawyerForm.city,
      district: lawyerForm.district.trim(),
    },
    license: lawyerForm.license.trim(),
    workHours: lawyerForm.workHours.trim() || '09:00 - 18:00',
    image: lawyerForm.image.trim() || DEFAULT_AVATAR,
    languages: String(lawyerForm.languages || "O'zbek")
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    bio: lawyerForm.bio.trim() || `${lawyerForm.name.trim()} bo'yicha ma'lumot yo'q`,
  });

  const handleCreateLawyer = async (event) => {
    event.preventDefault();
    if (lawyerSaving) return;

    if (!lawyerForm.name.trim()) {
      setLawyerError('Advokat ismini kiriting');
      return;
    }
    if (!lawyerForm.email.trim()) {
      setLawyerError('Advokat emailini kiriting');
      return;
    }
    if (String(lawyerForm.loginPassword || '').trim().length < 6) {
      setLawyerError('Login parol kamida 6 ta belgidan iborat bo‘lishi kerak');
      return;
    }

    setLawyerSaving(true);
    setLawyerError('');
    setLawyerSuccess('');

    try {
      const payload = buildLawyerPayload();
      const data = await requestAny(['/lawyers', '/api/lawyers'], {
        method: 'POST',
        body: payload,
        auth: true,
      });

      const created = normalizeLawyer(data.lawyer || data.data || data);
      setLawyers((prev) => [created, ...prev.filter((item) => String(item.id) !== String(created.id))]);
      setLawyerForm(EMPTY_LAWYER_FORM);
      await createLawyerAccount({
        email: created.email || lawyerForm.email,
        password: String(lawyerForm.loginPassword || '').trim(),
        name: created.name || lawyerForm.name,
        lawyerId: created.id || null,
      });
      setLawyerSuccess('Advokat va uning kabinet login/paroli muvaffaqiyatli yaratildi');
      await pushAuditLog({
        action: 'lawyer_created',
        target: created.email || created.id || created.name,
        detail: `${created.name} advokat qo'shildi va login yaratildi`,
      });
      await fetchData();
    } catch (err) {
      setLawyerError(safeError(err, 'Advokat qo\'shishda xatolik yuz berdi'));
    } finally {
      setLawyerSaving(false);
    }
  };

  const handleDeleteLawyer = async (id) => {
    if (!window.confirm('Rostdan ham ushbu advokatni o\'chirmoqchimisiz?')) return;

    setLawyerError('');
    setLawyerSuccess('');

    try {
      await requestAny([`/lawyers/${id}`, `/api/lawyers/${id}`], {
        method: 'DELETE',
        auth: true,
      });
      await pushAuditLog({
        action: 'lawyer_deleted',
        target: String(id),
        detail: 'Advokat o\'chirildi',
      });
      setLawyers((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setLawyerSuccess('Advokat o\'chirildi');
    } catch (err) {
      setLawyerError(safeError(err, 'Advokatni o\'chirishda xatolik yuz berdi'));
    }
  };

  const stats = useMemo(() => {
    const totalUsers = usersList.length;
    const totalAdmins = usersList.filter((u) => u.role === 'admin').length;
    const totalClients = usersList.filter((u) => u.role === 'user').length;
    const totalLawyerAccounts = usersList.filter((u) => u.role === 'lawyer').length;
    const openConversations = conversations.filter((conv) => conv.status !== 'closed').length;

    return {
      totalUsers,
      totalAdmins,
      totalClients,
      totalLawyerAccounts,
      totalLawyers: lawyers.length,
      openConversations,
    };
  }, [conversations, lawyers.length, usersList]);

  const opsStats = useMemo(() => {
    const pendingApplications = applications.filter((item) => !String(item?.status || '').toLowerCase().includes('resolved')).length;
    const activeSubscriptions = subscriptions.filter((item) => String(item?.status || '').toLowerCase().includes('active')).length;
    const todayNewUsers = usersList.filter((usr) => {
      const createdAt = toTimestamp(usr?.created_at || usr?.createdAt);
      if (!createdAt) return false;
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return createdAt >= dayStart;
    }).length;

    return { pendingApplications, activeSubscriptions, todayNewUsers };
  }, [applications, subscriptions, usersList]);

  const sectionLabel = useMemo(
    () => NAV_ITEMS.find((item) => item.key === section)?.label || 'Dashboard',
    [section]
  );

  const healthScore = useMemo(() => {
    const checks = [
      serverOnline === true,
      !error,
      !opsError,
      authToken?.length > 10,
      apiBase?.startsWith('http') || apiBase?.startsWith('/'),
    ];
    const ok = checks.filter(Boolean).length;
    return Math.round((ok / checks.length) * 100);
  }, [serverOnline, error, opsError, authToken, apiBase]);

  const recentActivity = useMemo(() => {
    const items = [];

    usersList.slice(-8).forEach((usr) => {
      items.push({
        id: `usr_${usr.id || usr.email}`,
        type: 'Foydalanuvchi',
        text: `${usr.email || 'Noma\'lum user'} tizimga qo‘shildi`,
        at: usr.created_at || usr.createdAt,
      });
    });

    conversations.slice(-8).forEach((conv) => {
      items.push({
        id: `conv_${conv.id || conv.conversationId || Math.random()}`,
        type: 'Chat',
        text: `${conv.userEmail || conv.receiver || conv.participant || 'Mijoz'} bilan suhbat yangilandi`,
        at: conv.updated_at || conv.updatedAt || conv.created_at || conv.createdAt,
      });
    });

    applications.slice(-8).forEach((app, idx) => {
      items.push({
        id: `app_${app.id || app._id || idx}`,
        type: 'Ariza',
        text: `${app.title || app.subject || 'Ariza'} qabul qilindi`,
        at: app.created_at || app.createdAt || app.submittedAt,
      });
    });

    return items
      .sort((a, b) => toTimestamp(b.at) - toTimestamp(a.at))
      .slice(0, 7);
  }, [usersList, conversations, applications]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return usersList;

    return usersList.filter((usr) => {
      const email = String(usr.email || '').toLowerCase();
      const role = String(usr.role || '').toLowerCase();
      return email.includes(query) || role.includes(query);
    });
  }, [userSearch, usersList]);

  const filteredLawyers = useMemo(() => {
    const query = lawyerSearch.trim().toLowerCase();
    if (!query) return lawyers;

    return lawyers.filter((lawyer) => {
      const name = String(lawyer.name || '').toLowerCase();
      const email = String(lawyer.email || '').toLowerCase();
      const phone = String(lawyer.phone || '').toLowerCase();
      const spec = String(lawyer.specialization || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query) || spec.includes(query);
    });
  }, [lawyerSearch, lawyers]);

  const chatTargetOptions = useMemo(() => {
    const targets = new Set();
    usersList.forEach((usr) => {
      if (usr?.role !== 'admin' && usr?.email) targets.add(String(usr.email).trim());
      if (usr?.role !== 'admin' && usr?.id) targets.add(String(usr.id).trim());
    });
    lawyers.forEach((lawyer) => {
      if (lawyer?.email) targets.add(String(lawyer.email).trim());
      if (lawyer?.id) targets.add(String(lawyer.id).trim());
    });
    return Array.from(targets).filter(Boolean);
  }, [lawyers, usersList]);

  const funnel = useMemo(() => {
    const visitorsInterested = opsStats.todayNewUsers + conversations.length;
    const registeredUsers = usersList.filter((u) => u.role === 'user').length;
    const startedChats = conversations.length;
    const paidUsers = subscriptions.filter((s) => String(s.status || '').toLowerCase().includes('active')).length;
    const safePct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '0%');

    return {
      visitorsInterested,
      registeredUsers,
      startedChats,
      paidUsers,
      step1To2: safePct(registeredUsers, visitorsInterested || 1),
      step2To3: safePct(startedChats, registeredUsers || 1),
      step3To4: safePct(paidUsers, startedChats || 1),
    };
  }, [conversations.length, opsStats.todayNewUsers, subscriptions, usersList]);

  const persistApplications = useCallback((next) => {
    setApplications(next);
    writeJSON(LOCAL_APPLICATIONS_KEY, next);
  }, []);

  const persistSubscriptions = useCallback((next) => {
    setSubscriptions(next);
    writeJSON(LOCAL_SUBSCRIPTIONS_KEY, next);
  }, []);

  const lawyerChatConversations = useMemo(() => (
    conversations.filter((conv) => Boolean(conv?.requiresApproval || conv?.lawyerId))
  ), [conversations]);

  const updateApplicationStatus = (id, status) => {
    const next = applications.map((item) => (
      String(item.id || item._id) === String(id) ? { ...item, status } : item
    ));
    persistApplications(next);
    setOpsNotice(`Ariza holati yangilandi: ${status}`);
    void pushAuditLog({
      action: 'application_status_changed',
      target: String(id),
      detail: `Ariza holati -> ${status}`,
    });
  };

  const assignLawyerToApplication = (id, lawyerIdentity) => {
    const selected = lawyers.find(
      (lawyer) => String(lawyer.id) === String(lawyerIdentity) || String(lawyer.email) === String(lawyerIdentity)
    );
    const next = applications.map((item) => {
      if (String(item.id || item._id) !== String(id)) return item;
      return {
        ...item,
        status: selected ? 'assigned' : item.status,
        assignedLawyerId: selected?.id || null,
        assignedLawyerEmail: selected?.email || '',
        assignedLawyerName: selected?.name || '',
      };
    });

    persistApplications(next);
    setOpsNotice(selected ? `${selected.name} advokatga biriktirildi` : 'Advokat biriktirish bekor qilindi');
    void pushAuditLog({
      action: 'application_lawyer_assigned',
      target: String(id),
      detail: selected
        ? `Advokat: ${selected.name} (${selected.email || selected.id})`
        : 'Biriktirish olib tashlandi',
    });
  };

  const toggleApplicationChatApproval = async (application, approved) => {
    const appId = String(application?.id || application?._id || '');
    if (!appId) return;

    const next = applications.map((item) => (
      String(item.id || item._id) === appId ? { ...item, chatApproved: Boolean(approved) } : item
    ));
    persistApplications(next);

    setOpsNotice(Boolean(approved) ? 'Chatga ruxsat berildi' : 'Chat ruxsati bekor qilindi');
    await pushAuditLog({
      action: 'application_chat_approval',
      target: appId,
      detail: Boolean(approved) ? 'Chatga ruxsat berildi' : 'Chat ruxsati bekor qilindi',
    });
  };

  const updateSubscriptionStatus = (id, status) => {
    const next = subscriptions.map((item) => (
      String(item.id || item._id) === String(id) ? { ...item, status } : item
    ));
    persistSubscriptions(next);
    setOpsNotice(`Obuna holati yangilandi: ${status}`);
    void pushAuditLog({
      action: 'subscription_status_changed',
      target: String(id),
      detail: `Obuna holati -> ${status}`,
    });
  };

  const handleLogout = () => {
    void pushAuditLog({
      action: 'admin_logout',
      target: 'session',
      detail: 'Admin tizimdan chiqdi',
    });
    logout();
    navigate('/admin', { replace: true });
  };

  const handleStartChat = async (event) => {
    event.preventDefault();
    if (chatSending) return;

    const target = normalizePeer(chatTarget);
    const message = chatMessage.trim();

    if (!target || !message) {
      setChatError('Qabul qiluvchi va xabar matnini kiriting');
      return;
    }

    if (target === 'admin') {
      setChatError('Qabul qiluvchi admin bo‘lishi mumkin emas');
      return;
    }

    setChatSending(true);
    setChatError('');
    setChatSuccess('');

    try {
      const conversationId = makeConversationId('admin', target);
      await sendSupportMessage({ conversationId, text: message, receiver: target });
      setChatSuccess('Xabar yuborildi. Chat bo‘limida suhbatni ko‘rasiz.');
      await pushAuditLog({
        action: 'chat_message_sent',
        target,
        detail: 'Admin yangi xabar yubordi',
      });
      setChatMessage('');
      await fetchData();
    } catch (err) {
      setChatError(safeError(err, 'Xabar yuborishda xatolik yuz berdi'));
    } finally {
      setChatSending(false);
    }
  };

  const handleGlobalCommand = (event) => {
    event.preventDefault();
    const query = globalQuery.trim().toLowerCase();
    if (!query) return;

    const navHit = NAV_ITEMS.find(
      (item) => item.label.toLowerCase().includes(query) || item.key.toLowerCase().includes(query)
    );

    if (navHit) {
      setSection(navHit.key);
      return;
    }

    if (query.includes('@') || query.includes('user')) {
      setSection('users');
      setUserSearch(globalQuery.trim());
      return;
    }

    if (query.includes('advokat') || query.includes('lawyer')) {
      setSection('lawyers');
      setLawyerSearch(globalQuery.trim());
      return;
    }

    if (query.includes('chat')) {
      setSection('chats');
      return;
    }

    setSection('overview');
  };

  return (
    <div className="admin-dashboard-shell min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 shrink-0">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sticky top-6">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-blue-300/80 mb-1">Admin panel</p>
                <h1 className="text-2xl font-bold">LegalLink Control</h1>
                <p className="text-xs text-slate-400 mt-2 truncate">{user?.email || 'admin'}</p>
              </div>

              <div className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSection(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm py-2.5 disabled:opacity-60"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Yangilash
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-sm py-2.5"
              >
                <LogOut size={14} />
                Chiqish
              </button>
            </div>
          </aside>

          <section className="flex-1 min-w-0 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 md:p-5">
              <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-800/60 bg-blue-900/20 px-3 py-1 text-xs text-blue-300">
                    <Sparkles size={13} />
                    LegalLink Control Tower
                  </div>
                  <h2 className="mt-2 text-xl md:text-2xl font-bold">{sectionLabel}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {lastSyncedAt
                      ? `Oxirgi yangilanish: ${new Date(lastSyncedAt).toLocaleTimeString()}`
                      : 'Yuklanmoqda...'}
                  </p>
                </div>

                <form onSubmit={handleGlobalCommand} className="flex flex-col sm:flex-row gap-2 xl:min-w-[520px]">
                  <InputDark
                    label="Tezkor buyruq: users, chats, lawyers yoki email yozing"
                    value={globalQuery}
                    onChange={setGlobalQuery}
                    placeholder="Masalan: chats yoki test@gmail.com"
                  />
                  <button
                    type="submit"
                    className="sm:self-end inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold"
                  >
                    <Workflow size={14} />
                    O‘tish
                  </button>
                </form>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-800 bg-red-950/30 text-red-300 px-4 py-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {section === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-4">
                  <StatCard label="Jami user" value={stats.totalUsers} icon={Users} />
                  <StatCard label="Adminlar" value={stats.totalAdmins} icon={UserPlus} />
                  <StatCard label="Mijozlar" value={stats.totalClients} icon={UserRound} />
                  <StatCard label="Advokat akkaunt" value={stats.totalLawyerAccounts} icon={UserSquare2} />
                  <StatCard label="Advokatlar" value={stats.totalLawyers} icon={UserSquare2} />
                  <StatCard label="Ochiq chat" value={stats.openConversations} icon={MessageCircleMore} />
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <StatCard label="Yangi user (bugun)" value={opsStats.todayNewUsers} icon={UserPlus} />
                  <StatCard label="Jarayondagi ariza" value={opsStats.pendingApplications} icon={FileCheck2} />
                  <StatCard label="Faol obuna" value={opsStats.activeSubscriptions} icon={CreditCard} />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serverOnline ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'}`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Server holati (`/ping`)</p>
                      <p className="font-semibold">{serverOnline === null ? 'Tekshirilmoqda...' : serverOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadServerStatus}
                    className="inline-flex items-center gap-2 text-xs rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800"
                  >
                    <RefreshCw size={13} />
                    Ping
                  </button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <QuickLinkCard title="Advokatlar" desc="Yangi advokat qo'shish va ro'yxatni boshqarish" to="#" onClick={() => setSection('lawyers')} />
                  <QuickLinkCard title="Foydalanuvchilar" desc="Ro'yxatdan o'tgan userlarni ko'rish" to="#" onClick={() => setSection('users')} />
                  <QuickLinkCard title="Chat markazi" desc="Mijoz va advokatlar yozishmalarini nazorat qilish" to="#" onClick={() => setSection('chats')} />
                  <QuickLinkCard title="Sayt kontenti" desc="Modda, hujjat va yangilik statistikasi" to="#" onClick={() => setSection('content')} />
                </div>

                {opsNotice && <AlertBox type="success" text={opsNotice} />}

                <div className="grid xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">So‘nggi faollik</h3>
                      <span className="text-xs text-slate-400">Real-time monitoring</span>
                    </div>
                    {recentActivity.length === 0 ? (
                      <EmptyBox text="Hozircha faoliyat loglari yo‘q" dark />
                    ) : (
                      <div className="space-y-2.5">
                        {recentActivity.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-900/25 text-blue-300 flex items-center justify-center">
                              <BellRing size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-blue-300">{item.type}</p>
                              <p className="text-sm text-slate-200 truncate">{item.text}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.at ? new Date(item.at).toLocaleString() : 'Vaqt noma\'lum'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <h3 className="font-semibold">Tizim sog‘ligi</h3>
                    <p className="text-xs text-slate-400 mt-1">Integratsiyalar va backend holati</p>
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">Health score</p>
                      <p className="text-3xl font-bold mt-1">{healthScore}%</p>
                      <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                          style={{ width: `${healthScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <StatusLine ok={serverOnline === true} text="Ping endpoint ishlayapti" />
                      <StatusLine ok={!opsError} text="Ariza/obuna endpointlari o‘qilyapti" />
                      <StatusLine ok={Boolean(authToken)} text="Admin sessiya aktiv" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSection('settings')}
                      className="mt-4 w-full inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                    >
                      Sozlamalarni ochish <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {section === 'users' && (
              <Panel title="Foydalanuvchilar" subtitle={`Jami: ${usersList.length} ta`}>
                {loading ? (
                  <LoadingBox text="Yuklanmoqda..." />
                ) : usersList.length === 0 ? (
                  <EmptyBox text="Foydalanuvchilar topilmadi" />
                ) : (
                  <div className="space-y-4">
                    <InputDark label="Qidirish (email yoki rol)" value={userSearch} onChange={setUserSearch} />
                    <p className="text-xs text-slate-400">
                      Filtrlangan natija: {filteredUsers.length} ta
                    </p>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="pb-3 px-3">#</th>
                          <th className="pb-3 px-3">Email</th>
                          <th className="pb-3 px-3">Roli</th>
                          <th className="pb-3 px-3">Yaratilgan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((usr, index) => (
                          <tr key={usr.id || index} className="border-b border-slate-900/80 hover:bg-slate-900/40">
                            <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                            <td className="px-3 py-3 font-medium">{usr.email || '-'}</td>
                            <td className="px-3 py-3">
                              <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                                usr.role === 'admin'
                                  ? 'bg-blue-900/40 text-blue-300'
                                  : usr.role === 'lawyer'
                                    ? 'bg-emerald-900/40 text-emerald-300'
                                    : 'bg-slate-800 text-slate-300'
                              }`}>
                                {usr.role || 'user'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-slate-400">
                              {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )}
              </Panel>
            )}

            {section === 'admins' && (
              <Panel title="Admin boshqaruvi" subtitle="Yangi admin qo'shish (login/parol orqali kiradi)">
                <div className="grid lg:grid-cols-2 gap-6">
                  <form onSubmit={handleCreateAdmin} className="space-y-4 bg-slate-900 rounded-2xl border border-slate-800 p-5">
                    <InputDark label="Admin email" type="email" value={newAdminEmail} onChange={setNewAdminEmail} required />
                    <InputDark label="Parol" type="password" value={newAdminPassword} onChange={setNewAdminPassword} required minLength={6} />

                    {createError && <AlertBox type="error" text={createError} />}
                    {createSuccess && <AlertBox type="success" text={createSuccess} />}

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 font-semibold disabled:opacity-60"
                    >
                      {createLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                      Admin qo'shish
                    </button>
                  </form>

                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                    <h3 className="font-semibold mb-3">Admin kirish oqimi</h3>
                    <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                      <li>Admin user backendda `role: admin` bilan yaratiladi.</li>
                      <li>Admin `/admin/login` da email/parol bilan kiradi.</li>
                      <li>Kirgandan keyin bo'limli admin panel ochiladi.</li>
                    </ol>
                  </div>
                </div>
              </Panel>
            )}

            {section === 'lawyers' && (
              <Panel title="Advokatlar boshqaruvi" subtitle={`Jami: ${lawyers.length} ta`}>
                <div className="grid xl:grid-cols-5 gap-6">
                  <form onSubmit={handleCreateLawyer} className="xl:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <InputDark label="Ism-familiya" value={lawyerForm.name} onChange={(v) => setLawyerForm((p) => ({ ...p, name: v }))} required />
                    <InputDark label="Email (login uchun)" type="email" value={lawyerForm.email} onChange={(v) => setLawyerForm((p) => ({ ...p, email: v }))} required />
                    <InputDark
                      label="Kabinet paroli (min 6)"
                      type="password"
                      value={lawyerForm.loginPassword}
                      onChange={(v) => setLawyerForm((p) => ({ ...p, loginPassword: v }))}
                      minLength={6}
                      required
                    />
                    <InputDark label="Telefon" value={lawyerForm.phone} onChange={(v) => setLawyerForm((p) => ({ ...p, phone: v }))} />
                    <InputDark label="Telegram" value={lawyerForm.telegram} onChange={(v) => setLawyerForm((p) => ({ ...p, telegram: v }))} />
                    <InputDark label="Mutaxassislik" value={lawyerForm.specialization} onChange={(v) => setLawyerForm((p) => ({ ...p, specialization: v }))} />
                    <InputDark label="Tajriba (yil)" type="number" value={String(lawyerForm.experience)} onChange={(v) => setLawyerForm((p) => ({ ...p, experience: toNum(v, 1) }))} />
                    <InputDark label="Shahar" value={lawyerForm.city} onChange={(v) => setLawyerForm((p) => ({ ...p, city: v }))} />
                    <InputDark label="Tuman" value={lawyerForm.district} onChange={(v) => setLawyerForm((p) => ({ ...p, district: v }))} />
                    <InputDark label="Litsenziya" value={lawyerForm.license} onChange={(v) => setLawyerForm((p) => ({ ...p, license: v }))} />
                    <InputDark label="Rasm URL" value={lawyerForm.image} onChange={(v) => setLawyerForm((p) => ({ ...p, image: v }))} />
                    <InputDark label="Tillar" value={lawyerForm.languages} onChange={(v) => setLawyerForm((p) => ({ ...p, languages: v }))} />
                    <TextAreaDark label="Bio" value={lawyerForm.bio} onChange={(v) => setLawyerForm((p) => ({ ...p, bio: v }))} />

                    {lawyerError && <AlertBox type="error" text={lawyerError} />}
                    {lawyerSuccess && <AlertBox type="success" text={lawyerSuccess} />}

                    <button
                      type="submit"
                      disabled={lawyerSaving}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 font-semibold disabled:opacity-60"
                    >
                      {lawyerSaving ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                      Advokat qo'shish
                    </button>
                  </form>

                  <div className="xl:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-5">
                    <div className="mb-4">
                      <InputDark label="Qidirish (ism, email, telefon, mutaxassislik)" value={lawyerSearch} onChange={setLawyerSearch} />
                    </div>

                    {filteredLawyers.length === 0 ? (
                      <EmptyBox text="Advokatlar ro'yxati bo'sh" dark />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="text-left px-3 pb-3">Advokat</th>
                              <th className="text-left px-3 pb-3">Mutaxassislik</th>
                              <th className="text-left px-3 pb-3">Aloqa</th>
                              <th className="text-left px-3 pb-3">Kabinet</th>
                              <th className="text-left px-3 pb-3">Amal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLawyers.map((lawyer) => (
                              <tr key={lawyer.id} className="border-b border-slate-900/80 hover:bg-slate-800/40">
                                <td className="px-3 py-3">
                                  <p className="font-semibold">{lawyer.name}</p>
                                  <p className="text-xs text-slate-400">{lawyer.location?.city || '-'}</p>
                                </td>
                                <td className="px-3 py-3 text-slate-300">{lawyer.specialization}</td>
                                <td className="px-3 py-3 text-slate-400 text-xs">
                                  {lawyer.phone || lawyer.email || lawyer.telegram || '-'}
                                </td>
                                <td className="px-3 py-3 text-slate-300 text-xs">
                                  {usersList.some((usr) => usr.role === 'lawyer' && String(usr.email || '').toLowerCase() === String(lawyer.email || '').toLowerCase())
                                    ? 'Aktiv'
                                    : 'Yaratilmagan'}
                                </td>
                                <td className="px-3 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLawyer(lawyer.id)}
                                    className="inline-flex items-center gap-1 text-red-300 hover:text-red-200"
                                  >
                                    <Trash2 size={14} /> O'chirish
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            )}

            {section === 'chats' && (
              <Panel title="Admin chat markazi" subtitle="Mijozlar va advokatlar bilan real-time yozishma">
                <div className="mb-6 grid lg:grid-cols-2 gap-4">
                  <form onSubmit={handleStartChat} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Yangi chat boshlash</h3>
                    <InputDark
                      label="Qabul qiluvchi (advokat email yoki ID)"
                      value={chatTarget}
                      onChange={setChatTarget}
                      list="chat-target-options"
                      required
                    />
                    <datalist id="chat-target-options">
                      {chatTargetOptions.map((target) => (
                        <option key={target} value={target} />
                      ))}
                    </datalist>
                    <TextAreaDark label="Birinchi xabar" value={chatMessage} onChange={setChatMessage} />

                    {chatError && <AlertBox type="error" text={chatError} />}
                    {chatSuccess && <AlertBox type="success" text={chatSuccess} />}

                    <button
                      type="submit"
                      disabled={chatSending}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      {chatSending ? <Loader2 size={14} className="animate-spin" /> : <MessageCircleMore size={14} />}
                      Xabar yuborish
                    </button>
                  </form>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300">
                    <p className="font-semibold mb-2">Ishlash tartibi</p>
                    <ul className="space-y-1.5 list-disc pl-5 text-slate-400">
                      <li>Advokat email/ID ni kiriting.</li>
                      <li>Birinchi xabar yuboring.</li>
                      <li>Pastdagi chat markazida real-time yozishma davom etadi.</li>
                    </ul>
                  </div>
                </div>
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="font-semibold mb-3">Advokat chat ruxsatlari</h3>
                  {lawyerChatConversations.length === 0 ? (
                    <p className="text-sm text-slate-400">Hozircha advokatga bog‘langan chatlar yo‘q.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="text-left px-2 py-2">Suhbat</th>
                            <th className="text-left px-2 py-2">Advokat</th>
                            <th className="text-left px-2 py-2">Ruxsat</th>
                            <th className="text-left px-2 py-2">Amal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lawyerChatConversations.map((conv) => (
                            <tr key={conv.id} className="border-b border-slate-900/70">
                              <td className="px-2 py-2 text-slate-200">{conv.clientName || conv.clientEmail || conv.id}</td>
                              <td className="px-2 py-2 text-slate-300">{conv.lawyerId || conv.peerId || '-'}</td>
                              <td className="px-2 py-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                  conv.chatApproved ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'
                                }`}>
                                  {conv.chatApproved ? 'Ruxsat berilgan' : 'Kutilmoqda'}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void (async () => {
                                      try {
                                        await setSupportConversationApproval(conv.id, !conv.chatApproved, {
                                          lawyerId: conv.lawyerId || conv.peerId || null,
                                        });
                                        setOpsNotice(!conv.chatApproved ? 'Chatga ruxsat berildi' : 'Chat ruxsati bekor qilindi');
                                        await pushAuditLog({
                                          action: 'chat_approval_changed',
                                          target: String(conv.id),
                                          detail: !conv.chatApproved ? 'Ruxsat berildi' : 'Ruxsat bekor qilindi',
                                        });
                                        await fetchData();
                                      } catch (err) {
                                        setChatError(safeError(err, 'Chat ruxsatini yangilab bo‘lmadi'));
                                      }
                                    })();
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs hover:bg-slate-800"
                                >
                                  {conv.chatApproved ? 'Ruxsatni olish' : 'Ruxsat berish'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <SupportChat embedded />
              </Panel>
            )}

            {section === 'content' && (
              <Panel title="Sayt ma'lumotlari" subtitle="Konstitutsiya, yangiliklar va hujjatlar statistikasi">
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard label="Konstitutsiya bo'limlari" value={contentLoading ? '...' : contentStats.constitutionSections} icon={BookOpen} />
                  <StatCard label="Konstitutsiya moddalari" value={contentLoading ? '...' : contentStats.constitutionArticles} icon={BookOpen} />
                  <StatCard label="Yangiliklar" value={contentLoading ? '...' : contentStats.newsCount} icon={Newspaper} />
                  <StatCard label="Hujjatlar" value={contentLoading ? '...' : contentStats.documentsCount} icon={FileText} />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Link className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition-colors" to="/constitution" target="_blank">
                    <p className="font-semibold mb-1">Konstitutsiya sahifasi</p>
                    <p className="text-xs text-slate-400">Moddalarni frontenddan tekshirish</p>
                  </Link>
                  <Link className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition-colors" to="/news" target="_blank">
                    <p className="font-semibold mb-1">Yangiliklar sahifasi</p>
                    <p className="text-xs text-slate-400">News API natijasini ko'rish</p>
                  </Link>
                  <button
                    type="button"
                    onClick={loadContentStats}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition-colors text-left"
                  >
                    <p className="font-semibold mb-1">Statistikani yangilash</p>
                    <p className="text-xs text-slate-400">Endpointlardan qayta o'qish</p>
                  </button>
                </div>
              </Panel>
            )}

            {section === 'applications' && (
              <Panel title="Arizalar nazorati" subtitle="Backenddan kelgan arizalar va hujjatlar">
                {opsError && <AlertBox type="error" text={opsError} />}
                {opsLoading ? (
                  <LoadingBox text="Arizalar yuklanmoqda..." />
                ) : applications.length === 0 ? (
                  <EmptyBox text="Arizalar topilmadi. Endpoint: /applications yoki /documents" dark />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-sm">
                      <thead className="text-slate-400 border-b border-slate-800 bg-slate-900">
                        <tr>
                          <th className="text-left px-3 py-2.5">#</th>
                          <th className="text-left px-3 py-2.5">Sarlavha</th>
                          <th className="text-left px-3 py-2.5">Mijoz</th>
                          <th className="text-left px-3 py-2.5">Advokat</th>
                          <th className="text-left px-3 py-2.5">Chat ruxsati</th>
                          <th className="text-left px-3 py-2.5">Holat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((item, idx) => (
                          <tr key={String(item.id || item._id || idx)} className="border-b border-slate-900">
                            <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5">{item.title || item.subject || item.name || 'Nomsiz ariza'}</td>
                            <td className="px-3 py-2.5 text-slate-300">{item.userEmail || item.email || item.clientEmail || '-'}</td>
                            <td className="px-3 py-2.5">
                              <select
                                className="text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 min-w-[180px]"
                                value={item.assignedLawyerId || item.assignedLawyerEmail || ''}
                                onChange={(event) => assignLawyerToApplication(item.id || item._id, event.target.value)}
                              >
                                <option value="">Biriktirilmagan</option>
                                {lawyers.map((lawyer) => (
                                  <option key={String(lawyer.id)} value={lawyer.id}>
                                    {lawyer.name} ({lawyer.email || lawyer.id})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5">
                              <select
                                className="text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1"
                                value={item.chatApproved ? 'approved' : 'pending'}
                                onChange={(event) => {
                                  void toggleApplicationChatApproval(item, event.target.value === 'approved');
                                }}
                              >
                                <option value="pending">Kutilmoqda</option>
                                <option value="approved">Ruxsat berilgan</option>
                              </select>
                            </td>
                            <td className="px-3 py-2.5">
                              <select
                                className="text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1"
                                value={item.status || 'jarayonda'}
                                onChange={(event) => updateApplicationStatus(item.id || item._id, event.target.value)}
                              >
                                <option value="new">new</option>
                                <option value="in_review">in_review</option>
                                <option value="assigned">assigned</option>
                                <option value="resolved">resolved</option>
                                <option value="closed">closed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}

            {section === 'subscriptions' && (
              <Panel title="Obunalar nazorati" subtitle="Foydalanuvchi obunalari monitoringi">
                {opsError && <AlertBox type="error" text={opsError} />}
                {opsLoading ? (
                  <LoadingBox text="Obunalar yuklanmoqda..." />
                ) : subscriptions.length === 0 ? (
                  <EmptyBox text="Obuna ma'lumotlari topilmadi. Endpoint: /subscriptions" dark />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-sm">
                      <thead className="text-slate-400 border-b border-slate-800 bg-slate-900">
                        <tr>
                          <th className="text-left px-3 py-2.5">#</th>
                          <th className="text-left px-3 py-2.5">Foydalanuvchi</th>
                          <th className="text-left px-3 py-2.5">Tarif</th>
                          <th className="text-left px-3 py-2.5">Holat</th>
                          <th className="text-left px-3 py-2.5">Tugash sanasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((item, idx) => (
                          <tr key={String(item.id || item._id || idx)} className="border-b border-slate-900">
                            <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5">{item.userEmail || item.email || item.user || '-'}</td>
                            <td className="px-3 py-2.5">{item.plan || item.tariff || item.type || '-'}</td>
                            <td className="px-3 py-2.5">
                              <select
                                className="text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1"
                                value={item.status || 'unknown'}
                                onChange={(event) => updateSubscriptionStatus(item.id || item._id, event.target.value)}
                              >
                                <option value="active">active</option>
                                <option value="paused">paused</option>
                                <option value="expired">expired</option>
                                <option value="canceled">canceled</option>
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-slate-300">
                              {item.expiresAt || item.expireDate || item.endDate || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}

            {section === 'funnel' && (
              <Panel title="Lead Funnel" subtitle="Qiziqishdan to'lovgacha bo'lgan oqim">
                <div className="grid md:grid-cols-4 gap-4">
                  <FunnelCard title="1. Qiziqqanlar" value={funnel.visitorsInterested} helper="Bugungi qiziqish signallari" />
                  <FunnelCard title="2. Ro'yxatdan o'tganlar" value={funnel.registeredUsers} helper={`Konversiya: ${funnel.step1To2}`} />
                  <FunnelCard title="3. Chat boshlaganlar" value={funnel.startedChats} helper={`Konversiya: ${funnel.step2To3}`} />
                  <FunnelCard title="4. To'lov qilganlar" value={funnel.paidUsers} helper={`Konversiya: ${funnel.step3To4}`} />
                </div>
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="font-semibold mb-2">Takliflar</p>
                  <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
                    <li>1 dan 2 ga o‘tish past bo'lsa, registration oqimini qisqartiring.</li>
                    <li>2 dan 3 ga o‘tish past bo'lsa, chat CTA va onboardingni kuchaytiring.</li>
                    <li>3 dan 4 ga o‘tish past bo'lsa, tarif va ishonch bloklarini kuchaytiring.</li>
                  </ul>
                </div>
              </Panel>
            )}

            {section === 'audit' && (
              <Panel title="Audit Log" subtitle="Admin amallarini kuzatish">
                {auditLogs.length === 0 ? (
                  <EmptyBox text="Hozircha audit yozuvlari yo'q" dark />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-sm">
                      <thead className="text-slate-400 border-b border-slate-800 bg-slate-900">
                        <tr>
                          <th className="text-left px-3 py-2.5">Vaqt</th>
                          <th className="text-left px-3 py-2.5">Amal</th>
                          <th className="text-left px-3 py-2.5">Kim</th>
                          <th className="text-left px-3 py-2.5">Target</th>
                          <th className="text-left px-3 py-2.5">Izoh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-900">
                            <td className="px-3 py-2.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-3 py-2.5">{log.action}</td>
                            <td className="px-3 py-2.5 text-slate-300">{log.actor}</td>
                            <td className="px-3 py-2.5 text-slate-300">{log.target}</td>
                            <td className="px-3 py-2.5 text-slate-300">{log.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-3">
                  Eslatma: hozircha loglar localStorage'da saqlanadi.
                </p>
              </Panel>
            )}

            {section === 'settings' && (
              <Panel title="Platforma sozlamalari" subtitle="Backend config va texnik holat">
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-sm text-slate-400 mb-2">API bazasi</p>
                    <p className="font-mono text-sm break-all">{apiBase || 'VITE_API_BASE_URL o\'rnatilmagan'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-sm text-slate-400 mb-2">Server holati</p>
                    <p className={`font-semibold ${serverOnline ? 'text-emerald-300' : 'text-red-300'}`}>
                      {serverOnline === null ? 'Tekshirilmoqda...' : serverOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-semibold">Backend settings payload</p>
                    <button
                      type="button"
                      onClick={loadOpsPanels}
                      className="inline-flex items-center gap-2 text-xs rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
                    >
                      <RefreshCw size={13} />
                      Qayta yuklash
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-auto max-h-[360px]">
{JSON.stringify(platformSettings || { message: 'Settings endpoint javobi yo\'q' }, null, 2)}
                  </pre>
                </div>
              </Panel>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-blue-900/30 text-blue-300 flex items-center justify-center">
          {React.createElement(Icon, { size: 17 })}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickLinkCard({ title, desc, to, onClick }) {
  if (to === '#') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition-colors"
      >
        <p className="font-semibold mb-1">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </button>
    );
  }

  return (
    <Link to={to} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition-colors block">
      <p className="font-semibold mb-1">{title}</p>
      <p className="text-xs text-slate-400">{desc}</p>
    </Link>
  );
}

function AlertBox({ type = 'error', text }) {
  const cls = type === 'success'
    ? 'border-green-900/60 bg-green-900/20 text-green-300'
    : 'border-red-900/60 bg-red-900/20 text-red-300';

  const Icon = type === 'success' ? CheckCircle2 : ShieldAlert;

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm flex items-start gap-2 ${cls}`}>
      <Icon size={15} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function LoadingBox({ text }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-slate-400">
      <Loader2 size={32} className="animate-spin mb-3" />
      <p>{text}</p>
    </div>
  );
}

function EmptyBox({ text, dark = false }) {
  return (
    <div className={`py-14 text-center text-sm rounded-2xl border ${dark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
      {text}
    </div>
  );
}

function InputDark({ label, value, onChange, required = false, type = 'text', minLength, min, ...rest }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        min={min}
        {...rest}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
    </label>
  );
}

function TextAreaDark({ label, value, onChange }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
    </label>
  );
}

function StatusLine({ ok, text }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
      <span className="text-slate-300">{text}</span>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>
        {ok ? <CheckCircle2 size={13} /> : <TimerReset size={13} />}
        {ok ? 'OK' : 'Tekshirish'}
      </span>
    </div>
  );
}

function FunnelCard({ title, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{helper}</p>
    </div>
  );
}
