import React from 'react';
import { Newspaper, Bell, Gavel, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function News() {
  const newsItems = [
    {
      icon: <Gavel className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
      title: "Yangi Qonunchilik",
      desc: "O'zbekiston Respublikasining yangi qonun loyihalari qabul qilindi.",
      date: "Bugun, 14:00"
    },
    {
      icon: <Scale className="w-6 h-6 text-white" />,
      color: "bg-[var(--color-primary)]",
      title: "Sud Tizimi",
      desc: "Sud-huquq tizimidagi so'nggi islohotlar va o'zgarishlar haqida batafsil.",
      date: "Kecha, 18:30"
    },
    {
      icon: <Newspaper className="w-6 h-6 text-white" />,
      color: "bg-[var(--color-secondary)]",
      title: "Advokatlar Palatasi",
      desc: "Advokatlar uchun yangi imkoniyatlar va imtiyozlar e'lon qilindi.",
      date: "25 Jan, 2026"
    },
    {
      icon: <Bell className="w-6 h-6 text-white" />,
      color: "bg-indigo-500",
      title: "Huquqiy Maslahat",
      desc: "Fuqarolar uchun bepul huquqiy maslahat kunlari belgilandi.",
      date: "24 Jan, 2026"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4">So'nggi Yangiliklar</h2>
            <p className="text-slate-600">
              Huquqiy sohadagi eng muhim o'zgarishlar va yangiliklardan xabardor bo'ling
            </p>
          </div>
          <Link to="/news" className="group flex items-center gap-2 text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-light)] transition-colors">
            Barcha yangiliklar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newsItems.map((item, index) => (
            <div key={index} className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/20 transition-all duration-300 hover:-translate-y-2">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                {item.desc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.date}
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-[var(--color-primary)]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
