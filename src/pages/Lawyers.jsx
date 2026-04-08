import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Star,
  MapPin,
  Briefcase,
  Phone,
  MessageSquare,
  ShieldCheck,
  Search,
  Loader2,
  AlertCircle,
  Scale,
  X,
  Sparkles,
  Users,
  TrendingUp,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LawyerFilter from '../components/lawyers/LawyerFilter';
import LawyerModal from '../components/lawyers/LawyerModal';
import { buildApiUrl } from '../config/appConfig';
import { readLocalLawyers } from '../utils/localLawyers';
import { lawyers as seedLawyers } from '../data/lawyers';

const MotionDiv = motion.div;

const LAWYER_ENDPOINTS = ['/advokat/lawyers', '/advokat/list', '/advokat', '/lawyers', '/api/lawyers'];
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';
const SHORTLIST_KEY = 'legallink_lawyer_shortlist_v1';
const TOKEN_KEY = 'advokat_auth_token';
const SPECIALIZATION_VALUES = new Set(['all', 'criminal', 'civil', 'family', 'business', 'labor', 'international', 'inheritance']);

const numberFormatter = new Intl.NumberFormat('uz-UZ');

const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const readShortlist = () => {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
};

const writeShortlist = (ids) => {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids.slice(0, 3)));
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCount = (value) => numberFormatter.format(Math.max(0, Math.round(toNumber(value, 0))));

const getLawyerWinRate = (lawyer) => {
  const total = toNumber(lawyer?.cases?.total, 0);
  const won = toNumber(lawyer?.cases?.won, 0);
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((won / total) * 100)));
};

const normalizeLawyer = (raw = {}) => {
  const rawLocation =
    raw.location && typeof raw.location === 'object'
      ? raw.location
      : { city: raw.city || 'toshkent', district: raw.district || '' };
  const cases = raw.cases || {};

  return {
    id: raw.id || raw._id || raw.lawyerId || `lawyer_${Date.now()}`,
    name: raw.name || "Noma'lum advokat",
    specialization: raw.specialization || 'civil',
    rating: toNumber(raw.rating, 4.8),
    reviews: toNumber(raw.reviews, 0),
    cases: {
      total: toNumber(cases.total, toNumber(raw.totalCases, 0)),
      won: toNumber(cases.won, toNumber(raw.wonCases, 0)),
    },
    location: {
      city: rawLocation.city || 'toshkent',
      district: rawLocation.district || '',
    },
    image: raw.image || DEFAULT_AVATAR,
    level: raw.level || 'first',
    experience: toNumber(raw.experience, 1),
    languages: Array.isArray(raw.languages)
      ? raw.languages
      : String(raw.languages || "O'zbek")
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    license: raw.license || '-',
    workHours: raw.workHours || '09:00 - 18:00',
    bio: raw.bio || `${raw.name || 'Advokat'} bo'yicha ma'lumot hozircha yo'q`,
    email: raw.email || '',
    phone: raw.phone || '',
    telegram: raw.telegram || '',
  };
};

const getLocationLabel = (location, t) => {
  if (!location) return '';
  if (typeof location === 'string') return location;

  const cityKey = location.city ? `data.locations.${location.city}` : '';
  const districtKey = location.district ? `data.locations.${location.district}` : '';

  const cityValue = cityKey ? t(cityKey) : '';
  const districtValue = districtKey ? t(districtKey) : '';
  const city = !cityKey || cityValue === cityKey ? location.city || '' : cityValue;
  const district = !districtKey || districtValue === districtKey ? location.district || '' : districtValue;

  return [city, district].filter(Boolean).join(', ');
};

const mapLawyerList = (data) => {
  const list = Array.isArray(data) ? data : data.lawyers || data.data || data.items || [];
  return Array.isArray(list) ? list.map(normalizeLawyer) : [];
};

async function fetchLawyersAny(signal) {
  let lastError = null;

  for (const endpoint of LAWYER_ENDPOINTS) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        signal,
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return mapLawyerList(data);
    } catch (err) {
      lastError = err;
      if (err?.name === 'AbortError') throw err;
      if (err?.status === 401 || err?.status === 403 || err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }

  throw lastError || new Error('Advokatlar endpoint topilmadi');
}

