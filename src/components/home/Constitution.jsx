import React from 'react';
import { BookOpen, Scale, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Constitution = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="bg-[var(--color-surface-900)] rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Content */}
            <div className="z-10 max-w-xl relative">
                <div className="flex items-center gap-3 mb-6 text-emerald-400">
                    <BookOpen className="w-6 h-6" />
                    <span className="font-medium tracking-wide uppercase text-sm font-sans">{t('constitution.title')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 leading-tight tracking-tight bg-gradient-to-r from-emerald-200 via-white to-emerald-200 bg-clip-text text-transparent drop-shadow-sm">
                    {t('constitution.subtitle')}
                </h2>
                 <Link 
                    to="/constitution"
                    className="inline-flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/30 group"
                >
                    {t('constitution.btn')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            {/* Image */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 md:w-1/2 flex justify-center md:justify-end"
            >
                <div className="relative w-64 md:w-80 aspect-[3/4]">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full transform rotate-12"></div>
                    <img 
                      src="/constitution.png" 
                      alt="Constitution Book" 
                      className="relative w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                    />
                </div>
            </motion.div>
            
            {/* Background Decor */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>
      </div>
    </section>
  );
};

export default Constitution;
