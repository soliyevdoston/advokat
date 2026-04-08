import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FilePlus2,
  FileText,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import CaseNavigatorWizard from '../components/caseNavigator/CaseNavigatorWizard';
import { openPaymentGateway } from '../utils/paymentGate';
import {
  activateSubscription,
  createPendingSubscription,
  hasActiveSubscription,
  readSubscriptions,
} from '../utils/subscription';
import {
  TEMPLATE_LIBRARY,
  buildTemplatePreview,
  exportTemplateAsDocx,
  exportTemplateAsPdf,
  findTemplateById,
} from '../utils/documentTemplates';
import {
  buildLawyerPool,
  pickLawyerForApplication,
  resolveSpecializationByTopic,
} from '../utils/lawyerRouting';

const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
const LOCAL_SUBSCRIPTIONS_KEY = 'legallink_user_subscriptions_v1';
const USER_APPLICATION_CREATE_ENDPOINTS = ['/user/ariza', '/applications', '/requests', '/documents', '/api/applications'];

const TAB_ITEMS = [
  { key: 'overview', label: 'Umumiy' },
  { key: 'navigator', label: 'Case Navigator' },
  { key: 'applications', label: 'Arizalar' },
  { key: 'payments', label: 'Obuna va tolov' },
  { key: 'templates', label: 'Hujjat shablonlari' },
  { key: 'chats', label: 'Chatlar' },
];

const toArray = (value) => (Array.isArray(value) ? value : []);
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeIdentity = (value) => String(value || '').trim().toLowerCase();
const pickOwnedSubscriptions = (rows, user) => {
  if (!Array.isArray(rows)) return [];
  const userEmail = normalizeIdentity(user?.email);
  const userId = String(user?.id || '').trim();

  return rows.filter((row) => {
    const rowEmail = normalizeIdentity(row?.userEmail || row?.email);
    const rowId = String(row?.userId || row?.clientId || '').trim();
    if (userEmail && rowEmail && userEmail === rowEmail) return true;
    if (userId && rowId && userId === rowId) return true;
    return false;
  });
};

