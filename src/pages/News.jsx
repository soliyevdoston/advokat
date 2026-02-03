import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('Barchasi');

  const categories = ['Barchasi', 'Qonunchilik', 'Sud amaliyoti', 'Maslahatlar', 'Intervyu'];

  const news = [
    {
      id: 1,
      title: "O'zbekiston Respublikasining yangi Konstitutsiyasi: Asosiy o'zgarishlar",
      excerpt: "Yangilangan Konstitutsiyada inson huquqlari, sud tizimi va advokatura faoliyatiga oid kiritilgan muhim o'zgartirishlar tahlili.",
      category: "Qonunchilik",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000",
      date: "28 Jan, 2026",
      readTime: "5 daqiqa"
    },
    {
      id: 2,
      title: "Biznesni ro'yxatdan o'tkazish tartibi soddalashtirildi",
      excerpt: "Tadbirkorlar uchun yangi imtiyozlar va davlat xizmatlaridan foydalanish bo'yicha qo'llanma.",
      category: "Maslahatlar",
      image: "https://images.unsplash.com/photo-1450101499121-e3b1d0cd12e3?auto=format&fit=crop&q=80&w=2000",
      date: "27 Jan, 2026",
      readTime: "4 daqiqa"
    },
    {
      id: 3,
      title: "Sud tizimida raqamlashtirish: Elektron sud",
      excerpt: "Sud jarayonlarida sun'iy intellekt va elektron hujjat aylanishi tizimining joriy etilishi.",
      category: "Sud amaliyoti",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000",
      date: "25 Jan, 2026",
      readTime: "6 daqiqa"
    },
    {
      id: 4,
      title: "Mehnat kodeksidagi yangi o'zgarishlar",
      excerpt: "Xodim va ish beruvchi munosabatlaridagi yangi tartib-qoidalar haqida batafsil.",
      category: "Qonunchilik",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000",
      date: "24 Jan, 2026",
      readTime: "8 daqiqa"
    },
    {
      id: 5,
      title: "Oilaviy nizolarni hal qilishda mediatorning roli",
      excerpt: "Nizolarni sudgacha hal qilishning samarali usullari va mediator xizmati haqida.",
      category: "Maslahatlar",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=2000",
      date: "22 Jan, 2026",
      readTime: "5 daqiqa"
    },
    {
      id: 6,
      title: "Taniqli advokat bilan eksklyuziv intervyu",
      excerpt: "Muvaffaqiyatli advokatlik faoliyati sirlari va yosh yuristlarga maslahatlar.",
      category: "Intervyu",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000",
      date: "20 Jan, 2026",
      readTime: "10 daqiqa"
    }
  ];

  const filteredNews = activeCategory === 'Barchasi' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="relative pt-44 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Huquqiy Yangiliklar</h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Qonunchilikdagi so'nggi o'zgarishlar, sud amaliyoti tahlillari va professional yuristlarning foydali maslahatlari bilan tanishing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
           <div className="flex flex-wrap gap-2 justify-center">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                   activeCategory === cat 
                     ? 'bg-[var(--color-primary)] text-white shadow-md' 
                     : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-[var(--color-primary)]'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>

           <div className="relative w-full md:w-64">
             <input 
               type="text" 
               placeholder="Qidiruv..." 
               className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 bg-white"
             />
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
           </div>
        </div>

        {/* Featured Article (First item if All) */}
        {activeCategory === 'Barchasi' && news.length > 0 && (
          <div className="mb-12 relative rounded-3xl overflow-hidden group shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src={news[0].image} 
                alt={news[0].title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>
            
            <div className="relative p-8 md:p-12 flex flex-col justify-end h-[500px] text-white">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-[var(--color-secondary)] text-white px-3 py-1 rounded-lg text-sm font-bold">
                  {news[0].category}
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar size={16} /> {news[0].date}
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock size={16} /> {news[0].readTime}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight max-w-4xl">
                {news[0].title}
              </h2>
              <p className="text-lg text-slate-200 mb-8 max-w-2xl line-clamp-2">
                {news[0].excerpt}
              </p>
              
              <Button className="w-fit btn-primary">
                Batafsil o'qish <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {(activeCategory === 'Barchasi' ? news.slice(1) : filteredNews).map((item) => (
            <article key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col group h-full">
              <div className="relative h-40 md:h-56 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-md px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold text-[var(--color-primary)] shadow-lg">
                  {item.category}
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-slate-400 mb-2 md:mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="md:w-3.5 md:h-3.5" /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="md:w-3.5 md:h-3.5" /> {item.readTime}
                  </span>
                </div>
                
                <h3 className="text-sm md:text-xl font-bold text-slate-900 mb-2 md:mb-3 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3 leading-relaxed flex-grow">
                  {item.excerpt}
                </p>
                
                <a href="#" className="inline-flex items-center text-[var(--color-primary)] font-medium text-xs md:text-sm hover:text-blue-700 transition-colors mt-auto">
                  Davomini o'qish <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform md:w-4 md:h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
