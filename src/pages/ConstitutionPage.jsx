import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ArrowLeft, Hash, Layers, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { buildApiUrl } from '../config/appConfig';
import { constitutionData } from '../data/constitution';
import { fetchOpenLegalDatasets } from '../utils/openLegalData';

const MotionH1 = motion.h1;
const MotionDiv = motion.div;
const TOKEN_KEY = 'advokat_auth_token';

const toArray = (value) => (Array.isArray(value) ? value : []);
const API_CONSTITUTION_ENDPOINTS = ['/user/constitutsiya', '/api/constitution', '/constitution'];
const API_CONSTITUTION_SEARCH_ENDPOINTS = ['/user/constitutsiya/search', '/api/constitution/search'];
const OFFICIAL_CONSTITUTION_PDF_URL = 'https://constitution.uz/en/pages/constitution';

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

const cleanClauseText = (value) => (
  String(value || '')
    .replace(/<span[^>]*>.*?<\/span>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
);

const parseModdaNumber = (value) => {
  const match = String(value || '').match(/(\d+)\s*-\s*modda/i);
  return match ? Number(match[1]) : 0;
};

const mapNumberToSectionId = (number) => {
  if (number >= 154) return 6;
  if (number >= 109) return 5;
  if (number >= 104) return 4;
  if (number >= 56) return 3;
  if (number >= 19) return 2;
  return 1;
};

const parseConstitutionApiArticles = (payload) => {
  const rows = toArray(payload?.clauses);
  return rows.map((item, idx) => {
    const number = parseModdaNumber(item?.modda) || idx + 1;
    const sectionId = mapNumberToSectionId(number);
    return normalizeArticle({
      id: `clause_${number}`,
      number,
      sectionId,
      chapter: FALLBACK_SECTIONS.find((section) => Number(section.id) === sectionId)?.title || 'Konstitutsiya',
      content: cleanClauseText(item?.text),
    });
  });
};

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

async function fetchJsonAny(paths, { query = '' } = {}) {
  let lastError = null;
  const normalizedQuery = String(query || '').trim();

  for (const path of paths) {
    const suffix = normalizedQuery
      ? `${path}${path.includes('?') ? '&' : '?'}query=${encodeURIComponent(normalizedQuery)}&q=${encodeURIComponent(normalizedQuery)}`
      : path;

    try {
      return await fetchJson(buildApiUrl(suffix));
    } catch (err) {
      lastError = err;
      if (err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }

  throw lastError || new Error('Endpoint topilmadi');
}

const parseConstitutionPayload = (payload) => {
  const fromClauses = parseConstitutionApiArticles(payload);
  if (fromClauses.length) return fromClauses;
  return parseArticles(payload, payload);
};

const FALLBACK_SECTIONS = parseSections(constitutionData.sections || []);
const FALLBACK_ARTICLES = parseArticles(constitutionData.articles || [], constitutionData.sections || []);

const LEGAL_FILTERS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'constitution', label: 'Konstitutsiya' },
  { id: 'decisions', label: 'Qarorlar' },
  { id: 'legal_news', label: 'Huquqiy xabarlar' },
  { id: 'international', label: 'Xalqaro huquq' },
  { id: 'general', label: 'Boshqa huquqiy' },
];

const legalFocusLabel = (focus) => {
  if (focus === 'constitution') return 'Konstitutsiya';
  if (focus === 'decisions') return 'Qarorlar';
  if (focus === 'legal_news') return 'Huquqiy xabar';
  if (focus === 'international') return 'Xalqaro huquq';
  return 'Huquqiy ochiq data';
};

function SidebarSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={`section_skeleton_${item}`} className="h-11 rounded-lg bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function ArticlesSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {[1, 2, 3].map((block) => (
        <div key={`article_skeleton_${block}`} className="space-y-4">
          <div className="h-6 w-2/5 bg-slate-200 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 rounded-lg" />
          <div className="h-4 w-11/12 bg-slate-100 rounded-lg" />
          <div className="h-4 w-10/12 bg-slate-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function LegalResourcesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={`legal_skeleton_${item}`} className="rounded-xl border border-slate-100 p-3 space-y-2">
          <div className="h-3.5 w-11/12 bg-slate-100 rounded-md" />
          <div className="h-3.5 w-4/6 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  );
}

const ConstitutionPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [articleNumber, setArticleNumber] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');

  const [sections, setSections] = useState([]);
  const [articles, setArticles] = useState([]);
  const [serverSearchArticles, setServerSearchArticles] = useState([]);
  const [serverSearchLoading, setServerSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [legalResources, setLegalResources] = useState([]);
  const [legalLoading, setLegalLoading] = useState(true);
  const [legalError, setLegalError] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');

  const loadConstitution = async () => {
    setLoading(true);
    setError('');
    setLegalLoading(true);
    setLegalError('');

    const [constitutionResult, legalResult] = await Promise.allSettled([
      fetchJsonAny(API_CONSTITUTION_ENDPOINTS),
      fetchOpenLegalDatasets({ limit: 12 }),
    ]);

    if (constitutionResult.status === 'fulfilled') {
      const apiArticles = parseConstitutionPayload(constitutionResult.value);
      setSections(FALLBACK_SECTIONS);
      setArticles(apiArticles.length ? apiArticles : FALLBACK_ARTICLES);
      setError('');
    } else {
      const message = constitutionResult.reason?.message || 'Konstitutsiya API ma’lumotlarini yuklab bo‘lmadi';
      setError(`${message}. Mahalliy nusxa ko'rsatildi.`);
      setSections(FALLBACK_SECTIONS);
      setArticles(FALLBACK_ARTICLES);
    }

    if (legalResult.status === 'fulfilled') {
      setLegalResources(legalResult.value);
      setLegalError('');
    } else {
      setLegalResources([]);
      setLegalError("Ochiq huquqiy datasetlarni olib bo'lmadi.");
    }

    setLoading(false);
    setLegalLoading(false);
  };

  useEffect(() => {
    loadConstitution();
  }, []);

  useEffect(() => {
    const query = String(searchQuery || '').trim();
    if (query.length < 2) {
      setServerSearchArticles([]);
      setServerSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setServerSearchLoading(true);
      try {
        const payload = await fetchJsonAny(API_CONSTITUTION_SEARCH_ENDPOINTS, { query });
        const found = parseConstitutionPayload(payload);
        if (!cancelled) {
          setServerSearchArticles(found);
        }
      } catch {
        if (!cancelled) {
          setServerSearchArticles([]);
        }
      } finally {
        if (!cancelled) {
          setServerSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    const source = serverSearchArticles.length ? serverSearchArticles : articles;

    return source.filter((article) => {
      const query = searchQuery.trim().toLowerCase();
      const text = `${article.chapter} ${article.content}`.toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesNumber = articleNumber === '' || String(article.number) === String(articleNumber);
      const matchesSection = selectedSection === 'all' || String(article.sectionId) === String(selectedSection);

      return matchesQuery && matchesNumber && matchesSection;
    });
  }, [articles, serverSearchArticles, searchQuery, articleNumber, selectedSection]);

  const filteredLegalResources = useMemo(() => {
    if (resourceFilter === 'all') return legalResources;
    return legalResources.filter((item) => item.focus === resourceFilter);
  }, [legalResources, resourceFilter]);

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

            {serverSearchLoading && (
              <p className="mt-3 text-xs text-blue-100">
                Konstitutsiya qidiruvi serverda tekshirilmoqda...
              </p>
            )}

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

              {loading ? (
                <SidebarSkeleton />
              ) : (
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
              )}

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900">Ochiq huquqiy datasetlar</h4>
                <p className="text-xs text-slate-500 mt-1">data.egov.uz + GDELT ochiq API manbalari</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {LEGAL_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setResourceFilter(filter.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        resourceFilter === filter.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {legalLoading ? (
                    <LegalResourcesSkeleton />
                  ) : legalError ? (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {legalError}
                    </p>
                  ) : filteredLegalResources.length === 0 ? (
                    <p className="text-xs text-slate-500">Tanlangan tur bo'yicha ochiq dataset topilmadi.</p>
                  ) : (
                    filteredLegalResources.slice(0, 6).map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.organization}</p>
                        <p className="text-[11px] text-blue-700 mt-1 inline-flex items-center gap-1">
                          {legalFocusLabel(item.focus)} <ExternalLink size={11} />
                        </p>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[600px]">
              <div className="prose prose-lg max-w-none text-slate-700">
                {loading ? (
                  <ArticlesSkeleton />
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
                    href={OFFICIAL_CONSTITUTION_PDF_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-10 py-4 bg-[var(--color-surface-900)] text-white rounded-2xl hover:bg-[#153e5a] transition-all font-bold shadow-lg flex items-center gap-3 active:scale-95"
                  >
                    <BookOpen className="w-6 h-6" />
                    To'liq matn (rasmiy manba)
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
