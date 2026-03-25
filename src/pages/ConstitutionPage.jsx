import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ArrowLeft, Hash, Layers, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { buildApiUrl } from '../config/appConfig';
const MotionH1 = motion.h1;
const MotionDiv = motion.div;
const TOKEN_KEY = 'advokat_auth_token';

const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeSection = (raw = {}) => ({
  id: String(raw.id ?? raw.section_id ?? raw.sectionId ?? raw.number ?? raw.title ?? Date.now()),
  title: raw.title || raw.name || raw.section_title || "Bo'lim",
});

const normalizeArticle = (raw = {}, fallbackSectionId = null) => ({
  id: String(raw.id ?? raw.article_id ?? raw.articleId ?? `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`),
  number: toNumber(raw.number ?? raw.article_number ?? raw.articleNumber ?? raw.order) ?? 0,
  sectionId: String(raw.sectionId ?? raw.section_id ?? raw.section?.id ?? fallbackSectionId ?? '0'),
  chapter: raw.chapter || raw.section_name || raw.title || "Bo'lim",
  content: raw.content || raw.text || raw.body || raw.article || '',
});

const parseSections = (data) => {
  const sections = toArray(data).length ? data : (data.sections || data.data || data.items || []);
  return toArray(sections).map(normalizeSection);
};

const parseArticles = (data, sectionsPayload = null) => {
  const direct = toArray(data).length ? data : (data.articles || data.data || data.items || []);

  if (toArray(direct).length) {
    return direct.map((item) => normalizeArticle(item));
  }

  const sections = toArray(sectionsPayload)
    .length
    ? sectionsPayload
    : (sectionsPayload?.sections || sectionsPayload?.data || sectionsPayload?.items || []);

  return toArray(sections).flatMap((section) => {
    const sectionId = section.id ?? section.section_id ?? section.sectionId;
    const sectionArticles = section.articles || section.items || section.children || [];
    return toArray(sectionArticles).map((article) => normalizeArticle(article, sectionId));
  });
};

async function fetchJson(url) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

const ConstitutionPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [articleNumber, setArticleNumber] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');

  const [sections, setSections] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConstitution = async () => {
    setLoading(true);
    setError('');

    try {
      const [sectionsData, articlesData] = await Promise.all([
        fetchJson(buildApiUrl('/constitution/sections')),
        fetchJson(buildApiUrl('/constitution')),
      ]);

      const mappedSections = parseSections(sectionsData);
      const mappedArticles = parseArticles(articlesData, sectionsData);

      setSections(mappedSections);
      setArticles(mappedArticles);
    } catch (err) {
      setError(err.message || 'Konstitutsiya ma’lumotlarini yuklab bo‘lmadi');
      setSections([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConstitution();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const query = searchQuery.trim().toLowerCase();
      const text = `${article.chapter} ${article.content}`.toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesNumber = articleNumber === '' || String(article.number) === String(articleNumber);
      const matchesSection = selectedSection === 'all' || String(article.sectionId) === String(selectedSection);

      return matchesQuery && matchesNumber && matchesSection;
    });
  }, [articles, searchQuery, articleNumber, selectedSection]);

  const scrollToSection = (sectionId) => {
    setSelectedSection(String(sectionId));
    setArticleNumber('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-[var(--color-surface-900)] text-white pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-400 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-400 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('nav.home') || 'Home'}
          </Link>

          <MotionH1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white"
          >
            {t('constitution.title') || "O'zbekiston Respublikasi Konstitutsiyasi"}
          </MotionH1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            {t('constitution.subtitle') || 'Our main law and guarantee of rights'}
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-2xl">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kalit so'z bo'yicha..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>

              <div className="md:col-span-3 relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                <input
                  type="number"
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                  placeholder="Modda #"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>

              <div className="md:col-span-4 relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none transition-all cursor-pointer"
                >
                  <option value="all" className="text-slate-900">Barcha bo'limlar</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id} className="text-slate-900">
                      {section.title.length > 30 ? `${section.title.slice(0, 30)}...` : section.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchQuery || articleNumber || selectedSection !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setArticleNumber('');
                  setSelectedSection('all');
                }}
                className="mt-4 text-sm text-blue-200 hover:text-white transition-colors underline underline-offset-4"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
            <button
              onClick={loadConstitution}
              className="ml-auto inline-flex items-center gap-1 font-semibold text-red-700 hover:underline"
            >
              <RefreshCw size={14} /> Qayta urinib ko'rish
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Bo'limlar
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSection('all')}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-between group ${selectedSection === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'}`}
                >
                  <span>Barcha bo'limlar</span>
                </button>

                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-between group ${selectedSection === String(section.id) ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'}`}
                  >
                    <span className="line-clamp-2">{section.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[600px]">
              <div className="prose prose-lg max-w-none text-slate-700">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-slate-500">
                    <Loader2 size={24} className="animate-spin mr-2" /> Yuklanmoqda...
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {filteredArticles.length > 0 ? (
                      <MotionDiv
                        key={selectedSection + searchQuery + articleNumber}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12"
                      >
                        {filteredArticles.map((article, index) => {
                          const showSectionHeader = index === 0 || article.sectionId !== filteredArticles[index - 1].sectionId;
                          const section = sections.find((s) => String(s.id) === String(article.sectionId));

                          return (
                            <div key={article.id} className="space-y-6">
                              {showSectionHeader && (
                                <div className="pt-8 first:pt-0">
                                  <h2 className="text-2xl font-bold text-[var(--color-surface-900)] border-b pb-4 mb-8">
                                    {section?.title || article.chapter}
                                  </h2>
                                </div>
                              )}
                              <div className="group hover:bg-slate-50 p-6 rounded-2xl transition-all -mx-6 border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                    {article.number}-modda
                                  </span>
                                  <span className="text-slate-400 text-sm italic">{article.chapter}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed text-lg">{article.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </MotionDiv>
                    ) : (
                      <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                      >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                          <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Ma'lumot topilmadi</h3>
                        <p className="text-slate-500 max-w-sm">
                          Qidiruv so'roviga mos keladigan moddalar topilmadi. Iltimos, filtrlarni o'zgartirib ko'ring.
                        </p>
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                )}

                <div className="mt-12 pt-12 border-t flex flex-col items-center">
                  <blockquote className="p-8 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-2xl italic text-slate-600 mb-10 w-full text-center">
                    "Konstitutsiya — davlatni davlat, millatni millat sifatida dunyoga tanitadigan Qomusnomadir."
                  </blockquote>
                  <a
                    href={buildApiUrl('/constitution/pdf')}
                    target="_blank"
                    rel="noreferrer"
                    className="px-10 py-4 bg-[var(--color-surface-900)] text-white rounded-2xl hover:bg-[#153e5a] transition-all font-bold shadow-lg flex items-center gap-3 active:scale-95"
                  >
                    <BookOpen className="w-6 h-6" />
                    To'liq matnni yuklab olish (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstitutionPage;
