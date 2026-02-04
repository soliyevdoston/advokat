import React from 'react';
import { Newspaper, Bell, Gavel, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function News() {
  const { t } = useLanguage();

  const newsItems = [
    {
      icon: <Gavel className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
      title: t('news.items.legislation.title'),
      desc: t('news.items.legislation.desc'),
      date: `${t('news.time.today')}, 14:00`
    },
    {
      icon: <Scale className="w-6 h-6 text-white" />,
      color: "bg-[var(--color-primary)]",
      title: t('news.items.judiciary.title'),
      desc: t('news.items.judiciary.desc'),
      date: `${t('news.time.yesterday')}, 18:30`
    },
    {
      icon: <Newspaper className="w-6 h-6 text-white" />,
      color: "bg-[var(--color-secondary)]",
      title: t('news.items.chamber.title'),
      desc: t('news.items.chamber.desc'),
      date: "25 Jan, 2026"
    },
    {
      icon: <Bell className="w-6 h-6 text-white" />,
      color: "bg-indigo-500",
      title: t('news.items.consultation.title'),
      desc: t('news.items.consultation.desc'),
      date: "24 Jan, 2026"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('news.title')}</h2>
            <p className="text-slate-600 dark:text-slate-300">
              {t('news.subtitle')}
            </p>
          </div>
          <Link to="/news" className="group flex items-center gap-2 text-[var(--color-primary)] dark:text-blue-400 font-medium hover:text-[var(--color-primary-light)] dark:hover:text-blue-300 transition-colors">
            {t('news.all_news')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newsItems.map((item, index) => (
            <div key={index} className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/20 dark:hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 shadow-lg shadow-gray-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm leading-relaxed">
                {item.desc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.date}
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-[var(--color-primary)] dark:text-blue-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
