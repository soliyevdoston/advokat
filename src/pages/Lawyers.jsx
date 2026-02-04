import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Star, MapPin, Briefcase, ChevronRight, Phone, MessageSquare, ShieldCheck, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { lawyers } from '../data/lawyers';
import LawyerFilter from '../components/lawyers/LawyerFilter';
import LawyerModal from '../components/lawyers/LawyerModal';
import { Link } from 'react-router-dom';

const Lawyers = () => {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    specialization: 'all',
    location: 'all',
    price: 'all'
  });

  const filteredLawyers = useMemo(() => {
    return lawyers.filter(lawyer => {
      const matchesSearch = lawyer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          t(`lawyers_page.categories.${lawyer.specialization}`).toLowerCase().includes(filters.search.toLowerCase());
      const matchesSpec = filters.specialization === 'all' || lawyer.specialization === filters.specialization;
      const matchesLoc = filters.location === 'all' || lawyer.location.includes(filters.location);
      
      return matchesSearch && matchesSpec && matchesLoc;
    });
  }, [filters, lawyers, t]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--color-surface-900)] pt-24 pb-20 transition-colors duration-300">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold"
        >
          <Filter size={24} />
          {t('lawyers_page.filter')}
        </button>
      </div>

      {/* Overlay for mobile filter */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {t('lawyers_page.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            {t('lawyers_page.subtitle')}
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 sticky top-24">
            <LawyerFilter 
                filters={filters} 
                setFilters={setFilters} 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)} 
            />
          </div>

          {/* Grid */}
          <div className="flex-grow w-full">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{filteredLawyers.length}</span> {t('lawyers_page.count')}
                </p>
                {/* Could add Sort Dropdown here */}
            </div>

            {filteredLawyers.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
                <AnimatePresence>
                    {filteredLawyers.map((lawyer) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={lawyer.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-700 transition-all group cursor-pointer"
                        onClick={() => setSelectedLawyer(lawyer)}
                    >
                        <div className="flex gap-4 md:gap-6">
                            <div className="relative">
                                <img 
                                    src={lawyer.image} 
                                    alt={lawyer.name} 
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform"
                                />
                                {lawyer.level === 'top' && (
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800" title="Top Rated">
                                        <ShieldCheck size={16} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {lawyer.name}
                                    </h3>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-slate-700 dark:text-yellow-200 text-sm">{lawyer.rating}</span>
                                    </div>
                                </div>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">
                                    {t(`lawyers_page.categories.${lawyer.specialization}`)}
                                </p>
                                
                                <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} />
                                        {t(`data.locations.${lawyer.location.city}`)}
                                        {lawyer.location.district && `, ${t(`data.locations.${lawyer.location.district}`)}`}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase size={14} />
                                        {lawyer.experience} {t('lawyer_card.years')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                             <Link 
                                to={`/chat/lawyer/${lawyer.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                             >
                                <MessageSquare size={18} />
                                {t('lawyer_card.chat_btn')}
                             </Link>
                             <Link 
                                to={`/chat/lawyer/${lawyer.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                             >
                                <Phone size={18} />
                                {t('lawyer_card.call_btn')}
                             </Link>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('lawyers_page.empty_title')}</h3>
                    <p className="text-slate-500 dark:text-slate-400">{t('lawyers_page.empty_desc')}</p>
                    <button 
                        onClick={() => setFilters({ search: '', specialization: 'all', location: 'all', price: 'all' })}
                        className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
            
          </div>
        </div>
      </div>
      
      <LawyerModal 
        lawyer={selectedLawyer} 
        isOpen={!!selectedLawyer} 
        onClose={() => setSelectedLawyer(null)} 
      />
    </div>
  );
}

export default Lawyers;
