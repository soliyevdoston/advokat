import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-32 pb-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000" 
          alt="Modern Law Office" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium tracking-wide">O'rta Osiyoda yagona huquqiy platforma</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-blue-200 drop-shadow-2xl">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-3xl mx-auto font-light leading-relaxed px-4">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="w-full max-w-md relative">
              <input 
                type="text" 
                placeholder={t('hero.cta')}
                className="w-full px-6 py-4 rounded-xl border-0 focus:ring-2 focus:ring-[var(--color-primary)] shadow-2xl text-slate-900 placeholder:text-slate-400"
              />
              <Search className="absolute right-4 top-4 text-slate-400" />
            </div>
            <Link to="/chat">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 border-none px-10 py-5 text-lg font-bold shadow-2xl shadow-white/10 group">
                Qidirish <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stats / Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('hero.stats.reviews'), value: "98%" },
              { label: "Tajriba", value: "10+ Yil" },
              { label: t('hero.stats.lawyers'), value: "50+" },
              { label: t('hero.stats.cases'), value: "1500+" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