const Lawyers = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [shortlistIds, setShortlistIds] = useState(() => readShortlist());
  const [filters, setFilters] = useState({
    search: '',
    specialization: 'all',
    location: 'all',
    price: 'all',
  });

  const specializationFromUrlRaw = String(searchParams.get('specialization') || 'all').toLowerCase();
  const specializationFromUrl = SPECIALIZATION_VALUES.has(specializationFromUrlRaw) ? specializationFromUrlRaw : 'all';

  const loadLawyers = useCallback(async (signal) => {
    setIsLoading(true);
    setApiError(null);
    const localRows = readLocalLawyers().map(normalizeLawyer);

    try {
      const list = await fetchLawyersAny(signal);
      const merged = [...list];
      localRows.forEach((item) => {
        const exists = merged.some(
          (row) =>
            String(row.id) === String(item.id) ||
            (row.email && item.email && String(row.email).toLowerCase() === String(item.email).toLowerCase())
        );
        if (!exists) merged.push(item);
      });
      setLawyers(merged);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setApiError(err.message || "Advokatlar ro'yxatini olishda xatolik yuz berdi");
      const fallback = localRows.length ? localRows : seedLawyers.map(normalizeLawyer);
      setLawyers(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadLawyers(controller.signal);
    return () => controller.abort();
  }, [loadLawyers]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.specialization === specializationFromUrl) return prev;
      return { ...prev, specialization: specializationFromUrl };
    });
  }, [specializationFromUrl]);

  const toggleShortlist = (lawyerId) => {
    const id = String(lawyerId);
    setShortlistIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id].slice(-3);
      writeShortlist(next);
      return next;
    });
  };

  const clearShortlist = () => {
    setShortlistIds([]);
    writeShortlist([]);
  };

  const locationOptions = useMemo(() => {
    const unique = new Set();
    lawyers.forEach((lawyer) => {
      if (lawyer.location?.city) unique.add(lawyer.location.city);
    });
    return Array.from(unique);
  }, [lawyers]);

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const specLabel = t(`lawyers_page.categories.${lawyer.specialization}`) || '';
      const locationLabel = getLocationLabel(lawyer.location, t).toLowerCase();
      const searchText = filters.search.toLowerCase();

      const matchesSearch =
        lawyer.name.toLowerCase().includes(searchText) ||
        specLabel.toLowerCase().includes(searchText) ||
        locationLabel.includes(searchText);

      const matchesSpec = filters.specialization === 'all' || lawyer.specialization === filters.specialization;
      const matchesLoc = filters.location === 'all' || lawyer.location?.city === filters.location;

      return matchesSearch && matchesSpec && matchesLoc;
    });
  }, [filters, lawyers, t]);

  const sortedLawyers = useMemo(() => {
    return [...filteredLawyers].sort((a, b) => {
      const rateA = getLawyerWinRate(a);
      const rateB = getLawyerWinRate(b);
      const scoreA = toNumber(a.rating, 0) * 0.65 + rateA * 0.35;
      const scoreB = toNumber(b.rating, 0) * 0.65 + rateB * 0.35;
      return scoreB - scoreA;
    });
  }, [filteredLawyers]);

  const topRatedCount = useMemo(() => lawyers.filter((lawyer) => toNumber(lawyer.rating, 0) >= 4.8).length, [lawyers]);

  const contactReadyCount = useMemo(
    () => lawyers.filter((lawyer) => lawyer.phone || lawyer.telegram || lawyer.email).length,
    [lawyers]
  );

  const totalCasesCount = useMemo(
    () => lawyers.reduce((acc, item) => acc + toNumber(item.cases?.total, 0), 0),
    [lawyers]
  );

  const wonCasesCount = useMemo(() => lawyers.reduce((acc, item) => acc + toNumber(item.cases?.won, 0), 0), [lawyers]);

  const successRate = useMemo(() => {
    if (!totalCasesCount) return 0;
    return Math.round((wonCasesCount / totalCasesCount) * 100);
  }, [totalCasesCount, wonCasesCount]);

  const averageRating = useMemo(() => {
    if (!lawyers.length) return 0;
    return lawyers.reduce((acc, item) => acc + toNumber(item.rating, 0), 0) / lawyers.length;
  }, [lawyers]);

  const shortlistedLawyers = useMemo(() => {
    const index = new Map(lawyers.map((item) => [String(item.id), item]));
    return shortlistIds.map((id) => index.get(String(id))).filter(Boolean);
  }, [lawyers, shortlistIds]);

  const compareInsight = useMemo(() => {
    if (!shortlistedLawyers.length) return null;
    const best = [...shortlistedLawyers].sort((a, b) => {
      const winA = getLawyerWinRate(a);
      const winB = getLawyerWinRate(b);
      const scoreA = toNumber(a.rating, 0) * 0.7 + winA * 0.3;
      const scoreB = toNumber(b.rating, 0) * 0.7 + winB * 0.3;
      return scoreB - scoreA;
    })[0];

    return best ? `${best.name} reyting va yakunlangan ijobiy ishlar ulushi bo‘yicha yetakchi.` : null;
  }, [shortlistedLawyers]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[var(--color-surface-900)] pt-24 pb-20 transition-colors duration-300">
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="bg-[var(--color-primary)] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold"
        >
          <Filter size={24} />
          {t('lawyers_page.filter')}
        </button>
      </div>

      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
          role="presentation"
        />
      )}

      <div className="section-wrap">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#0e2b50] via-[#164d88] to-[#123760] p-6 md:p-9 text-white mb-8 shadow-xl shadow-slate-900/15">
          <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-72 h-72 rounded-full bg-[#d4a966]/25 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 items-end">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-semibold tracking-wide text-white">
                <ShieldCheck size={14} />
                Verifikatsiyadan o‘tgan yuristlar
              </span>
              <h1 className="mt-4 text-3xl md:text-5xl font-serif font-bold leading-tight">
                {t('lawyers_page.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-slate-100 text-base md:text-lg leading-relaxed">
                {t('lawyers_page.subtitle')}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 bg-white/20 border border-white/30 text-white">
                  <CheckCircle2 size={16} />
                  Realtime profil yangilanishi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 bg-white/20 border border-white/30 text-white">
                  <MessageSquare size={16} />
                  To‘g‘ridan-to‘g‘ri chat
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 bg-white/20 border border-white/30 text-white">
                  <Scale size={16} />
                  Sohaga qarab saralash
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border-white/25 bg-slate-900/20">
              <p className="text-sm font-semibold text-white inline-flex items-center gap-2">
                <BarChart3 size={16} />
                Platforma ko‘rsatkichlari
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <HeroStat label="Advokatlar" value={formatCount(lawyers.length)} />
                <HeroStat label="O‘rtacha reyting" value={averageRating ? averageRating.toFixed(1) : '0.0'} />
                <HeroStat label="Ko‘rilgan ishlar" value={formatCount(totalCasesCount)} />
                <HeroStat label="Ijobiy yakun" value={`${successRate}%`} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<Users size={18} />}
            label="Ro‘yxatdagi advokatlar"
            value={formatCount(lawyers.length)}
            subtitle="Realtime bazadan yig‘ilgan profillar"
          />
          <SummaryCard
            icon={<TrendingUp size={18} />}
            label="Yuqori reytingli mutaxassislar"
            value={formatCount(topRatedCount)}
            subtitle="4.8+ reytingga ega faol yuristlar"
          />
          <SummaryCard
            icon={<Phone size={18} />}
            label="Aloqaga tayyor profillar"
            value={formatCount(contactReadyCount)}
            subtitle="Telefon yoki chat orqali bog‘lanish mumkin"
          />
        </div>

        {apiError && !isLoading && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 text-amber-800 dark:text-amber-300 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
                <Scale size={16} className="text-[var(--color-primary)]" />
                Advokatlarni solishtirish paneli
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                3 tagacha advokatni qo‘shib, reyting, tajriba va natijalarni yonma-yon taqqoslang.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                Tanlangan: {shortlistedLawyers.length}/3
              </span>
              {!!shortlistedLawyers.length && (
                <button
                  type="button"
                  onClick={clearShortlist}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300"
                >
                  <X size={12} />
                  Tozalash
                </button>
              )}
            </div>
          </div>

          {!!shortlistedLawyers.length ? (
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {shortlistedLawyers.map((lawyer) => (
                <button
                  type="button"
                  key={`cmp_${lawyer.id}`}
                  onClick={() => setSelectedLawyer(lawyer)}
                  className="text-left rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-3 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{lawyer.name}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {t(`lawyers_page.categories.${lawyer.specialization}`)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span>Reyting: {toNumber(lawyer.rating, 0).toFixed(1)}</span>
                    <span>Tajriba: {lawyer.experience} yil</span>
                    <span>Yutuq: {getLawyerWinRate(lawyer)}%</span>
                    <span>Ishlar: {formatCount(lawyer.cases?.total || 0)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Hozircha taqqoslash ro‘yxati bo‘sh. Kartadan “Solishtirishga qo‘shish” ni bosing.
            </p>
          )}

          {compareInsight && (
            <p className="mt-4 text-sm text-blue-700 dark:text-blue-300 font-medium inline-flex items-center gap-2">
              <Sparkles size={15} />
              Tavsiya: {compareInsight}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24">
            <LawyerFilter
              filters={filters}
              setFilters={setFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              locationOptions={locationOptions}
            />
          </div>

          <div className="flex-grow w-full">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Yuklanmoqda...
                  </span>
                ) : (
                  <>
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-2xl">{formatCount(sortedLawyers.length)}</span>{' '}
                    {t('lawyers_page.count')}
                  </>
                )}
              </p>
            </div>

            {isLoading && (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                      <div className="flex-1 space-y-3 pt-2">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
                      </div>
                    </div>
                    <div className="mt-5 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && sortedLawyers.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {sortedLawyers.map((lawyer) => {
                    const winRate = getLawyerWinRate(lawyer);
                    const specLabel = t(`lawyers_page.categories.${lawyer.specialization}`);
                    const levelKey = `data.levels.${lawyer.level}`;
                    const levelLabel = t(levelKey) === levelKey ? lawyer.level : t(levelKey);
                    const inShortlist = shortlistIds.includes(String(lawyer.id));

                    return (
                      <MotionDiv
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        key={lawyer.id}
                        className="surface-card rounded-3xl p-5 group relative overflow-hidden cursor-pointer border-slate-200 dark:border-slate-700"
                        onClick={() => setSelectedLawyer(lawyer)}
                      >
                        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-[#2d6cb0] to-[#d4a966]" />

                        <div className="flex gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={lawyer.image}
                              alt={lawyer.name}
                              className="w-24 h-24 rounded-2xl object-cover border border-slate-100 dark:border-slate-600 shadow-sm group-hover:scale-[1.03] transition-transform"
                            />
                            {lawyer.level === 'top' && (
                              <div className="absolute -bottom-2 -right-2 bg-[#d4a966] text-slate-900 p-1.5 rounded-full border-2 border-white">
                                <ShieldCheck size={14} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                                {lawyer.name}
                              </h3>
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2 py-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                                <Star size={14} className="fill-current" />
                                {toNumber(lawyer.rating, 0).toFixed(1)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 font-medium truncate">{specLabel}</p>
                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
                              <MapPin size={13} />
                              {getLocationLabel(lawyer.location, t)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
                              <Briefcase size={13} />
                              {lawyer.experience} {t('lawyer_card.years')} tajriba
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium">
                            {levelLabel}
                          </span>
                          {lawyer.languages.slice(0, 3).map((lang) => (
                            <span
                              key={`${lawyer.id}_${lang}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300 line-clamp-2">{lawyer.bio}</p>

                        <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-700/40 p-3">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Ijobiy yakun</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{winRate}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#2d6cb0]"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                            {formatCount(lawyer.cases?.won || 0)} / {formatCount(lawyer.cases?.total || 0)} ta ish ijobiy yakunlangan
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-600 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleShortlist(lawyer.id);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              inShortlist
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {inShortlist ? 'Solishtirishda' : 'Solishtirishga qo‘shish'}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLawyer(lawyer);
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Batafsil
                          </button>

                          <Link
                            to={`/chat/lawyer/${lawyer.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="flex-1 min-w-[130px] bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <MessageSquare size={16} />
                            {t('lawyer_card.chat_btn')}
                          </Link>

                          {lawyer.phone ? (
                            <a
                              href={`tel:${lawyer.phone}`}
                              onClick={(event) => event.stopPropagation()}
                              className="flex-1 min-w-[130px] bg-[var(--color-primary)] text-white py-2 rounded-xl font-semibold hover:bg-[var(--color-primary-600)] transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Phone size={16} />
                              {t('lawyer_card.call_btn')}
                            </a>
                          ) : (
                            <Link
                              to={`/chat/lawyer/${lawyer.id}`}
                              onClick={(event) => event.stopPropagation()}
                              className="flex-1 min-w-[130px] bg-[var(--color-primary)] text-white py-2 rounded-xl font-semibold hover:bg-[var(--color-primary-600)] transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Phone size={16} />
                              {t('lawyer_card.call_btn')}
                            </Link>
                          )}
                        </div>
                      </MotionDiv>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && sortedLawyers.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-500 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {apiError ? 'Advokatlar yuklanmadi' : t('lawyers_page.empty_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  {apiError ? "Backend bilan ulanishni tekshirib qayta urinib ko'ring." : t('lawyers_page.empty_desc')}
                </p>
                <button
                  type="button"
                  onClick={() => setFilters({ search: '', specialization: 'all', location: 'all', price: 'all' })}
                  className="mt-6 text-blue-700 dark:text-blue-300 font-bold hover:underline"
                >
                  Filtrlarni tozalash
                </button>
                {apiError && (
                  <button
                    type="button"
                    onClick={() => loadLawyers()}
                    className="ml-4 mt-6 text-blue-700 dark:text-blue-300 font-bold hover:underline"
                  >
                    Qayta yuklash
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LawyerModal lawyer={selectedLawyer} isOpen={!!selectedLawyer} onClose={() => setSelectedLawyer(null)} />
    </div>
  );
};

export default Lawyers;

function HeroStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-100">{label}</p>
      <p className="mt-1 text-lg font-bold text-white drop-shadow-sm">{value}</p>
    </div>
  );
}

function SummaryCard({ icon, label, value, subtitle }) {
  return (
    <div className="surface-card rounded-2xl p-4 border-slate-200 dark:border-slate-700">
      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
        <span className="text-[var(--color-primary)]">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{subtitle}</p>
    </div>
  );
}
