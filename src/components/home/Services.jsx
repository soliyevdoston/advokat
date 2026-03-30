import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, Scale, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { fetchOpenServiceCatalog } from '../../utils/openServiceCatalog';

const ICONS = [Scale, Users, BriefcaseBusiness, FileText, Globe2, ShieldCheck];

export default function Services() {
  const { t } = useLanguage();
  const [sourceById, setSourceById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const items = await fetchOpenServiceCatalog({ signal: controller.signal });
        if (!active) return;
        const mapped = items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
        setSourceById(mapped);
      } catch (err) {
        if (!active || err?.name === 'AbortError') return;
        setError(err?.message || "Ochiq manbalarni olishda xatolik yuz berdi");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

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

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap">
        <div className="max-w-3xl">
          <span className="inline-flex px-3 py-1 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] text-xs font-semibold border border-[var(--color-primary-300)]">
            Amaliy yo`nalishlar
          </span>
          <h2 className="section-title mt-4">{t('services.title')}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-lg">{t('services.subtitle')}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bo‘lim data.egov.uz ochiq API manbalari asosida yangilanadi.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const Icon = ICONS[index % ICONS.length];
            const source = sourceById[service.id];

            return (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="surface-card p-5 group flex flex-col hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-50)] dark:bg-slate-700 inline-flex items-center justify-center">
                  <Icon size={20} className="text-[var(--color-primary)] dark:text-blue-300" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-300">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{service.desc}</p>

                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  {loading ? (
                    <>
                      <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3.5 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        Manba: {source?.sourceOrg || 'Nomaʼlum manba'}
                      </p>
                      {source?.updatedAt && <p>Yangilangan: {formatDate(source.updatedAt)}</p>}
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
                    Bo‘limga kirish <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
