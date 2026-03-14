import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Loader2,
  LogOut,
  MessageCircleMore,
  Newspaper,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  Star,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  UserSquare2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SupportChat from '../components/chat/SupportChat';
import { getDocumentQuotaRows } from '../utils/documentQuota';

const NAV_ITEMS = [
  { key: 'overview', label: 'Umumiy', icon: ShieldCheck },
  { key: 'users', label: 'Foydalanuvchilar', icon: Users },
  { key: 'admins', label: 'Adminlar', icon: UserPlus },
  { key: 'lawyers', label: 'Advokatlar', icon: UserSquare2 },
  { key: 'chats', label: 'Chat markazi', icon: MessageCircleMore },
  { key: 'applications', label: 'Arizalar', icon: FileCheck2 },
  { key: 'subscriptions', label: 'Obunalar', icon: CreditCard },
  { key: 'funnel', label: 'Lead Funnel', icon: Activity },
  { key: 'audit', label: 'Audit Log', icon: Clock3 },
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
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';

const toArray = (value) => (Array.isArray(value) ? value : []);
const toNum = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const minutesSince = (value) => {
  const date = toDate(value);
  if (!date) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
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

const parseFeedback = (text) => {
  const raw = String(text || '');
  if (!raw.toLowerCase().includes('[feedback]')) return null;

  const ratingMatch = raw.match(/baho:\s*([1-5])/i);
  const commentMatch = raw.match(/izoh:\s*(.+)$/im);
  const rating = ratingMatch ? Number(ratingMatch[1]) : 0;

  if (!rating) return null;

  return {
    rating,
    comment: commentMatch ? commentMatch[1].trim() : '',
  };
};

const ADMIN_AUDIT_KEY = 'legallink_admin_audit_v1';

const readAuditLogs = () => {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

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
    listSupportConversations,
    getSupportMessages,
    sendSupportMessage,
    safeError,
  } = useAuth();

  const [section, setSection] = useState('overview');

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
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    average: 0,
    lowRated: 0,
    latest: [],
  });
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

  const loadFeedbackAnalytics = useCallback(
    async (conversationList = []) => {
      if (!Array.isArray(conversationList) || !conversationList.length) {
        setFeedbackStats({ total: 0, average: 0, lowRated: 0, latest: [] });
        return;
      }

      setFeedbackLoading(true);
      try {
        const targets = conversationList.slice(0, 25);
        const results = await Promise.allSettled(
          targets.map((conv) => getSupportMessages(conv.id))
        );

        const rows = [];

        results.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          const conversation = targets[index];
          const parsedRows = (Array.isArray(result.value) ? result.value : [])
            .map((msg) => {
              const parsed = parseFeedback(msg.text);
              if (!parsed) return null;
              return {
                conversationId: conversation?.id,
                client: conversation?.clientEmail || conversation?.clientName || conversation?.peerId || 'Mijoz',
                rating: parsed.rating,
                comment: parsed.comment,
                createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
              };
            })
            .filter(Boolean);

          rows.push(...parsedRows);
        });

        const total = rows.length;
        const average = total
          ? Number((rows.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1))
          : 0;
        const lowRated = rows.filter((item) => item.rating <= 3).length;
        const latest = rows
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setFeedbackStats({ total, average, lowRated, latest });
      } finally {
        setFeedbackLoading(false);
      }
    },
    [getSupportMessages]
  );

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

      setApplications(
        toArray(applicationsPayload).length
          ? toArray(applicationsPayload)
          : (applicationsPayload?.applications || applicationsPayload?.documents || applicationsPayload?.items || applicationsPayload?.data || [])
      );
      setSubscriptions(
        toArray(subscriptionsPayload).length
          ? toArray(subscriptionsPayload)
          : (subscriptionsPayload?.subscriptions || subscriptionsPayload?.items || subscriptionsPayload?.data || [])
      );
      setPlatformSettings(settingsPayload);

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

      await Promise.all([
        loadLawyers(),
        loadContentStats(),
        loadOpsPanels(),
        loadServerStatus(),
        loadFeedbackAnalytics(Array.isArray(chats) ? chats : []),
      ]);
    } catch (err) {
      setError(safeError(err, "Ma'lumotlarni yuklashda xatolik yuz berdi"));
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, listSupportConversations, loadLawyers, loadContentStats, loadOpsPanels, loadServerStatus, loadFeedbackAnalytics, safeError]);

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
      setAuditLogs(writeAuditLog({
        id: `audit_${Date.now()}`,
        action: 'admin_created',
        actor: user?.email || 'admin',
        target: newAdminEmail.trim(),
        detail: 'Yangi admin yaratildi',
        createdAt: new Date().toISOString(),
      }));
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
      setLawyerSuccess('Advokat muvaffaqiyatli qo\'shildi');
      setAuditLogs(writeAuditLog({
        id: `audit_${Date.now()}`,
        action: 'lawyer_created',
        actor: user?.email || 'admin',
        target: created.email || created.id || created.name,
        detail: `${created.name} advokat sifatida qo'shildi`,
        createdAt: new Date().toISOString(),
      }));
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
      setAuditLogs(writeAuditLog({
        id: `audit_${Date.now()}`,
        action: 'lawyer_deleted',
        actor: user?.email || 'admin',
        target: String(id),
        detail: 'Advokat o‘chirildi',
        createdAt: new Date().toISOString(),
      }));
      setLawyers((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setLawyerSuccess('Advokat o\'chirildi');
    } catch (err) {
      setLawyerError(safeError(err, 'Advokatni o\'chirishda xatolik yuz berdi'));
    }
  };

  const stats = useMemo(() => {
    const totalUsers = usersList.length;
    const totalAdmins = usersList.filter((u) => u.role === 'admin').length;
    const totalClients = usersList.filter((u) => u.role !== 'admin').length;
    const openConversations = conversations.filter((conv) => conv.status !== 'closed').length;
    const pendingApplications = applications.filter((item) =>
      ['new', 'pending', 'in_review', 'jarayonda', 'open'].includes(String(item.status || '').toLowerCase())
    ).length;
    const activeSubscriptions = subscriptions.filter((item) =>
      String(item.status || '').toLowerCase().includes('active')
    ).length;
    const overdueConversations = conversations.filter((conv) => {
      if (String(conv.status || '').toLowerCase() === 'closed') return false;
      const lastActive = conv.updatedAt || conv.updated_at || conv.lastMessageAt || conv.createdAt || conv.created_at;
      return minutesSince(lastActive) >= 5;
    }).length;

    return {
      totalUsers,
      totalAdmins,
      totalClients,
      totalLawyers: lawyers.length,
      openConversations,
      overdueConversations,
      pendingApplications,
      activeSubscriptions,
    };
  }, [applications, conversations, lawyers.length, subscriptions, usersList]);

  const slaQueue = useMemo(() => {
    return conversations
      .filter((conv) => String(conv.status || '').toLowerCase() !== 'closed')
      .map((conv) => {
        const lastActive = conv.updatedAt || conv.updated_at || conv.lastMessageAt || conv.createdAt || conv.created_at;
        return {
          id: conv.id,
          title: conv.clientEmail || conv.clientName || conv.peerId || conv.lawyerId || 'Noma\'lum chat',
          minutes: minutesSince(lastActive),
          preview: conv.lastMessage || 'Xabar yo\'q',
        };
      })
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);
  }, [conversations]);

  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((item) => (String(item.id || item._id) === String(id) ? { ...item, status } : item))
    );
    setAuditLogs(writeAuditLog({
      id: `audit_${Date.now()}`,
      action: 'application_status_changed',
      actor: user?.email || 'admin',
      target: String(id),
      detail: `Ariza holati -> ${status}`,
      createdAt: new Date().toISOString(),
    }));
    setOpsNotice(`Ariza holati yangilandi: ${status}`);
  };

  const updateSubscriptionStatus = (id, status) => {
    setSubscriptions((prev) =>
      prev.map((item) => (String(item.id || item._id) === String(id) ? { ...item, status } : item))
    );
    setAuditLogs(writeAuditLog({
      id: `audit_${Date.now()}`,
      action: 'subscription_status_changed',
      actor: user?.email || 'admin',
      target: String(id),
      detail: `Obuna holati -> ${status}`,
      createdAt: new Date().toISOString(),
    }));
    setOpsNotice(`Obuna holati yangilandi: ${status}`);
  };

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

  const documentQuotaRows = useMemo(() => getDocumentQuotaRows(), []);
  const documentQuotaStats = useMemo(() => {
    const totalUsed = documentQuotaRows.length;
    const heavyUsers = documentQuotaRows.filter((row) => row.usedCount > 1).length;
    const totalRequests = documentQuotaRows.reduce((sum, row) => sum + row.usedCount, 0);
    return { totalUsed, heavyUsers, totalRequests };
  }, [documentQuotaRows]);

  const handleLogout = () => {
    setAuditLogs(writeAuditLog({
      id: `audit_${Date.now()}`,
      action: 'admin_logout',
      actor: user?.email || 'admin',
      target: 'session',
      detail: 'Admin tizimdan chiqdi',
      createdAt: new Date().toISOString(),
    }));
    logout();
    navigate('/admin/login', { replace: true });
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
      setAuditLogs(writeAuditLog({
        id: `audit_${Date.now()}`,
        action: 'chat_message_sent',
        actor: user?.email || 'admin',
        target,
        detail: 'Admin yangi xabar yubordi',
        createdAt: new Date().toISOString(),
      }));
      setChatMessage('');
      await fetchData();
    } catch (err) {
      setChatError(safeError(err, 'Xabar yuborishda xatolik yuz berdi'));
    } finally {
      setChatSending(false);
    }
  };

  const funnel = useMemo(() => {
    const quickCheckUsers = documentQuotaStats.totalUsed;
    const registeredUsers = usersList.filter((u) => u.role !== 'admin').length;
    const startedChats = conversations.length;
    const payingUsers = subscriptions.filter((s) => String(s.status || '').toLowerCase().includes('active')).length;

    const safePct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '0%');

    return {
      quickCheckUsers,
      registeredUsers,
      startedChats,
      payingUsers,
      step1To2: safePct(registeredUsers, quickCheckUsers || 1),
      step2To3: safePct(startedChats, registeredUsers || 1),
      step3To4: safePct(payingUsers, startedChats || 1),
    };
  }, [conversations.length, documentQuotaStats.totalUsed, subscriptions, usersList]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
            {error && (
              <div className="rounded-2xl border border-red-800 bg-red-950/30 text-red-300 px-4 py-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {section === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  <StatCard label="Jami user" value={stats.totalUsers} icon={Users} />
                  <StatCard label="Adminlar" value={stats.totalAdmins} icon={UserPlus} />
                  <StatCard label="Mijozlar" value={stats.totalClients} icon={UserRound} />
                  <StatCard label="Advokatlar" value={stats.totalLawyers} icon={UserSquare2} />
                  <StatCard label="Ochiq chat" value={stats.openConversations} icon={MessageCircleMore} />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Arizalar nazorati</p>
                    <p className="text-2xl font-bold mt-1">{stats.pendingApplications}</p>
                    <p className="text-sm text-slate-400 mt-1">Jarayondagi arizalar soni</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Obuna nazorati</p>
                    <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions}</p>
                    <p className="text-sm text-slate-400 mt-1">Faol obunalar soni</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">SLA nazorati</p>
                    <p className="text-2xl font-bold mt-1">{stats.overdueConversations}</p>
                    <p className="text-sm text-slate-400 mt-1">5+ daqiqa javobsiz ochiq chatlar</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Feedbacklar</p>
                    <p className="text-2xl font-bold mt-1">{feedbackLoading ? '...' : feedbackStats.total}</p>
                    <p className="text-sm text-slate-400 mt-1">Mijoz yuborgan baholar soni</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">O'rtacha baho</p>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-2">
                      {feedbackLoading ? '...' : feedbackStats.average || '0.0'}
                      <Star size={18} className="text-amber-300 fill-amber-300" />
                    </p>
                    <p className="text-sm text-slate-400 mt-1">1 dan 5 gacha ko'rsatkich</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Past baholar</p>
                    <p className="text-2xl font-bold mt-1">{feedbackLoading ? '...' : feedbackStats.lowRated}</p>
                    <p className="text-sm text-slate-400 mt-1">3 yoki undan past baho</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Tekin hujjat ishlatganlar</p>
                    <p className="text-2xl font-bold mt-1">{documentQuotaStats.totalUsed}</p>
                    <p className="text-sm text-slate-400 mt-1">1 ta tekin limitdan foydalangan userlar</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Haddan ko'p ishlatilgan</p>
                    <p className="text-2xl font-bold mt-1">{documentQuotaStats.heavyUsers}</p>
                    <p className="text-sm text-slate-400 mt-1">1 tadan ko'p so'rov yuborganlar</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Jami document so'rovlar</p>
                    <p className="text-2xl font-bold mt-1">{documentQuotaStats.totalRequests}</p>
                    <p className="text-sm text-slate-400 mt-1">Mahalliy kvota hisobidan</p>
                  </div>
                </div>

                {opsNotice && <AlertBox type="success" text={opsNotice} />}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 size={16} className="text-amber-300" />
                    <p className="font-semibold">Kechikkan chatlar navbati</p>
                  </div>
                  {slaQueue.length === 0 ? (
                    <p className="text-sm text-slate-400">Hozircha ochiq chatlar yo'q.</p>
                  ) : (
                    <div className="space-y-2">
                      {slaQueue.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-slate-400 truncate">{item.preview}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${item.minutes >= 15 ? 'bg-red-900/30 text-red-300' : item.minutes >= 5 ? 'bg-amber-900/30 text-amber-300' : 'bg-emerald-900/30 text-emerald-300'}`}>
                            {item.minutes} min
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="font-semibold mb-3">So'nggi feedbacklar</p>
                  {feedbackLoading ? (
                    <p className="text-sm text-slate-400">Yuklanmoqda...</p>
                  ) : feedbackStats.latest.length === 0 ? (
                    <p className="text-sm text-slate-400">Hali feedbacklar yo'q.</p>
                  ) : (
                    <div className="space-y-2">
                      {feedbackStats.latest.map((item, idx) => (
                        <div key={`${item.conversationId}_${idx}`} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{item.client}</p>
                            <span className="text-xs text-amber-300 inline-flex items-center gap-1">
                              <Star size={12} className="fill-amber-300" />
                              {item.rating}/5
                            </span>
                          </div>
                          {item.comment ? (
                            <p className="text-xs text-slate-400 mt-1.5">{item.comment}</p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1.5">Izoh qoldirilmagan</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="font-semibold mb-3">Tekin hujjat limiti bo'yicha userlar</p>
                  {documentQuotaRows.length === 0 ? (
                    <p className="text-sm text-slate-400">Hozircha tekin hujjat ishlatgan user yo'q.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-sm">
                        <thead className="text-slate-400 border-b border-slate-800 bg-slate-950">
                          <tr>
                            <th className="text-left px-3 py-2.5">User</th>
                            <th className="text-left px-3 py-2.5">So'rovlar</th>
                            <th className="text-left px-3 py-2.5">Holat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentQuotaRows.slice(0, 20).map((row) => (
                            <tr key={row.identity} className="border-b border-slate-900">
                              <td className="px-3 py-2.5">{row.identity}</td>
                              <td className="px-3 py-2.5">{row.usedCount}</td>
                              <td className="px-3 py-2.5">
                                <span className="text-xs px-2 py-1 rounded-lg bg-amber-900/30 text-amber-300">
                                  Tekin limit ishlatilgan
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Eslatma: bu ko'rsatkich joriy brauzer localStorage ma'lumotidan olinadi.
                  </p>
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
                              <span className={`text-xs px-2 py-1 rounded-md font-semibold ${usr.role === 'admin' ? 'bg-blue-900/40 text-blue-300' : 'bg-slate-800 text-slate-300'}`}>
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
                    <InputDark label="Email" type="email" value={lawyerForm.email} onChange={(v) => setLawyerForm((p) => ({ ...p, email: v }))} />
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
              <Panel title="Lead Funnel" subtitle="Tez Legal Check'dan to'lovgacha bo'lgan oqim">
                <div className="grid md:grid-cols-4 gap-4">
                  <FunnelCard title="1. Qiziqqanlar" value={funnel.quickCheckUsers} helper="Tez check / tekin hujjat signal" />
                  <FunnelCard title="2. Ro'yxatdan o'tganlar" value={funnel.registeredUsers} helper={`Konversiya: ${funnel.step1To2}`} />
                  <FunnelCard title="3. Chat boshlaganlar" value={funnel.startedChats} helper={`Konversiya: ${funnel.step2To3}`} />
                  <FunnelCard title="4. To'lov qilganlar" value={funnel.payingUsers} helper={`Konversiya: ${funnel.step3To4}`} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="font-semibold mb-2">Tahlil va keyingi qadam</p>
                  <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
                    <li>Agar 1 dan 2 ga otish past bo'lsa, auth onboardingni soddalashtiring.</li>
                    <li>Agar 2 dan 3 ga otish past bo'lsa, dashboarddan chat CTA ni kuchaytiring.</li>
                    <li>Agar 3 dan 4 ga otish past bo'lsa, tarif/ishonch bloklari va prooflarni ko'paytiring.</li>
                  </ul>
                </div>
              </Panel>
            )}

            {section === 'audit' && (
              <Panel title="Audit Log" subtitle="Admin amallari tarixi (lokal log)">
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
                  Eslatma: hozircha audit localStorage'da saqlanadi. Keyingi bosqichda backendga yuboriladi.
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

function FunnelCard({ title, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{helper}</p>
    </div>
  );
}
