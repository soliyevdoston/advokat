import React from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LawyerFilter = ({ filters, setFilters, isOpen, onClose, locationOptions = [] }) => {
  const { t } = useLanguage();

  const defaultRegions = ['toshkent', 'samarqand', 'fargona', 'andijon', 'namangan', 'buxoro'];
  const regions = locationOptions.length ? locationOptions : defaultRegions;

  const categories = ['criminal', 'civil', 'family', 'business', 'labor', 'international', 'inheritance'];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out
      md:relative md:transform-none md:w-full md:shadow-none md:bg-transparent
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl md:shadow-lg md:border border-slate-200 dark:border-slate-700 h-full overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('lawyers_page.filter')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full dark:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
            {/* Search */}
            <div>
                 <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">{t('nav.search') || 'Qidirish'}</h4>
                 <div className="relative">
                    <input 
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        placeholder={t('lawyers_page.search_placeholder')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                 </div>
            </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">{t('lawyers_page.categories.all')}</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.specialization === 'all'}
                  onChange={() => setFilters({...filters, specialization: 'all'})}
                  className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 transition-all dark:bg-slate-800"
                />
                <span className={`text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ${filters.specialization === 'all' ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}>
                    {t('lawyers_page.categories.all')}
                </span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={filters.specialization === cat}
                    onChange={() => setFilters({...filters, specialization: cat})}
                    className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 transition-all dark:bg-slate-800"
                  />
                  <span className={`text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ${filters.specialization === cat ? 'font-bold text-blue-700 dark:text-blue-300' : ''}`}>
                    {t(`lawyers_page.categories.${cat}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Hudud</h4>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                <select 
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
                >
                    <option value="all" className="dark:bg-slate-900">Barcha hududlar</option>
                    {regions.map(r => (
                        <option key={r} value={r} className="dark:bg-slate-900">
                          {t(`data.locations.${r}`) === `data.locations.${r}` ? r : t(`data.locations.${r}`)}
                        </option>
                    ))}
                </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerFilter;
