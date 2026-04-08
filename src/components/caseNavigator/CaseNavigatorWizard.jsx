import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Gauge,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../config/appConfig';
import { readLocalLawyers } from '../../utils/localLawyers';
import { lawyers as seedLawyers } from '../../data/lawyers';
import { loadPlatformStats } from '../../utils/platformStats';
import { openPaymentGateway } from '../../utils/paymentGate';
import {
  activateSubscription,
  createPendingSubscription,
  hasActiveSubscription,
  readSubscriptions,
} from '../../utils/subscription';
import {
  CASE_NAVIGATOR_OPTIONS,
  CASE_NAVIGATOR_PRICE_LABEL,
  CASE_NAVIGATOR_PRICE_UZS,
  evaluateCaseNavigator,
  getSpecializationLabel,
  getTopicLabel,
  matchLawyerForCase,
} from '../../utils/caseNavigator';

const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
const LAWYER_ENDPOINTS = ['/advokat/lawyers', '/advokat/list', '/advokat', '/lawyers', '/api/lawyers'];
const APPLICATION_ENDPOINTS = ['/user/ariza', '/ariza', '/requests', '/applications', '/documents', '/api/applications'];

const STEPS = [
  { id: 'situation', title: '1. Vaziyatni belgilang' },
  { id: 'approach', title: '2. Yondashuv va budjet' },
  { id: 'region', title: '3. Hudud va natija' },
];

const DEFAULT_FORM = {
  urgency: 'medium',
  topic: 'consultation',
  style: 'ai',
  budget: 'moderate',
  region: 'toshkent',
};

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

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeLawyer = (raw = {}) => {
  const location = raw.location && typeof raw.location === 'object'
    ? raw.location
    : { city: raw.city || 'toshkent', district: raw.district || '' };

  return {
    id: raw.id || raw._id || raw.lawyerId || `lawyer_${Date.now()}`,
    name: raw.name || "Noma'lum advokat",
    specialization: String(raw.specialization || 'civil').toLowerCase(),
    rating: toNumber(raw.rating, 0),
    reviews: toNumber(raw.reviews, 0),
    email: raw.email || '',
    phone: raw.phone || '',
    telegram: raw.telegram || '',
    location,
    cases: {
      total: toNumber(raw?.cases?.total ?? raw.totalCases, 0),
      won: toNumber(raw?.cases?.won ?? raw.wonCases, 0),
    },
  };
};

const mapLawyers = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.lawyers || payload?.data || payload?.items || []);

  return Array.isArray(list) ? list.map(normalizeLawyer) : [];
};

async function fetchLawyersForMatching({ authToken } = {}) {
  let lastErr = null;

  for (const endpoint of LAWYER_ENDPOINTS) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const err = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const remote = mapLawyers(data);
      if (remote.length) return remote;
    } catch (err) {
      lastErr = err;
      if (err?.status === 401 || err?.status === 403 || err?.status === 404 || err?.status === 405) {
        continue;
      }
      break;
    }
  }

  if (lastErr) {
    // no-op: fallback handled below
  }

  const localRows = readLocalLawyers().map(normalizeLawyer);
  if (localRows.length) return localRows;

  return seedLawyers.map(normalizeLawyer);
}

async function createApplicationWithFallback({ payload, authToken }) {
  let lastError = null;

  for (const endpoint of APPLICATION_ENDPOINTS) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const err = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const created = data?.application || data?.request || data?.document || data?.data || data || payload;
      const current = readJSON(LOCAL_APPLICATIONS_KEY, []);
      writeJSON(LOCAL_APPLICATIONS_KEY, [created, ...current]);

      return { created, localFallback: false };
    } catch (err) {
      lastError = err;
      if (err?.status === 404 || err?.status === 405) continue;
    }
  }

  const localCreated = {
    ...payload,
    id: payload.id || `local_case_nav_${Date.now()}`,
    status: payload.status || 'new',
    localOnly: true,
  };

  const current = readJSON(LOCAL_APPLICATIONS_KEY, []);
  writeJSON(LOCAL_APPLICATIONS_KEY, [localCreated, ...current]);

  return { created: localCreated, localFallback: true, error: lastError };
}

