import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, Calendar, Clock, Loader2, Search, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { buildApiUrl } from '../config/appConfig';

const NEWS_ENDPOINTS = ['/news', '/api/news'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000';
const SAVED_NEWS_KEY = 'legallink_saved_news_v1';

const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: "Yuridik yangiliklar bo'limi ishga tushdi",
    excerpt: "Frontend API bilan bog'landi. Endi yangiliklar backenddan avtomatik olinadi.",
    content:
      "Yuridik platformada yangiliklar bo'limi yangilandi. Endi foydalanuvchilar uchun yangiliklar tez va qulay ko'rinishda taqdim etiladi.",
    category: 'platform',
    image: FALLBACK_IMAGE,
    author: 'LegalLink',
    date: new Date().toISOString(),
    readTime: 2,
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

const normalizeNews = (raw = {}, index = 0) => {
  const id = raw.id || raw._id || raw.slug || `news_${index}_${Date.now()}`;
  const content = raw.content || raw.body || raw.text || raw.description || '';
  const excerpt = raw.excerpt || raw.summary || makeExcerpt(content);
  const createdAt = raw.created_at || raw.createdAt || raw.published_at || raw.publishedAt || raw.date;

  return {
    id: String(id),
    title: raw.title || "Nomsiz yangilik",
    excerpt: makeExcerpt(excerpt || content),
    content: String(content || excerpt || ''),
    category: String(raw.category || raw.type || 'general').toLowerCase(),
    image: raw.image || raw.imageUrl || raw.thumbnail || FALLBACK_IMAGE,
    author: raw.author || raw.writer || raw.createdBy || 'LegalLink',
    date: createdAt || new Date().toISOString(),
    readTime: Number(raw.readTime || raw.read_time || raw.minutes || 3),
  };
};

const parseNewsPayload = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.news || payload?.data || payload?.items || [];
  if (!Array.isArray(list)) return [];
  return list.map(normalizeNews).filter((item) => item.title);
};

async function fetchNewsAny() {
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

      return parseNewsPayload(data);
    } catch (err) {
      lastError = err;
      if (err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }

  throw lastError || new Error('News endpoint topilmadi');
}

const categoryLabel = (value) => {
  const key = String(value || 'general').toLowerCase();
  const map = {
    all: 'Barchasi',
    general: 'Umumiy',
    platform: 'Platforma',
    legislation: 'Qonunchilik',
    court: 'Sud',
    tips: 'Maslahat',
    interview: 'Intervyu',
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

export default function NewsPage() {
  const { id } = useParams();
  const [news, setNews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(() => readSavedNews());
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      setLoading(true);
      setError('');

      try {
        const list = await fetchNewsAny();
        if (cancelled) return;
        setNews(list.length ? list : FALLBACK_NEWS);
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

  const toggleSaved = (articleId) => {
    const idValue = String(articleId);
    setSavedIds((prev) => {
      const next = prev.includes(idValue) ? prev.filter((item) => item !== idValue) : [idValue, ...prev];
      writeSavedNews(next);
      return next;
    });
  };

  if (id && loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
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

  if (selectedArticle) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/news" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8">
            <ArrowLeft size={16} /> Yangiliklar ro'yxatiga qaytish
          </Link>

          <article>
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-[340px] object-cover rounded-3xl mb-8"
            />
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} /> {formatDate(selectedArticle.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} /> {selectedArticle.readTime} daqiqa
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {categoryLabel(selectedArticle.category)}
              </span>
              <button
                type="button"
                onClick={() => toggleSaved(selectedArticle.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                  savedIds.includes(String(selectedArticle.id))
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Bookmark size={14} className={savedIds.includes(String(selectedArticle.id)) ? 'fill-current' : ''} />
                {savedIds.includes(String(selectedArticle.id)) ? 'Saqlangan' : 'Saqlash'}
              </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
              {selectedArticle.title}
            </h1>
            <p className="text-sm text-slate-500 mb-8">Muallif: {selectedArticle.author}</p>
            <p className="text-lg text-slate-700 leading-8 whitespace-pre-wrap">
              {selectedArticle.content || selectedArticle.excerpt}
            </p>

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
                Yuridik Yangiliklar
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Saytdagi yangiliklar backenddan olinadi va foydalanuvchilar uchun shu yerda ko‘rsatiladi.
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
          <div className="py-20 flex items-center justify-center text-slate-500">
            <Loader2 size={24} className="animate-spin mr-2" /> Yangiliklar yuklanmoqda...
          </div>
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
