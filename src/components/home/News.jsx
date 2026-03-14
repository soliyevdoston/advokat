import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { buildApiUrl } from '../../config/appConfig';

const NEWS_ENDPOINTS = ['/news', '/api/news'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200';

const parsePayload = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.news || payload?.data || payload?.items || [];
  if (!Array.isArray(list)) return [];

  return list.slice(0, 4).map((item, index) => ({
    id: String(item.id || item._id || item.slug || `home_news_${index}`),
    title: item.title || "Yangi yangilik",
    excerpt: item.excerpt || item.summary || item.content || item.text || '',
    image: item.image || item.imageUrl || item.thumbnail || FALLBACK_IMAGE,
    date: item.created_at || item.createdAt || item.publishedAt || item.date || new Date().toISOString(),
  }));
};

async function fetchNewsPreview() {
  let lastError = null;

  for (const endpoint of NEWS_ENDPOINTS) {
    try {
      const response = await fetch(buildApiUrl(endpoint));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
        err.status = response.status;
        throw err;
      }
      return parsePayload(data);
    } catch (err) {
      lastError = err;
      if (err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }

  throw lastError || new Error('News endpoint topilmadi');
}

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function News() {
  const { t } = useLanguage();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchNewsPreview();
        if (!cancelled) setNewsItems(data);
      } catch {
        if (!cancelled) setNewsItems([]);
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
          <div className="py-10 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Yangiliklar yuklanmoqda...
          </div>
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
                    <Newspaper size={12} /> News
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
