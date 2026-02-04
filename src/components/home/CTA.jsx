import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function CTA() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--color-primary)] rounded-[3rem] p-8 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
           {/* Background Circles */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 filter blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-secondary)] opacity-20 rounded-full -translate-x-1/3 translate-y-1/3 filter blur-3xl"></div>
           
           <div className="relative z-10 max-w-4xl mx-auto">
             <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-8 leading-tight">
               {t('cta.title')}
             </h2>
             <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
               {t('cta.subtitle')}
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Link to="/lawyers" className="w-full sm:w-auto">
                 <Button className="bg-white text-[var(--color-primary)] hover:bg-blue-50 border-none px-10 py-4 h-auto text-lg w-full font-bold shadow-lg shadow-blue-900/20 gap-2">
                   {t('cta.btn_lawyers')} <ArrowRight size={20} />
                 </Button>
               </Link>
               <Link to="/contact" className="w-full sm:w-auto">
                 <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-10 py-4 h-auto text-lg w-full font-medium gap-2">
                   <Phone size={20} /> {t('cta.btn_contact')}
                 </Button>
               </Link>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