export default function Dashboard() {
  const {
    user,
    authToken,
    apiBase,
    logout,
    listSupportConversations,
    ensureSupportConversation,
    safeError,
    isUserBlocked,
  } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [applications, setApplications] = useState(() => readJSON(LOCAL_APPLICATIONS_KEY, []));
  const [subscriptions, setSubscriptions] = useState(() => readJSON(LOCAL_SUBSCRIPTIONS_KEY, []));
  const [conversations, setConversations] = useState([]);
  const [templateId, setTemplateId] = useState(TEMPLATE_LIBRARY[0]?.id || 'neighbor_noise');
  const [templateValues, setTemplateValues] = useState({});

  const [appForm, setAppForm] = useState({
    title: '',
    type: 'general',
    region: '',
    description: '',
  });
  const [savingApp, setSavingApp] = useState(false);

  const activeTemplate = useMemo(() => findTemplateById(templateId), [templateId]);
  const lawyerPool = useMemo(() => buildLawyerPool(), []);

  const templatePreview = useMemo(
    () => buildTemplatePreview(templateId, templateValues),
    [templateId, templateValues]
  );

  const isProActive = useMemo(
    () => hasActiveSubscription(user, subscriptions),
    [subscriptions, user]
  );

  const apiRequest = useCallback(
    async (paths, { method = 'GET', body } = {}) => {
      let lastErr = null;

      for (const path of paths) {
        try {
          const response = await fetch(`${apiBase}${path}`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
        } catch (err) {
          lastErr = err;
          if (err?.status === 404 || err?.status === 405) continue;
          throw err;
        }
      }

      throw lastErr || new Error('Endpoint topilmadi');
    },
    [apiBase, authToken]
  );

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const localApps = readJSON(LOCAL_APPLICATIONS_KEY, []);
      const localSubs = pickOwnedSubscriptions(readSubscriptions(), user);
      setApplications(localApps);
      setSubscriptions(localSubs);
      saveJSON(LOCAL_APPLICATIONS_KEY, localApps);
      saveJSON(LOCAL_SUBSCRIPTIONS_KEY, localSubs);

      const [chatsRes] = await Promise.allSettled([
        listSupportConversations(),
      ]);

      if (chatsRes.status === 'fulfilled') {
        setConversations(Array.isArray(chatsRes.value) ? chatsRes.value : []);
      }

      if (chatsRes.status === 'rejected') {
        throw new Error("Ma'lumotlarni yuklab bo'lmadi");
      }
    } catch (err) {
      setError(safeError(err, "Kabinet ma'lumotlarini yuklashda xatolik"));
      setApplications(readJSON(LOCAL_APPLICATIONS_KEY, []));
      setSubscriptions(pickOwnedSubscriptions(readJSON(LOCAL_SUBSCRIPTIONS_KEY, []), user));
    } finally {
      setLoading(false);
    }
  }, [listSupportConversations, safeError, user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [loadDashboardData, user]);

  const stats = useMemo(() => {
    const openApplications = applications.filter(
      (item) => !['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())
    ).length;
    const activeSubscriptions = isProActive ? 1 : 0;
    const openChats = conversations.filter((item) => String(item?.status || '').toLowerCase() !== 'closed').length;

    return { openApplications, activeSubscriptions, openChats };
  }, [applications, conversations, isProActive]);

  const priorityTasks = useMemo(() => {
    const list = [];
    if (stats.openApplications > 0) {
      list.push(`${stats.openApplications} ta ariza jarayonda. Statuslarni kuzating.`);
    }
    const waitingApproval = applications.filter((item) => item.chatApproved === false).length;
    if (waitingApproval > 0) {
      list.push(`${waitingApproval} ta arizada chat admin tasdig‘ini kutmoqda.`);
    }
    if (!isProActive) {
      list.push('Pro obuna yoqilmagan. Tezkor xizmatlar uchun obunani faollashtiring.');
    }
    if (!list.length) {
      list.push('Hammasi joyida. Yangi murojaat yaratish orqali ishni davom ettiring.');
    }
    return list.slice(0, 3);
  }, [applications, isProActive, stats.openApplications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateApplication = useCallback(async (event) => {
    event.preventDefault();
    if (savingApp) return;
    if (user && isUserBlocked(user)) {
      setError("Hisob bloklangan. Ariza yuborish mumkin emas.");
      return;
    }

    if (!appForm.title.trim() || !appForm.description.trim()) {
      setError('Ariza nomi va tavsifini kiriting');
      return;
    }

    setSavingApp(true);
    setError('');
    setNotice('');

    const region = String(appForm.region || user?.region || user?.city || 'toshkent').trim();
    const specialization = resolveSpecializationByTopic(appForm.type);
    const defaultLawyer = pickLawyerForApplication({
      region,
      specialization,
      pool: lawyerPool,
    });

    const payload = {
      title: appForm.title.trim(),
      subject: appForm.title.trim(),
      type: appForm.type,
      region,
      content: appForm.description.trim(),
      description: appForm.description.trim(),
      text: appForm.description.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      userEmail: user?.email || '',
      userId: user?.id || null,
      lawyer_id: defaultLawyer?.id || null,
      assignedLawyerId: defaultLawyer?.id || null,
      assignedLawyerEmail: defaultLawyer?.email || '',
      assignedLawyerName: defaultLawyer?.name || '',
      chatApproved: false,
      source: 'dashboard_manual',
    };

    try {
      const data = await apiRequest(
        USER_APPLICATION_CREATE_ENDPOINTS,
        { method: 'POST', body: payload }
      );

      const created = data?.application || data?.request || data?.document || data?.data || data || payload;
      const next = [created, ...applications];
      setApplications(next);
      saveJSON(LOCAL_APPLICATIONS_KEY, next);
      try {
        await ensureSupportConversation({ lawyerId: created?.assignedLawyerId || defaultLawyer?.id || null });
      } catch {
        // chat auto-create fallback: ariza oqimi ishlashda davom etadi
      }
      setNotice(created?.assignedLawyerName
        ? `Ariza yaratildi va ${created.assignedLawyerName} ga biriktirildi`
        : 'Ariza muvaffaqiyatli yaratildi');
      setAppForm({ title: '', type: 'general', region: '', description: '' });
    } catch (err) {
      const localCreated = { ...payload, id: `local_app_${Date.now()}` };
      const next = [localCreated, ...applications];
      setApplications(next);
      saveJSON(LOCAL_APPLICATIONS_KEY, next);
      try {
        await ensureSupportConversation({ lawyerId: localCreated?.assignedLawyerId || defaultLawyer?.id || null });
      } catch {
        // local fallbackda chat yaratilmasa ham ariza saqlanadi
      }
      setNotice(localCreated?.assignedLawyerName
        ? `Serverga yuborilmadi, local ariza ${localCreated.assignedLawyerName} ga biriktirildi`
        : 'Serverga yuborilmadi, local ariza sifatida saqlandi');
      setAppForm({ title: '', type: 'general', region: '', description: '' });
      setError(safeError(err, "Ariza yaratishda xatolik"));
    } finally {
      setSavingApp(false);
    }
  }, [
    appForm.description,
    appForm.region,
    appForm.title,
    appForm.type,
    applications,
    apiRequest,
    ensureSupportConversation,
    isUserBlocked,
    lawyerPool,
    savingApp,
    safeError,
    user,
  ]);

  const handlePay = (gateway) => {
    setError('');
    setNotice('');
    const amount = 149000;
    createPendingSubscription({
      user,
      gateway,
      amount,
      plan: 'PRO',
    });
    const opened = openPaymentGateway({
      gateway,
      amount,
      plan: 'pro_subscription',
      userEmail: user?.email || '',
    });

    if (!opened) {
      setError(`${gateway.toUpperCase()} tolovi sozlanmagan. .env ga VITE_${gateway.toUpperCase()}_* qiymatlarini kiriting.`);
      const pendingRows = readSubscriptions();
      setSubscriptions(pendingRows);
      saveJSON(LOCAL_SUBSCRIPTIONS_KEY, pendingRows);
      return;
    }

    activateSubscription({
      user,
      gateway,
      amount,
      plan: 'PRO',
    });
    const nextRows = readSubscriptions();
    setSubscriptions(nextRows);
    saveJSON(LOCAL_SUBSCRIPTIONS_KEY, nextRows);
    setNotice(`${gateway.toUpperCase()} to‘lovi qabul qilindi va PRO obuna avtomatik faollashtirildi`);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user.role === 'lawyer') {
    return <Navigate to="/lawyer" replace />;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Salom, {user.name || user.email}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
              Shaxsiy kabinet: arizalar, chatlar va obuna boshqaruvi
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadDashboardData} className="gap-2">
              <RefreshCw size={16} /> Yangilash
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <LogOut size={16} className="mr-2" /> Chiqish
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <StatBox icon={FileText} title="Ochilgan ariza" value={stats.openApplications} />
          <StatBox icon={MessageSquare} title="Ochiq chat" value={stats.openChats} />
          <StatBox icon={CreditCard} title="Faol obuna" value={stats.activeSubscriptions} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                activeTab === item.key
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-10 flex flex-col items-center text-slate-500">
            <Loader2 size={30} className="animate-spin mb-3" />
            Yuklanmoqda...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-4 gap-5">
                <Card title="Tez amallar">
                  <div className="space-y-2">
                    <Button onClick={() => setActiveTab('navigator')} className="btn-primary w-full">Case Navigator</Button>
                    <Button onClick={() => setActiveTab('applications')} className="btn-primary w-full">Ariza yaratish</Button>
                    <Button onClick={() => setActiveTab('payments')} variant="outline" className="w-full">Obuna ulash</Button>
                    <Button onClick={() => setActiveTab('templates')} variant="outline" className="w-full">Hujjat shablonlari</Button>
                    <Button onClick={() => navigate('/chat/support')} variant="outline" className="w-full">Support chatga kirish</Button>
                  </div>
                </Card>
                <Card title="Oxirgi arizalar">
                  {applications.length === 0 ? <Empty text="Hali ariza yo'q" /> : (
                    <ul className="space-y-2">
                      {applications.slice(0, 4).map((item, idx) => (
                        <li key={String(item.id || idx)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-900 dark:text-white">{item.title || item.subject || 'Nomsiz ariza'}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.status || 'new'}</p>
                          {item.assignedLawyerName && (
                            <p className="text-xs text-slate-500 mt-1">Advokat: {item.assignedLawyerName}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card title="Tolov holati">
                  {subscriptions.length === 0 ? <Empty text="Obuna topilmadi" /> : (
                    <ul className="space-y-2">
                      {subscriptions.slice(0, 4).map((item, idx) => (
                        <li key={String(item.id || idx)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-900 dark:text-white">{item.plan || 'PRO'} - {item.amount || 149000} UZS</p>
                          <p className="text-xs text-slate-500 mt-1">{item.gateway || item.type || '-'} / {item.status || 'pending'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card title="Action Center">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {priorityTasks.map((task) => (
                      <li key={task} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        {task}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {activeTab === 'navigator' && (
              <CaseNavigatorWizard mode="dashboard" />
            )}

            {activeTab === 'applications' && (
              <div className="grid lg:grid-cols-2 gap-5">
                <Card title="Yangi ariza yaratish">
                  <form onSubmit={handleCreateApplication} className="space-y-3">
                    <Field label="Ariza nomi" value={appForm.title} onChange={(v) => setAppForm((p) => ({ ...p, title: v }))} />
                    <label className="block space-y-1">
                      <span className="text-xs text-slate-500">Turi</span>
                      <select
                        value={appForm.type}
                        onChange={(e) => setAppForm((p) => ({ ...p, type: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                      >
                        <option value="general">Umumiy murojaat</option>
                        <option value="document">Hujjat tayyorlash</option>
                        <option value="consultation">Maslahat</option>
                        <option value="court">Sud masalasi</option>
                      </select>
                    </label>
                    <Field
                      label="Hudud / viloyat (default advokat uchun)"
                      value={appForm.region}
                      onChange={(v) => setAppForm((p) => ({ ...p, region: v }))}
                    />
                    <label className="block space-y-1">
                      <span className="text-xs text-slate-500">Tavsif</span>
                      <textarea
                        rows={4}
                        value={appForm.description}
                        onChange={(e) => setAppForm((p) => ({ ...p, description: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                      />
                    </label>
                    <Button type="submit" disabled={savingApp} className="btn-primary w-full">
                      {savingApp ? <Loader2 size={16} className="animate-spin" /> : <FilePlus2 size={16} className="mr-2" />}
                      Ariza yuborish
                    </Button>
                  </form>
                </Card>

                <Card title="Mening arizalarim">
                  {applications.length === 0 ? <Empty text="Arizalar hali yo'q" /> : (
                    <div className="space-y-2 max-h-[450px] overflow-auto pr-1">
                      {applications.map((item, idx) => (
                        <div key={String(item.id || item._id || idx)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-900 dark:text-white">{item.title || item.subject || 'Nomsiz ariza'}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.description || item.text || '-'}</p>
                          {item.assignedLawyerName && (
                            <p className="text-xs text-slate-500 mt-1">Biriktirilgan advokat: {item.assignedLawyerName}</p>
                          )}
                          <div className="mt-2 inline-flex text-xs px-2 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            {item.status || 'new'}
                          </div>
                          <div className={`mt-2 inline-flex text-xs px-2 py-1 rounded-lg ${
                            item.chatApproved ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.chatApproved ? 'Chat ruxsati berilgan' : 'Chat admin tasdig‘ini kutmoqda'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="grid lg:grid-cols-3 gap-5">
                <Card title="PRO obuna">
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    149 000 UZS / oy. Click yoki Payme orqali tolov qiling.
                  </p>
                  <p className={`text-xs mb-3 inline-flex px-2 py-1 rounded-lg ${
                    isProActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {isProActive ? 'PRO obuna faol' : 'PRO obuna faol emas'}
                  </p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 24/7 support chat</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Arizalarda ustuvor korib chiqish</li>
                    <li className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Hujjatlar tarixi saqlanadi</li>
                  </ul>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handlePay('click')}
                      className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      CLICK orqali tolov
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePay('payme')}
                      className="w-full px-4 py-3 rounded-xl bg-[#1f3bff] text-white font-semibold hover:opacity-90"
                    >
                      PAYME orqali tolov
                    </button>
                  </div>
                </Card>

                <Card title="Tolov yo'riqnomasi">
                  <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                    <li>To'lov turini tanlang (Click yoki Payme).</li>
                    <li>Ilova/sahifaga avtomatik yonaltirilasiz.</li>
                    <li>To'lovdan keyin status `active` bo'lib avtomatik ochiladi.</li>
                  </ol>
                </Card>

                <Card title="Obuna tarixi">
                  {subscriptions.length === 0 ? <Empty text="Tolovlar hali yo'q" /> : (
                    <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                      {subscriptions.map((item, idx) => (
                        <div key={String(item.id || idx)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-900 dark:text-white">{item.plan || 'PRO'} - {item.amount || 149000} UZS</p>
                          <p className="text-xs text-slate-500 mt-1">{item.gateway || '-'} / {item.status || 'pending'}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.createdAt || item.expiresAt || '-'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid xl:grid-cols-2 gap-5">
                <Card title="Hujjat shabloni">
                  <div className="space-y-3">
                    <label className="block space-y-1">
                      <span className="text-xs text-slate-500">Shablon turi</span>
                      <select
                        value={templateId}
                        onChange={(event) => {
                          setTemplateId(event.target.value);
                          setTemplateValues({});
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                      >
                        {TEMPLATE_LIBRARY.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-3">
                      {activeTemplate.fields.map((field) => (
                        <label key={field.key} className="block space-y-1">
                          <span className="text-xs text-slate-500">{field.label}</span>
                          <input
                            value={templateValues[field.key] || ''}
                            onChange={(event) => setTemplateValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          try {
                            void exportTemplateAsDocx(templateId, templateValues);
                            setNotice('DOCX fayl muvaffaqiyatli yuklab olindi');
                          } catch (err) {
                            setError(safeError(err, 'DOCX yuklab olishda xatolik'));
                          }
                        }}
                        className="btn-primary w-full"
                      >
                        <Download size={16} className="mr-2" />
                        DOCX yuklash
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          try {
                            exportTemplateAsPdf(templateId, templateValues);
                            setNotice('PDF fayl muvaffaqiyatli yuklab olindi');
                          } catch (err) {
                            setError(safeError(err, 'PDF yuklab olishda xatolik'));
                          }
                        }}
                        className="w-full"
                      >
                        <Download size={16} className="mr-2" />
                        PDF yuklash
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card title="Ko‘rinish (preview)">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 min-h-[560px] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200 font-sans">
                      {templatePreview}
                    </pre>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="grid lg:grid-cols-3 gap-5">
                <Card title="Chat markazi">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Support yoki advokat bilan alohida chat ochishingiz mumkin.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => navigate('/chat/support')} className="btn-primary w-full">
                      Support chatga kirish
                    </Button>
                    <Button onClick={() => navigate('/lawyers')} variant="outline" className="w-full">
                      Advokat tanlash
                    </Button>
                  </div>
                </Card>

                <div className="lg:col-span-2">
                  <Card title="Suhbatlar ro'yxati">
                    {conversations.length === 0 ? <Empty text="Hali chatlar yo'q" /> : (
                      <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                        {conversations.map((conv) => (
                          <div key={conv.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">{conv.clientName || conv.clientEmail || 'Suhbat'}</p>
                              <span className={`text-xs px-2 py-1 rounded-md ${String(conv.status || '').toLowerCase() === 'closed' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                                {conv.status || 'open'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{conv.lastMessage || 'Xabar yoq'}</p>
                            <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1"><Clock3 size={12} /> {conv.updatedAt || conv.createdAt || '-'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 inline-flex items-center gap-2">
        <ShieldCheck size={18} className="text-[var(--color-primary)] dark:text-blue-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatBox({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center">
        {React.createElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
      />
    </label>
  );
}

function Empty({ text }) {
  return (
    <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
      {text}
    </div>
  );
}
