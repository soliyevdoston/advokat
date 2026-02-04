import React from 'react';
import { Briefcase, Scale, Users, FileText, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Scale className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.protection.title'),
      desc: t('services.items.protection.desc')
    },
    {
      icon: <Users className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.consultation.title'),
      desc: t('services.items.consultation.desc')
    },
    {
      icon: <Briefcase className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.business.title'),
      desc: t('services.items.business.desc')
    },
    {
      icon: <FileText className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.documents.title'),
      desc: t('services.items.documents.desc')
    },
    {
      icon: <Globe className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.international.title'),
      desc: t('services.items.international.desc')
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t('services.items.labor.title'),
      desc: t('services.items.labor.desc')
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('services.title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {services.map((service, index) => (
            <Link 
              to="/lawyers" 
              state={{ category: service.title }}
              key={index}
              className="block h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 md:p-8 h-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center md:block md:text-left"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-3 md:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {React.cloneElement(service.icon, { className: "w-6 h-6 md:w-8 md:h-8 text-[var(--color-primary)] dark:text-blue-400" })}
                </div>
                <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3 leading-tight">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-base line-clamp-3 md:line-clamp-none">
                  {service.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
