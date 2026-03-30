import React, { useEffect, useState } from 'react';
import { ArrowRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { pickNewsFallbackImage } from '../../utils/newsImages';
import { fetchUzaNews } from '../../utils/uzaNews';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

function HomeNewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div key={`home_news_skeleton_${item}`} className="surface-card p-4 rounded-2xl border border-slate-100">
          <div className="h-44 rounded-xl bg-slate-100 mb-4" />
          <div className="h-5 w-11/12 bg-slate-100 rounded-md mb-2" />
          <div className="h-5 w-4/5 bg-slate-100 rounded-md mb-3" />
          <div className="h-4 w-full bg-slate-100 rounded-md mb-2" />
          <div className="h-4 w-10/12 bg-slate-100 rounded-md mb-3" />
          <div className="h-4 w-2/5 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function News() {
  const { t } = useLanguage();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await fetchUzaNews({ limit: 8 });
        if (cancelled) return;
        setNewsItems(list.slice(0, 4));
      } catch {
        if (cancelled) return;
        setNewsItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('news.title')}</h2>
            <p className="text-slate-600 dark:text-slate-300">{t('news.subtitle')}</p>
          </div>
          <Link to="/news" className="group flex items-center gap-2 text-[var(--color-primary)] dark:text-blue-400 font-medium hover:text-[var(--color-primary-light)] dark:hover:text-blue-300 transition-colors">
            {t('news.all_news')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <HomeNewsSkeleton />
        ) : newsItems.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Hozircha yangiliklar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {newsItems.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="surface-card group p-4 rounded-2xl dark:hover:border-blue-700 hover:border-blue-200 hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden rounded-xl mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(event) => {
                      const fallback = pickNewsFallbackImage(item.id || item.title);
                      if (event.currentTarget.src !== fallback) {
                        event.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                  {String(item.excerpt || '').slice(0, 130)}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span>{formatDate(item.date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Newspaper size={12} /> Yangilik
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
