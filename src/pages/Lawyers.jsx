import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Star, MapPin, Briefcase, Phone, MessageSquare, ShieldCheck, Search, Loader2, AlertCircle, Scale, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LawyerFilter from '../components/lawyers/LawyerFilter';
import LawyerModal from '../components/lawyers/LawyerModal';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../config/appConfig';
import { readLocalLawyers } from '../utils/localLawyers';
import { lawyers as seedLawyers } from '../data/lawyers';
const MotionDiv = motion.div;

const LAWYER_ENDPOINTS = ['/lawyers', '/api/lawyers'];
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';
const SHORTLIST_KEY = 'legallink_lawyer_shortlist_v1';
const TOKEN_KEY = 'advokat_auth_token';

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

const normalizeLawyer = (raw = {}) => {
  const rawLocation = raw.location && typeof raw.location === 'object'
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
  const city = !cityKey || cityValue === cityKey ? (location.city || '') : cityValue;
  const district = !districtKey || districtValue === districtKey ? (location.district || '') : districtValue;

  return [city, district].filter(Boolean).join(', ');
};

const mapLawyerList = (data) => {
  const list = Array.isArray(data) ? data : (data.lawyers || data.data || data.items || []);
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

  const loadLawyers = useCallback(async (signal) => {
    setIsLoading(true);
    setApiError(null);
    const localRows = readLocalLawyers().map(normalizeLawyer);

    try {
      const list = await fetchLawyersAny(signal);
      const merged = [...list];
      localRows.forEach((item) => {
        const exists = merged.some(
          (row) => String(row.id) === String(item.id)
            || (row.email && item.email && String(row.email).toLowerCase() === String(item.email).toLowerCase())
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

  const topRatedCount = useMemo(
    () => lawyers.filter((lawyer) => Number(lawyer.rating || 0) >= 4.8).length,
    [lawyers]
  );

  const contactReadyCount = useMemo(
    () => lawyers.filter((lawyer) => lawyer.phone || lawyer.telegram || lawyer.email).length,
    [lawyers]
  );

  const shortlistedLawyers = useMemo(() => {
    const index = new Map(lawyers.map((item) => [String(item.id), item]));
    return shortlistIds.map((id) => index.get(String(id))).filter(Boolean);
  }, [lawyers, shortlistIds]);

  const compareInsight = useMemo(() => {
    if (!shortlistedLawyers.length) return null;
    const best = [...shortlistedLawyers].sort((a, b) => {
      const winA = (a.cases?.won || 0) / Math.max(1, a.cases?.total || 0);
      const winB = (b.cases?.won || 0) / Math.max(1, b.cases?.total || 0);
      const scoreA = (a.rating || 0) * 0.7 + winA * 5 * 0.3;
      const scoreB = (b.rating || 0) * 0.7 + winB * 5 * 0.3;
      return scoreB - scoreA;
    })[0];

    return best
      ? `${best.name} reyting va yutgan ishlar ulushi bo‘yicha yetakchi.`
      : null;
  }, [shortlistedLawyers]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-surface-900)] pt-24 pb-20 transition-colors duration-300">
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold"
        >
          <Filter size={24} />
          {t('lawyers_page.filter')}
        </button>
      </div>

      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <div className="section-wrap">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {t('lawyers_page.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            {t('lawyers_page.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Ro‘yxatdagi advokatlar" value={lawyers.length} />
          <SummaryCard label="Yuqori reytingli mutaxassislar" value={topRatedCount} />
          <SummaryCard label="Aloqaga tayyor profillar" value={contactReadyCount} />
        </div>

        {apiError && !isLoading && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Scale size={16} className="text-blue-600" />
                Advokatlarni solishtirish
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                3 tagacha advokat qo‘shib, tajriba, reyting va natijalarni yonma-yon ko‘ring.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Tanlangan: {shortlistedLawyers.length}/3
              </span>
              {!!shortlistedLawyers.length && (
                <button
                  type="button"
                  onClick={clearShortlist}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600"
                >
                  <X size={12} />
                  Tozalash
                </button>
              )}
            </div>
          </div>

          {!!shortlistedLawyers.length && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="text-left py-2 pr-3">Advokat</th>
                    <th className="text-left py-2 px-3">Reyting</th>
                    <th className="text-left py-2 px-3">Tajriba</th>
                    <th className="text-left py-2 px-3">Yutgan ishlar</th>
                    <th className="text-left py-2 px-3">Aloqa</th>
                  </tr>
                </thead>
                <tbody>
                  {shortlistedLawyers.map((lawyer) => (
                    <tr key={`cmp_${lawyer.id}`} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-white">{lawyer.name}</td>
                      <td className="py-2 px-3">{lawyer.rating}</td>
                      <td className="py-2 px-3">{lawyer.experience} yil</td>
                      <td className="py-2 px-3">{lawyer.cases?.won || 0}/{lawyer.cases?.total || 0}</td>
                      <td className="py-2 px-3 text-xs text-slate-500">{lawyer.phone || lawyer.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {compareInsight && (
                <p className="mt-3 text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Tavsiya: {compareInsight}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-80 flex-shrink-0 sticky top-24">
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
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Yuklanmoqda...
                  </span>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{filteredLawyers.length}</span>{' '}
                    {t('lawyers_page.count')}
                  </>
                )}
              </p>
            </div>

            {isLoading && (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                      <div className="flex-1 space-y-3 pt-2">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredLawyers.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredLawyers.map((lawyer) => (
                    <MotionDiv
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={lawyer.id}
                      className="surface-card rounded-2xl p-6 group cursor-pointer"
                      onClick={() => setSelectedLawyer(lawyer)}
                    >
                      <div className="flex gap-4 md:gap-6">
                        <div className="relative flex-shrink-0">
                          <img
                            src={lawyer.image}
                            alt={lawyer.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform"
                          />
                          {lawyer.level === 'top' && (
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800" title="Top Rated">
                              <ShieldCheck size={16} fill="currentColor" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {lawyer.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg flex-shrink-0">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-slate-700 dark:text-yellow-200 text-sm">{lawyer.rating}</span>
                            </div>
                          </div>
                          <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">
                            {t(`lawyers_page.categories.${lawyer.specialization}`)}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} />
                              {getLocationLabel(lawyer.location, t)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase size={14} />
                              {lawyer.experience} {t('lawyer_card.years')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist(lawyer.id);
                          }}
                          className={`px-3 py-3 rounded-xl text-xs font-bold border transition-colors ${
                            shortlistIds.includes(String(lawyer.id))
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                              : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {shortlistIds.includes(String(lawyer.id)) ? 'Solishtirishda' : 'Solishtirishga qo‘shish'}
                        </button>

                        <Link
                          to={`/chat/lawyer/${lawyer.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <MessageSquare size={18} />
                          {t('lawyer_card.chat_btn')}
                        </Link>

                        {lawyer.phone ? (
                          <a
                            href={`tel:${lawyer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                          >
                            <Phone size={18} />
                            {t('lawyer_card.call_btn')}
                          </a>
                        ) : (
                          <Link
                            to={`/chat/lawyer/${lawyer.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                          >
                            <Phone size={18} />
                            {t('lawyer_card.call_btn')}
                          </Link>
                        )}
                      </div>
                    </MotionDiv>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && filteredLawyers.length === 0 && (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {apiError ? 'Advokatlar yuklanmadi' : t('lawyers_page.empty_title')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {apiError ? "Backend bilan ulanishni tekshirib qayta urinib ko'ring." : t('lawyers_page.empty_desc')}
                </p>
                <button
                  onClick={() => setFilters({ search: '', specialization: 'all', location: 'all', price: 'all' })}
                  className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Filtrlarni tozalash
                </button>
                {apiError && (
                  <button
                    onClick={() => loadLawyers()}
                    className="ml-4 mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
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

function SummaryCard({ label, value }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
