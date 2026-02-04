import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Briefcase, Star, Phone, MessageSquare, ShieldCheck, Award, Clock, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LawyerModal = ({ lawyer, isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming useAuth exists, if not remove or adjust

  if (!isOpen || !lawyer) return null;

  const handleContact = () => {
      onClose();
      navigate(`/chat/lawyer/${lawyer.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-scroll z-50 flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full z-50 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left Side: Image & Key Stats (Mobile: Top) */}
          <div className="md:w-2/5 bg-slate-100 dark:bg-slate-900 relative">
             <div className="h-64 md:h-full relative">
                <img 
                    src={lawyer.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"} 
                    alt={lawyer.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 md:opacity-60" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    {lawyer.level === 'top' && (
                        <div className="inline-flex items-center gap-1 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                            <ShieldCheck size={14} /> {t('lawyer_card.top_lawyer')}
                        </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-1">{lawyer.name}</h2>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin size={16} className="mr-1" />
                    {t(`data.locations.${lawyer.location.city}`)}
                    {lawyer.location.district && `, ${t(`data.locations.${lawyer.location.district}`)}`}
                </div>

                     <div className="flex gap-4 border-t border-white/20 pt-4 justify-between">
                        <div className="text-center">
                            <div className="text-xl font-bold">{lawyer.cases?.total || '50'}+</div>
                            <div className="text-xs text-slate-400 uppercase">{t('lawyer_card.total_cases')}</div>
                        </div>
                        <div className="text-center border-l border-white/20 pl-4">
                            <div className="text-xl font-bold text-green-400">{lawyer.cases?.won || '45'}+</div>
                            <div className="text-xs text-slate-400 uppercase">{t('lawyer_card.won_cases')}</div>
                        </div>
                        <div className="text-center border-l border-white/20 pl-4">
                            <div className="text-xl font-bold">{lawyer.experience || '5'} {t('lawyer_card.years')}</div>
                        </div>
                        <div className="text-center border-l border-white/20 pl-4">
                            <div className="text-xl font-bold flex items-center gap-1">
                                {lawyer.rating || '4.9'} <Star size={14} className="text-yellow-400 fill-current" />
                            </div>
                        </div>
                     </div>
                </div>
             </div>
          </div>

          {/* Right Side: Detailed Info */}
          <div className="md:w-3/5 p-6 md:p-8 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex flex-col h-full">
             <div className="flex-1">
                 {/* Specialization Tags */}
                 <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                        {lawyer.specialization ? t(`lawyers_page.categories.${lawyer.specialization}`) : 'Yurist'}
                    </span>
                    {lawyer.languages && lawyer.languages.map((lang, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-100 dark:border-slate-600">
                            {lang}
                        </span>
                    ))}
                 </div>

                 <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Briefcase size={18} className="text-[var(--color-primary)]" />
                            {t('lawyer_card.about')}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                            {lawyer.bio || `${lawyer.name} ${lawyer.experience} ${t('lawyer_card.bio_exp')} ${t('lawyer_card.bio_spec')} ${t(`lawyers_page.categories.${lawyer.specialization}`)} ${t('lawyer_card.bio_end')}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <Award size={14} /> {t('lawyer_card.license')}
                             </div>
                             <div className="font-medium">№ {lawyer.license || 'AB-123456'}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <Clock size={14} /> {t('lawyer_card.work_hours')}
                             </div>
                             <div className="font-medium">09:00 - 18:00</div>
                        </div>
                    </div>
                 </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                 <Button onClick={handleContact} className="flex-1 py-3 text-lg font-bold shadow-lg shadow-blue-500/20">
                     <MessageSquare size={18} className="mr-2" /> {t('lawyer_card.chat_btn')}
                 </Button>
                 <Button variant="outline" className="flex-1 py-3 text-lg font-medium border-slate-200 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                     <Phone size={18} className="mr-2" /> {t('lawyer_card.call_btn')}
                 </Button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LawyerModal;
