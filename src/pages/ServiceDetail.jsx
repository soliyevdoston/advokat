import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Briefcase, Clock3, Scale, ShieldCheck, Sparkles, UserRoundCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { lawyers as seedLawyers } from '../data/lawyers';
import { fetchOpenLegalDatasets } from '../utils/openLegalData';
import {
  fetchOpenServiceCatalog,
  matchDatasetToService,
  SERVICE_SPECIALIZATION_MAP,
} from '../utils/openServiceCatalog';

const SERVICE_UI = {
  protection: {
    badge: 'Sudda himoya',
    highlights: ['Huquqiy holat tahlili', 'Dalillarni tayyorlash', 'Sudda vakillik'],
    focus: ['decisions', 'legal_news'],
  },
  consultation: {
    badge: 'Onlayn konsultatsiya',
    highlights: ['Savolga tezkor javob', 'Huquqiy yo‘l xaritasi', 'Keyingi amaliy qadamlar'],
    focus: ['legal_news', 'constitution'],
  },
  business: {
    badge: 'Biznes hamrohlik',
    highlights: ['Shartnoma ekspertizasi', 'Kompaniya risklarini baholash', 'Doimiy yuridik support'],
    focus: ['decisions', 'international'],
  },
  documents: {
    badge: 'Hujjatlar tayyorlash',
    highlights: ['Ariza va da’vo shakllari', 'Hujjatlarni tekshirish', 'Yuridik formatga moslash'],
    focus: ['constitution', 'decisions'],
  },
  international: {
    badge: 'Xalqaro huquq',
    highlights: ['Xalqaro bitimlar tahlili', 'Chegaraviy nizolar bo‘yicha maslahat', 'Vakillik strategiyasi'],
    focus: ['international', 'legal_news'],
  },
  labor: {
    badge: 'Mehnat huquqi',
    highlights: ['Ish beruvchi-xodim nizolari', 'Noqonuniy bo‘shatish masalalari', 'Huquqiy tiklash rejasi'],
    focus: ['decisions', 'legal_news'],
  },
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sana ko‘rsatilmagan';
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getLocationLabel = (location = {}, t) => {
  const cityKey = location?.city ? `data.locations.${location.city}` : '';
  const districtKey = location?.district ? `data.locations.${location.district}` : '';
  const city = cityKey ? t(cityKey) : '';
  const district = districtKey ? t(districtKey) : '';
  const cityLabel = !cityKey || city === cityKey ? location?.city || '' : city;
  const districtLabel = !districtKey || district === districtKey ? location?.district || '' : district;
  return [cityLabel, districtLabel].filter(Boolean).join(', ');
};

const uniqueById = (rows = []) => {
  const map = new Map();
  rows.forEach((item) => {
    const key = String(item?.id || item?.url || item?.title || '');
    if (!key || map.has(key)) return;
    map.set(key, item);
  });
  return Array.from(map.values());
};

export default function ServiceDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');

  const services = useMemo(
    () => [
      { id: 'protection', title: t('services.items.protection.title'), desc: t('services.items.protection.desc') },
      { id: 'consultation', title: t('services.items.consultation.title'), desc: t('services.items.consultation.desc') },
      { id: 'business', title: t('services.items.business.title'), desc: t('services.items.business.desc') },
      { id: 'documents', title: t('services.items.documents.title'), desc: t('services.items.documents.desc') },
      { id: 'international', title: t('services.items.international.title'), desc: t('services.items.international.desc') },
      { id: 'labor', title: t('services.items.labor.title'), desc: t('services.items.labor.desc') },
    ],
    [t]
  );

  const service = useMemo(() => services.find((item) => item.id === id) || null, [id, services]);
  const ui = service ? SERVICE_UI[service.id] : null;
  const specialization = service ? SERVICE_SPECIALIZATION_MAP[service.id] || 'all' : 'all';

  useEffect(() => {
    if (!service) return undefined;

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');

      const [sourceResult, datasetsResult] = await Promise.allSettled([
        fetchOpenServiceCatalog({ signal: controller.signal }),
        fetchOpenLegalDatasets({ limit: 80, signal: controller.signal }),
      ]);

      if (!active) return;

      if (sourceResult.status === 'fulfilled') {
        const item = sourceResult.value.find((row) => row.id === service.id) || null;
        setSource(item);
      } else {
        setSource(null);
      }

      if (datasetsResult.status === 'fulfilled') {
        const byMatcher = datasetsResult.value.filter((row) => matchDatasetToService(service.id, row));
        const byFocus = datasetsResult.value.filter((row) => ui?.focus?.includes(row.focus));
        setResources(uniqueById([...byMatcher, ...byFocus]).slice(0, 6));
      } else {
        setResources([]);
        setError(datasetsResult.reason?.message || "Bo'lim ma'lumotlarini yuklashda xatolik yuz berdi");
      }

      setLoading(false);
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [service, ui?.focus]);

  const recommendedLawyers = useMemo(() => {
    if (!specialization || specialization === 'all') return seedLawyers.slice(0, 3);
    return seedLawyers
      .filter((item) => item.specialization === specialization)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [specialization]);

  if (!service || !ui) {
    return (
      <section className="min-h-screen pt-28 pb-16 bg-slate-50 dark:bg-slate-900">
        <div className="section-wrap">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">Bo‘lim topilmadi</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Tanlangan xizmat turi mavjud emas.</p>
            <Link to="/" className="inline-flex mt-4 text-[var(--color-primary)] font-semibold hover:underline">
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-28 pb-16 bg-slate-50 dark:bg-slate-900">
      <div className="section-wrap">
        <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:underline mb-6">
          <ArrowLeft size={16} />
          Bosh sahifaga qaytish
        </Link>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8">
          <p className="inline-flex px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/25 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            {ui.badge}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {service.title}
          </h1>
          <p className="mt-4 text-lg text-slate-700 dark:text-slate-300 max-w-3xl">{service.desc}</p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {ui.highlights.map((text) => (
              <div
                key={text}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-4"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/lawyers?specialization=${specialization}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-600)]"
            >
              Shu yo‘nalishdagi advokatlar
            </Link>
            <Link
              to="/chat/ai"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              AI bilan boshlash
            </Link>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-primary)]" />
              Bo‘limga mos ochiq ma’lumotlar
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ma’lumotlar ochiq API manbalaridan olinadi va ichki formatda ko‘rsatiladi.
            </p>
            {!loading && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Asosiy manba: {source?.sourceOrg || 'Nomaʼlum manba'}
              </p>
            )}

            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : resources.length ? (
              <div className="mt-4 space-y-3">
                {resources.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{item.organization}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                      <Clock3 size={12} />
                      {formatDate(item.updatedAt || item.publishedAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Hozircha bu yo‘nalish uchun qo‘shimcha ochiq ma’lumot topilmadi.
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
              <UserRoundCheck size={16} className="text-[var(--color-primary)]" />
              Tavsiya etilgan advokatlar
            </p>
            <div className="mt-4 space-y-3">
              {recommendedLawyers.map((lawyer) => (
                <article key={lawyer.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{lawyer.name}</p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 inline-flex items-center gap-1.5">
                    <Briefcase size={12} />
                    {t(`lawyers_page.categories.${lawyer.specialization}`)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                    <Scale size={12} />
                    Reyting: {Number(lawyer.rating || 0).toFixed(1)} • {lawyer.experience} yil
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {getLocationLabel(lawyer.location, t)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/chat/lawyer/${lawyer.id}`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold"
                    >
                      Chat
                    </Link>
                    <Link
                      to={`/lawyers?specialization=${specialization}`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold"
                    >
                      Profilga o‘tish
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
