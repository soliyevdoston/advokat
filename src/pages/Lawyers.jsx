import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { lawyers } from '../data/lawyers';
import LawyerCard from '../components/lawyers/LawyerCard';
import LawyerModal from '../components/lawyers/LawyerModal';
import Button from '../components/ui/Button';
import { useLocation } from 'react-router-dom';

export default function Lawyers() {
  const location = useLocation();
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (location.state && location.state.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  const categories = ['All', 'Jinoyat ishlari', 'Fuqarolik', 'Oila huquqi', 'Biznes'];

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(filter.toLowerCase()) || 
                          lawyer.specialization.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'All' || lawyer.specialization.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[var(--color-primary)] text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              {lawyers.length} ta mutaxassis
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Malakali Advokatlar</h1>
            <p className="text-slate-600 max-w-xl text-lg">
              Sizning holatingiz bo'yicha eng yaxshi yechim taklif qila oladigan, tajribali va ishonchli advokatlarni toping.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex gap-4">
              <div className="relative flex-grow md:flex-grow-0">
                <input 
                  type="text" 
                  placeholder="Ism yoki soha bo'yicha qidiruv..." 
                  className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full md:w-80 shadow-sm transition-shadow focus:shadow-md"
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              <Button variant="outline" className="px-3 border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                <SlidersHorizontal size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLawyers.map(lawyer => (
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer} 
              onClick={() => setSelectedLawyer(lawyer)} 
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredLawyers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hech narsa topilmadi</h3>
            <p className="text-slate-500">So'rovingiz bo'yicha advokatlar mavjud emas. Qidiruv so'zini o'zgartirib ko'ring.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedLawyer && (
        <LawyerModal 
          lawyer={selectedLawyer} 
          isOpen={!!selectedLawyer} 
          onClose={() => setSelectedLawyer(null)} 
        />
      )}
    </div>
  );
}