const getRiskTheme = (riskLevel) => {
  if (riskLevel === 'high') {
    return {
      badge: 'Yuqori risk',
      ring: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20',
      text: 'text-rose-700 dark:text-rose-300',
    };
  }

  if (riskLevel === 'medium') {
    return {
      badge: 'O\'rta risk',
      ring: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
    };
  }

  return {
    badge: 'Past risk',
    ring: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  };
};

export default function CaseNavigatorWizard({ mode = 'home' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authToken, safeError } = useAuth();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [payLoading, setPayLoading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [handoffMeta, setHandoffMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(mode === 'home');

  const isDashboardMode = mode === 'dashboard';
  const isPageMode = mode === 'page';
  const showMetrics = mode === 'home';

  const isProActive = user ? hasActiveSubscription(user, readSubscriptions()) : false;

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (!showMetrics) return undefined;

    let active = true;
    const load = async () => {
      setStatsLoading(true);
      const payload = await loadPlatformStats();
      if (!active) return;
      setStats(payload);
      setStatsLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [showMetrics]);

  const liveMetrics = [
    {
      label: 'Bugungi murojaatlar',
      value: stats?.todayRequests ? `${stats.todayRequests}+` : '0',
    },
    {
      label: 'O\'rtacha birinchi javob',
      value: stats?.avgFirstResponseMin ? `${stats.avgFirstResponseMin} min` : '2 min',
    },
    {
      label: 'Mijoz qoniqishi',
      value: stats?.satisfaction ? `${stats.satisfaction}/5` : '4.8/5',
    },
  ];

  const recommendedLawyerName = handoffMeta?.lawyer?.name || '';

  const goToAuth = useCallback(() => {
    navigate('/auth', {
      state: {
        isLogin: false,
        from: { pathname: location.pathname || '/case-navigator' },
        source: 'case_navigator',
      },
    });
  }, [location.pathname, navigate]);

  const handleEvaluate = async () => {
    setError('');
    setMessage('');
    setHandoffMeta(null);
    setLoadingResult(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const evaluation = evaluateCaseNavigator(form);
      setResult(evaluation);
      setMessage('Action Plan Pack tayyorlandi.');
    } catch (err) {
      setError(safeError(err, 'Case Navigator natijasini hisoblashda xatolik yuz berdi'));
    } finally {
      setLoadingResult(false);
    }
  };

  const handleProPayment = async (gateway) => {
    if (payLoading || handoffLoading) return;
    setError('');
    setMessage('');

    if (!user) {
      goToAuth();
      return;
    }

    setPayLoading(gateway);

    try {
      createPendingSubscription({
        user,
        gateway,
        amount: CASE_NAVIGATOR_PRICE_UZS,
        plan: 'PRO',
      });

      const opened = openPaymentGateway({
        gateway,
        amount: CASE_NAVIGATOR_PRICE_UZS,
        plan: 'pro_case_navigator',
        userEmail: user?.email || '',
      });

      if (!opened) {
        setError(`${gateway.toUpperCase()} to'lov sozlanmagan. .env konfiguratsiyasini tekshiring.`);
        return;
      }

      activateSubscription({
        user,
        gateway,
        amount: CASE_NAVIGATOR_PRICE_UZS,
        plan: 'PRO',
      });

      setMessage(`${gateway.toUpperCase()} orqali PRO faollashtirildi.`);
    } catch (err) {
      setError(safeError(err, 'PRO obunani faollashtirishda xatolik yuz berdi'));
    } finally {
      setPayLoading('');
    }
  };

  const handleCreateCaseAndMatch = async () => {
    if (!result || handoffLoading) return;
    setError('');
    setMessage('');

    if (!user) {
      goToAuth();
      return;
    }

    if (!isProActive) {
      setError('To\'liq Action Plan Pack va handoff uchun PRO obuna talab qilinadi.');
      return;
    }

    setHandoffLoading(true);

    try {
      const pool = await fetchLawyersForMatching({ authToken });
      const matchedLawyer = matchLawyerForCase(result, pool) || null;
      const now = new Date().toISOString();
      const topicLabel = getTopicLabel(form.topic);

      const details = [
        `Case Navigator xulosasi: ${result.summary}`,
        `Risk: ${result.riskLevel} (${result.riskScore}/100)`,
        `Tavsiya etilgan yo'nalish: ${getSpecializationLabel(result.recommendedSpecialization)}`,
        `Qisqa qadamlar: ${result.shortNextSteps.join(' | ')}`,
      ].join('\n');

      const payload = {
        id: `case_nav_${Date.now()}`,
        title: `Case Navigator: ${topicLabel}`,
        subject: `${topicLabel} bo'yicha murojaat`,
        type: form.topic,
        content: details,
        description: details,
        text: details,
        status: 'new',
        createdAt: now,
        userEmail: user?.email || '',
        userId: user?.id || null,
        lawyer_id: matchedLawyer?.id || null,
        assignedLawyerId: matchedLawyer?.id || null,
        assignedLawyerEmail: matchedLawyer?.email || '',
        assignedLawyerName: matchedLawyer?.name || '',
        chatApproved: false,
        source: 'case_navigator',
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        recommendedSpecialization: result.recommendedSpecialization,
      };

      const { created, localFallback } = await createApplicationWithFallback({
        payload,
        authToken,
      });

      setHandoffMeta({
        application: created,
        lawyer: matchedLawyer,
        localFallback,
      });

      setMessage(localFallback
        ? 'Case yaratildi. Serverga yuborilmadi, local fallback ishlatildi.'
        : 'Case yaratildi va mos advokatga biriktirildi.');
    } catch (err) {
      setError(safeError(err, 'Case yaratish va advokat biriktirishda xatolik yuz berdi'));
    } finally {
      setHandoffLoading(false);
    }
  };

  const riskTheme = result ? getRiskTheme(result.riskLevel) : null;

  const wrapperClass = isDashboardMode
    ? ''
    : isPageMode
      ? ''
      : 'py-9 md:py-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-300';

  const containerClass = isDashboardMode
    ? ''
    : 'section-wrap';

  return (
    <section className={wrapperClass}>
      <div className={containerClass}>
        <div className={`grid gap-4 ${showMetrics ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          {showMetrics && (
            <div className="surface-card rounded-3xl p-4 md:p-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <Activity size={13} /> Live ko'rsatkichlar
              </div>

              <div className="mt-3 space-y-2.5">
                {liveMetrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-3.5 py-2.5">
                    {statsLoading ? (
                      <div className="space-y-1.5 animate-pulse">
                        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Case Navigator: AI endpointsiz deterministik baholash.
              </p>
            </div>
          )}

          <div className={`${showMetrics ? 'lg:col-span-2' : ''} space-y-4`}>
            <div className="surface-card rounded-3xl p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    Case Navigator 1.0
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    30 soniyada `Action Plan Pack`: risk balli + 7 kunlik amaliy qadamlar.
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                  <ShieldCheck size={13} /> Rule-based
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>{STEPS[step].title}</span>
                  <span>{step + 1}/{STEPS.length}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-3">
                  <OptionGroup
                    title="Muammo shoshilinchligi"
                    options={CASE_NAVIGATOR_OPTIONS.urgency}
                    value={form.urgency}
                    onChange={(value) => setForm((prev) => ({ ...prev, urgency: value }))}
                  />
                  <OptionGroup
                    title="Murojaat turi"
                    options={CASE_NAVIGATOR_OPTIONS.topic}
                    value={form.topic}
                    onChange={(value) => setForm((prev) => ({ ...prev, topic: value }))}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-3">
                  <OptionGroup
                    title="Qaysi uslub qulay?"
                    options={CASE_NAVIGATOR_OPTIONS.style}
                    value={form.style}
                    onChange={(value) => setForm((prev) => ({ ...prev, style: value }))}
                  />
                  <OptionGroup
                    title="Budjet holati"
                    options={CASE_NAVIGATOR_OPTIONS.budget}
                    value={form.budget}
                    onChange={(value) => setForm((prev) => ({ ...prev, budget: value }))}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3">
                  <OptionGroup
                    title="Hudud"
                    options={CASE_NAVIGATOR_OPTIONS.region}
                    value={form.region}
                    onChange={(value) => setForm((prev) => ({ ...prev, region: value }))}
                  />

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tanlangan sozlamalar</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {getTopicLabel(form.topic)} · {CASE_NAVIGATOR_OPTIONS.urgency.find((item) => item.value === form.urgency)?.label} · {CASE_NAVIGATOR_OPTIONS.style.find((item) => item.value === form.style)?.label}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                  disabled={step === 0 || loadingResult}
                >
                  Orqaga
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
                    className="btn-primary"
                    disabled={loadingResult}
                  >
                    Keyingi bosqich
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      void handleEvaluate();
                    }}
                    className="btn-primary"
                    disabled={loadingResult}
                  >
                    {loadingResult ? <Loader2 size={16} className="animate-spin mr-2" /> : <Gauge size={16} className="mr-2" />}
                    Action Plan Pack yaratish
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            {result && riskTheme && (
              <div className="surface-card rounded-3xl p-4 md:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Action Plan Pack</p>
                    <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      {getTopicLabel(form.topic)} uchun yo'l xarita
                    </h4>
                  </div>

                  <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${riskTheme.ring} ${riskTheme.text}`}>
                    {riskTheme.badge}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <InfoStat label="Risk balli" value={`${result.riskScore}/100`} icon={Gauge} />
                  <InfoStat label="Risk darajasi" value={result.riskLevel} icon={Activity} />
                  <InfoStat
                    label="Tavsiya soha"
                    value={getSpecializationLabel(result.recommendedSpecialization)}
                    icon={ShieldCheck}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{result.summary}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Free paket: keyingi 2 qadam
                  </p>
                  <ul className="space-y-2">
                    {result.shortNextSteps.slice(0, 2).map((item) => (
                      <li key={item} className="text-sm text-slate-700 dark:text-slate-200 inline-flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isProActive ? (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                          <Lock size={15} className="text-amber-600 dark:text-amber-300" />
                          Pro Pack qulflangan
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          To'liq 7 kunlik plan + hujjatlar checklist + Create Case + Match Lawyer
                        </p>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-2">
                          Narx: {CASE_NAVIGATOR_PRICE_LABEL}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            void handleProPayment('click');
                          }}
                          disabled={Boolean(payLoading)}
                        >
                          {payLoading === 'click' ? <Loader2 size={14} className="animate-spin mr-1" /> : <CreditCard size={14} className="mr-1" />}
                          Click
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            void handleProPayment('payme');
                          }}
                          disabled={Boolean(payLoading)}
                        >
                          {payLoading === 'payme' ? <Loader2 size={14} className="animate-spin mr-1" /> : <CreditCard size={14} className="mr-1" />}
                          Payme
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Pro paket: 7 kunlik to'liq plan
                      </p>
                      <ul className="space-y-2">
                        {result.fullPlan.map((item) => (
                          <li key={item} className="text-sm text-slate-700 dark:text-slate-200 inline-flex items-start gap-2">
                            <ArrowRight size={15} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Talab qilinadigan hujjatlar
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {result.requiredDocs.map((item) => (
                          <li key={item} className="text-sm text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                        <UserRoundCheck size={16} className="text-[var(--color-primary)]" />
                        Handoff: Create Case + Match Lawyer
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ariza oqimiga yoziladi va specialization + reyting bo'yicha advokat biriktiriladi.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            void handleCreateCaseAndMatch();
                          }}
                          disabled={handoffLoading}
                        >
                          {handoffLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <FileCheck2 size={14} className="mr-1" />}
                          Case yaratish va biriktirish
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/lawyers?specialization=${result.recommendedSpecialization}`)}
                        >
                          Shu yo'nalishdagi advokatlar
                        </Button>
                      </div>

                      {handoffMeta && (
                        <div className="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                          <p>
                            {recommendedLawyerName
                              ? `Biriktirildi: ${recommendedLawyerName}`
                              : 'Case yaratildi, mos advokat topilmagani uchun umumiy navbatga yuborildi.'}
                          </p>
                          <p className="text-xs mt-1 text-emerald-700/80 dark:text-emerald-300/80">
                            {handoffMeta.localFallback ? 'Serverga yuborish muvaffaqiyatsiz, local fallback saqlandi.' : 'Ariza server oqimiga muvaffaqiyatli yuborildi.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({ title, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{title}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-colors ${
              value === option.value
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoStat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5">
      <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
        {React.createElement(icon, { size: 13 })}
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
