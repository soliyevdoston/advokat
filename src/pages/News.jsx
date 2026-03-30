import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, Calendar, Clock, Search, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { pickNewsFallbackImage } from '../utils/newsImages';
import { fetchUzaNews, fetchUzaNewsDetail } from '../utils/uzaNews';

const SAVED_NEWS_KEY = 'legallink_saved_news_v1';

const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: "Yuridik yangiliklar bo'limi ishga tushdi",
    excerpt: "Hozircha UZA API bilan ulanishda muammo bor. Keyinroq qayta urinib ko'ring.",
    content:
      "Yangiliklar bo'limi vaqtincha fallback rejimida ishlamoqda. Ulanish tiklangach, real yangiliklar avtomatik ko'rsatiladi.",
    category: 'general',
    image: pickNewsFallbackImage('fallback-1'),
    author: 'LegalLink',
    date: new Date().toISOString(),
    readTime: 2,
    externalUrl: '',
    source: 'fallback',
  },
];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sana ko‘rsatilmagan';
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

const makeExcerpt = (text) => {
  const source = String(text || '').trim();
  if (!source) return "Qisqacha ma'lumot mavjud emas.";
  if (source.length <= 180) return source;
  return `${source.slice(0, 180).trim()}...`;
};

const categoryLabel = (value) => {
  const key = String(value || 'general').toLowerCase();
  const map = {
    all: 'Barchasi',
    general: 'Umumiy',
    legislation: 'Qonunchilik',
    court: 'Sud',
    society: 'Jamiyat',
    politics: 'Siyosat',
    economy: 'Iqtisod',
    world: 'Jahon',
    sport: 'Sport',
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const readSavedNews = () => {
  try {
    const raw = localStorage.getItem(SAVED_NEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeSavedNews = (ids) => {
  localStorage.setItem(SAVED_NEWS_KEY, JSON.stringify(ids));
};

function NewsDetailSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 animate-pulse">
        <div className="h-5 w-56 bg-slate-100 rounded-md mb-8" />
        <div className="w-full h-[340px] rounded-3xl mb-8 bg-slate-100" />
        <div className="h-4 w-2/3 bg-slate-100 rounded-md mb-4" />
        <div className="h-10 w-5/6 bg-slate-100 rounded-lg mb-4" />
        <div className="h-4 w-1/3 bg-slate-100 rounded-md mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded-md" />
          <div className="h-4 w-11/12 bg-slate-100 rounded-md" />
          <div className="h-4 w-10/12 bg-slate-100 rounded-md" />
          <div className="h-4 w-9/12 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function NewsCardsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={`news_skeleton_${item}`} className="rounded-2xl border border-slate-100 p-4 bg-white">
          <div className="aspect-[3/2] rounded-xl bg-slate-100 mb-4" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md mb-3" />
          <div className="h-6 w-11/12 bg-slate-100 rounded-md mb-2" />
          <div className="h-6 w-4/5 bg-slate-100 rounded-md mb-4" />
          <div className="h-4 w-full bg-slate-100 rounded-md mb-2" />
          <div className="h-4 w-10/12 bg-slate-100 rounded-md mb-4" />
          <div className="h-4 w-2/5 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const { id } = useParams();
  const [news, setNews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(() => readSavedNews());
  const [savedOnly, setSavedOnly] = useState(false);
  const [detailById, setDetailById] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      setLoading(true);
      setError('');

      try {
        const list = await fetchUzaNews({ limit: 30 });
        if (cancelled) return;

        if (list.length) {
          setNews(list);
        } else {
          setNews(FALLBACK_NEWS);
          setError('Yangiliklar topilmadi.');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Yangiliklarni olishda xatolik yuz berdi");
        setNews(FALLBACK_NEWS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(['all']);
    news.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).map((key) => ({ id: key, label: categoryLabel(key) }));
  }, [news]);

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news.filter((item) => {
      if (savedOnly && !savedIds.includes(String(item.id))) return false;
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      const haystack = `${item.title} ${item.excerpt} ${item.content} ${item.author}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, news, savedIds, savedOnly, search]);

  const digestItems = useMemo(() => {
    const scoped = (savedOnly ? news.filter((item) => savedIds.includes(String(item.id))) : filteredNews)
      .slice(0, 3);
    return scoped.map((item) => ({
      id: item.id,
      title: item.title,
      tip: `${categoryLabel(item.category)}: ${makeExcerpt(item.excerpt).replace(/\.+$/, '')}`,
    }));
  }, [filteredNews, news, savedIds, savedOnly]);

  const selectedArticle = useMemo(() => {
    if (!id) return null;
    return news.find((item) => String(item.id) === String(id)) || null;
  }, [id, news]);

  useEffect(() => {
    if (!selectedArticle) return undefined;
    const articleId = String(selectedArticle.id);
    if (detailById[articleId]) return undefined;

    const uzaKey = selectedArticle.uzaId || selectedArticle.uzaSlug;
    if (!uzaKey) return undefined;

    let active = true;
    const controller = new AbortController();

    setDetailLoading(true);
    setDetailError('');

    fetchUzaNewsDetail({ id: uzaKey, signal: controller.signal })
      .then((detail) => {
        if (!active) return;
        setDetailById((prev) => ({ ...prev, [articleId]: detail }));
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return;
        setDetailError(err?.message || "To'liq matnni olishda xatolik yuz berdi");
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [detailById, selectedArticle]);

  const selectedResolved = useMemo(() => {
    if (!selectedArticle) return null;
    return detailById[String(selectedArticle.id)] || selectedArticle;
  }, [detailById, selectedArticle]);

  const selectedArticleContent = useMemo(
    () => (selectedResolved ? selectedResolved.content || selectedResolved.excerpt || '' : ''),
    [selectedResolved]
  );

  const toggleSaved = (articleId) => {
    const idValue = String(articleId);
    setSavedIds((prev) => {
      const next = prev.includes(idValue) ? prev.filter((item) => item !== idValue) : [idValue, ...prev];
      writeSavedNews(next);
      return next;
    });
  };

  if (id && loading) {
    return <NewsDetailSkeleton />;
  }

  if (id && !selectedArticle) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/news" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8">
            <ArrowLeft size={16} /> Yangiliklar ro'yxatiga qaytish
          </Link>
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-5">
            <p className="font-semibold">Yangilik topilmadi</p>
            <p className="text-sm mt-1">Ushbu ID bo'yicha ma'lumot mavjud emas yoki o'chirilgan.</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedResolved) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/news" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8">
            <ArrowLeft size={16} /> Yangiliklar ro'yxatiga qaytish
          </Link>

          <article>
            <img
              src={selectedResolved.image}
              alt={selectedResolved.title}
              onError={(event) => {
                const fallback = pickNewsFallbackImage(selectedResolved.id || selectedResolved.title);
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
              className="w-full h-[340px] object-cover rounded-3xl mb-8"
            />
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} /> {formatDate(selectedResolved.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} /> {selectedResolved.readTime} daqiqa
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {categoryLabel(selectedResolved.category)}
              </span>
              <button
                type="button"
                onClick={() => toggleSaved(selectedResolved.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                  savedIds.includes(String(selectedResolved.id))
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Bookmark size={14} className={savedIds.includes(String(selectedResolved.id)) ? 'fill-current' : ''} />
                {savedIds.includes(String(selectedResolved.id)) ? 'Saqlangan' : 'Saqlash'}
              </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
              {selectedResolved.title}
            </h1>
            <p className="text-sm text-slate-500 mb-8">Manba: {selectedResolved.author}</p>

            {detailLoading && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 border border-blue-100">
                <Clock size={14} /> To‘liq matn yuklanmoqda...
              </p>
            )}
            {detailError && (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 border border-amber-100">
                {detailError}
              </p>
            )}

            <p className="text-lg text-slate-700 leading-8 whitespace-pre-wrap">
              {selectedArticleContent}
            </p>

            {selectedResolved.externalUrl && (
              <a
                href={selectedResolved.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-6 items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
              >
                Asl manbani ochish <ArrowRight size={15} />
              </a>
            )}

            {digestItems.length > 0 && (
              <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <Sparkles size={15} className="text-blue-600" />
                  Shaxsiy digest
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {digestItems.map((item) => (
                    <li key={`digest_${item.id}`}>{item.tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-100 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                O‘zbekcha Yangiliklar
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Yangiliklar UZA API orqali olinadi va to‘liq matn bilan ichki sahifada ko‘rsatiladi.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sarlavha yoki matn bo‘yicha qidirish..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                savedOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark size={14} className={savedOnly ? 'fill-current' : ''} />
              Saqlanganlar
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
            <Sparkles size={15} className="text-blue-600" />
            Tezkor digest
          </p>
          <p className="text-xs text-slate-500 mt-1">Tanlangan filtrlar asosida muhim yangiliklar jamlanmasi</p>
          {digestItems.length ? (
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              {digestItems.map((item) => (
                <li key={`digest_list_${item.id}`} className="line-clamp-1">
                  {item.tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Digest uchun kamida 1 ta maqola tanlang.</p>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <NewsCardsSkeleton />
        ) : filteredNews.length === 0 ? (
          <div className="py-16 text-center border border-slate-200 rounded-2xl text-slate-500">
            Tanlangan filtr bo‘yicha yangilik topilmadi.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <article key={item.id} className="group flex flex-col h-full bg-white">
                <Link to={`/news/${item.id}`} className="block overflow-hidden rounded-2xl mb-4 relative aspect-[3/2]">
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
                </Link>

                <div className="flex flex-col flex-grow">
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => toggleSaved(item.id)}
                      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${
                        savedIds.includes(String(item.id))
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <Bookmark size={12} className={savedIds.includes(String(item.id)) ? 'fill-current' : ''} />
                      {savedIds.includes(String(item.id)) ? 'Saqlangan' : 'Saqlash'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
                    <span>{formatDate(item.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{item.readTime} daqiqa</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
                    <Link to={`/news/${item.id}`} className="group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </Link>
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {item.excerpt}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-slate-800">{item.author}</span>
                    <Link
                      to={`/news/${item.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      O‘qish <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
