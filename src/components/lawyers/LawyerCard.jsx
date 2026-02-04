import React from 'react';
import { Star, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function LawyerCard({ lawyer, onClick }) {
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={lawyer.image} 
          alt={lawyer.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-sm text-slate-900">{lawyer.rating}</span>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
           <p className="text-sm font-medium bg-[var(--color-primary)] px-3 py-1 rounded-lg inline-block shadow-lg">
             {t('lawyer_card.detail_view')}
           </p>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-[var(--color-primary)] transition-colors">{lawyer.name}</h3>
        <p className="text-[var(--color-primary)] font-medium mb-4 flex items-center gap-2 text-sm bg-blue-50 w-fit px-3 py-1 rounded-lg">
          <Briefcase size={16} />
          {t(`data.specializations.${lawyer.specialization}`)}
        </p>
        
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
          <MapPin size={16} className="text-slate-400" />
          {lawyer.location}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4">
          <div className="text-center">
            <span className="block font-bold text-slate-900 text-lg">{lawyer.cases.total}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">{t('lawyer_card.total_cases')}</span>
          </div>
          <div className="text-center border-l border-slate-100">
            <span className="block font-bold text-green-600 text-lg">{lawyer.cases.won}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">{t('lawyer_card.won_cases')}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:border-[var(--color-primary)] transition-colors font-medium">
          {t('lawyer_card.profile_btn')}
        </Button>
      </div>
    </motion.div>
  );
}
