import React from 'react';
import { BriefcaseBusiness, FileText, Globe2, Scale, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const ICONS = [Scale, Users, BriefcaseBusiness, FileText, Globe2, ShieldCheck];

export default function Services() {
  const { t } = useLanguage();

  const services = [
    { title: t('services.items.protection.title'), desc: t('services.items.protection.desc') },
    { title: t('services.items.consultation.title'), desc: t('services.items.consultation.desc') },
    { title: t('services.items.business.title'), desc: t('services.items.business.desc') },
    { title: t('services.items.documents.title'), desc: t('services.items.documents.desc') },
    { title: t('services.items.international.title'), desc: t('services.items.international.desc') },
    { title: t('services.items.labor.title'), desc: t('services.items.labor.desc') },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap">
        <div className="max-w-3xl">
          <span className="inline-flex px-3 py-1 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] text-xs font-semibold border border-[var(--color-primary-300)]">
            Amaliy yo`nalishlar
          </span>
          <h2 className="section-title mt-4">{t('services.title')}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-lg">{t('services.subtitle')}</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Link key={service.title} to="/lawyers" className="surface-card p-5 group">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-50)] dark:bg-slate-700 inline-flex items-center justify-center">
                  <Icon size={20} className="text-[var(--color-primary)] dark:text-blue-300" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-300">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{service.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
