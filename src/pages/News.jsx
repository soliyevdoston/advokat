import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, Tag, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useLanguage();

  const categories = [
    { id: 'all', label: t('news_page.categories.all') },
    { id: 'legislation', label: t('news_page.categories.legislation') },
    { id: 'court', label: t('news_page.categories.court') },
    { id: 'tips', label: t('news_page.categories.tips') },
    { id: 'interview', label: t('news_page.categories.interview') }
  ];

  const news = [
    {
      id: 1,
      title: "O'zbekiston Respublikasining yangi Konstitutsiyasi: Asosiy o'zgarishlar",
      excerpt: "Yangilangan Konstitutsiyada inson huquqlari, sud tizimi va advokatura faoliyatiga oid kiritilgan muhim o'zgartirishlar tahlili. Yangi normalarning fuqarolar hayotiga ta'siri va kutilayotgan natijalar.",
      category: "legislation",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000",
      date: "28 Jan, 2026",
      readTime: "5",
      author: "Azizbek Tursunov"
    },
    {
      id: 2,
      title: "Biznesni ro'yxatdan o'tkazish tartibi soddalashtirildi",
      excerpt: "Tadbirkorlar uchun yangi imtiyozlar va davlat xizmatlaridan foydalanish bo'yicha qo'llanma. Endi barcha jarayonlar onlayn tarzda, ortiqcha ovoragarchiliksiz amalga oshiriladi.",
      category: "tips",
      image: "https://images.unsplash.com/photo-1450101499121-e3b1d0cd12e3?auto=format&fit=crop&q=80&w=2000",
      date: "27 Jan, 2026",
      readTime: "4",
      author: "Malika Karimova"
    },
    {
      id: 3,
      title: "Sud tizimida raqamlashtirish: Elektron sud",
      excerpt: "Sud jarayonlarida sun'iy intellekt va elektron hujjat aylanishi tizimining joriy etilishi. Bu o'zgarishlar odil sudlovni ta'minlashda qanday rol o'ynaydi?",
      category: "court",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000",
      date: "25 Jan, 2026",
      readTime: "6",
      author: "Jamshid Aliyev"
    },
    {
      id: 4,
      title: "Mehnat kodeksidagi yangi o'zgarishlar",
      excerpt: "Xodim va ish beruvchi munosabatlaridagi yangi tartib-qoidalar haqida batafsil. Mehnat ta'tillari, ish vaqti va masofaviy ishlash bo'yicha yangi normalar.",
      category: "legislation",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000",
      date: "24 Jan, 2026",
      readTime: "8",
      author: "Nargiza Sobirova"
    },
    {
      id: 5,
      title: "Oilaviy nizolarni hal qilishda mediatorning roli",
      excerpt: "Nizolarni sudgacha hal qilishning samarali usullari va mediator xizmati haqida. Ajrimlarni oldini olish va tinch yo'l bilan kelishuvga erishish usullari.",
      category: "tips",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=2000",
      date: "22 Jan, 2026",
      readTime: "5",
      author: "Dilshod Rahimov"
    },
    {
      id: 6,
      title: "Taniqli advokat bilan eksklyuziv intervyu",
      excerpt: "Muvaffaqiyatli advokatlik faoliyati sirlari va yosh yuristlarga maslahatlar. Kasbiy rivojlanish va etik qoidalar haqida suhbat.",
      category: "interview",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000",
      date: "20 Jan, 2026",
      readTime: "10",
      author: "Zarina Usmonova"
    }
  ];

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const getCategoryLabel = (id) => {
    return t(`news_page.categories.${id}`);
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple & Clean Header */}
        <div className="mb-12 border-b border-slate-100 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-primary)] font-medium mb-2">
                <span className="w-8 h-[2px] bg-[var(--color-primary)]"></span>
                <span>{t('news_page.header.tag')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">{t('news_page.header.title')}</h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t('news_page.header.subtitle')}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder={t('news_page.header.search_placeholder')} 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article (First item) */}
        {activeCategory === 'all' && news.length > 0 && (
          <div className="mb-16">
            <Link to={`/news/${news[0].id}`} className="group block">
              <div className="grid lg:grid-cols-2 gap-8 items-center bg-slate-50 rounded-[2rem] p-4 md:p-6 hover:bg-slate-100 transition-colors duration-300">
                <div className="relative aspect-[4/3] lg:aspect-square w-full overflow-hidden rounded-2xl shadow-sm">
                  <img 
                    src={news[0].image} 
                    alt={news[0].title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    {getCategoryLabel(news[0].category)}
                  </div>
                </div>
                <div className="lg:pr-8 lg:py-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 font-medium">
                     <span className="flex items-center gap-1.5"><Calendar size={16} /> {news[0].date}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span className="flex items-center gap-1.5"><Clock size={16} /> {news[0].readTime} {t('news_page.read_time')}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                    {news[0].title}
                  </h2>
                  <p className="text-slate-600 text-lg mb-6 line-clamp-3 leading-relaxed">
                    {news[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {news[0].author.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{news[0].author}</span>
                    </div>
                    <span className="inline-flex items-center text-[var(--color-primary)] font-bold group-hover:translate-x-1 transition-transform">
                      {t('news_page.read_more')} <ArrowRight size={20} className="ml-2" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {(activeCategory === 'all' ? news.slice(1) : filteredNews).map((item) => (
            <article key={item.id} className="group flex flex-col h-full bg-white">
              <Link to={`/news/${item.id}`} className="block overflow-hidden rounded-2xl mb-6 relative aspect-[3/2]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                  {getCategoryLabel(item.category)}
                </div>
              </Link>
              
              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
                  <span>{item.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{item.readTime} {t('news_page.read_time')}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  <Link to={`/news/${item.id}`}>
                    {item.title}
                  </Link>
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {item.excerpt}
                </p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                   <span className="text-sm font-semibold text-slate-900">{item.author}</span>
                   <Link to={`/news/${item.id}`} className="text-[var(--color-primary)] p-2 rounded-full hover:bg-blue-50 transition-colors">
                     <ChevronRight size={20} />
                   </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
