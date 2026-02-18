import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ArrowLeft, Filter, Hash, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { constitutionData } from '../data/constitution';

const ConstitutionPage = () => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [articleNumber, setArticleNumber] = useState('');
    const [selectedSection, setSelectedSection] = useState('all');

    const filteredArticles = useMemo(() => {
        return constitutionData.articles.filter(article => {
            const matchesQuery = article.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesNumber = articleNumber === '' || article.number.toString() === articleNumber;
            const matchesSection = selectedSection === 'all' || article.sectionId.toString() === selectedSection;
            
            return matchesQuery && matchesNumber && matchesSection;
        });
    }, [searchQuery, articleNumber, selectedSection]);

    const scrollToSection = (sectionId) => {
        setSelectedSection(sectionId.toString());
        setArticleNumber('');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-[var(--color-surface-900)] text-white pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                     <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-400 rounded-full blur-[100px]"></div>
                     <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-400 rounded-full blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                         {t('nav.home') || 'Home'}
                    </Link>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white"
                    >
                        {t('constitution.title') || 'O\'zbekiston Respublikasi Konstitutsiyasi'}
                    </motion.h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                        {t('constitution.subtitle') || 'Our main law and guarantee of rights'}
                    </p>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-2xl">
                            {/* Text Search */}
                            <div className="md:col-span-5 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Kalit so'z bo'yicha..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                />
                            </div>

                            {/* Article Number */}
                            <div className="md:col-span-3 relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                                <input 
                                    type="number" 
                                    value={articleNumber}
                                    onChange={(e) => setArticleNumber(e.target.value)}
                                    placeholder="Modda #"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                />
                            </div>

                            {/* Section Search */}
                            <div className="md:col-span-4 relative">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                                <select 
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="all" className="text-slate-900">Barcha bo'limlar</option>
                                    {constitutionData.sections.map(section => (
                                        <option key={section.id} value={section.id} className="text-slate-900">
                                            {section.title.length > 30 ? section.title.substring(0, 30) + '...' : section.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {(searchQuery || articleNumber || selectedSection !== 'all') && (
                            <button 
                                onClick={() => { setSearchQuery(''); setArticleNumber(''); setSelectedSection('all'); }}
                                className="mt-4 text-sm text-blue-200 hover:text-white transition-colors underline underline-offset-4"
                            >
                                Filtrlarni tozalash
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-12 gap-12">
                     {/* Sidebar Table of Contents */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Bo'limlar
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setSelectedSection('all')}
                                    className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-between group ${selectedSection === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'}`}
                                >
                                    <span>Barcha bo'limlar</span>
                                </button>
                                {constitutionData.sections.map((section) => (
                                    <button 
                                        key={section.id} 
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-between group ${selectedSection === section.id.toString() ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'}`}
                                    >
                                        <span className="line-clamp-2">{section.title}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Text */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8">
                         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[600px]">
                            <div className="prose prose-lg max-w-none text-slate-700">
                                <AnimatePresence mode="wait">
                                    {filteredArticles.length > 0 ? (
                                        <motion.div 
                                            key={selectedSection + searchQuery + articleNumber}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            {filteredArticles.map((article, index) => {
                                                const showSectionHeader = index === 0 || article.sectionId !== filteredArticles[index - 1].sectionId;
                                                const section = constitutionData.sections.find(s => s.id === article.sectionId);

                                                return (
                                                    <div key={article.id} className="space-y-6">
                                                        {showSectionHeader && (
                                                            <div className="pt-8 first:pt-0">
                                                                <h2 className="text-2xl font-bold text-[var(--color-surface-900)] border-b pb-4 mb-8">
                                                                    {section?.title}
                                                                </h2>
                                                            </div>
                                                        )}
                                                        <div className="group hover:bg-slate-50 p-6 rounded-2xl transition-all -mx-6 border border-transparent hover:border-slate-100">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                                                    {article.number}-modda
                                                                </span>
                                                                <span className="text-slate-400 text-sm italic">{article.chapter}</span>
                                                            </div>
                                                            <p className="text-slate-700 leading-relaxed text-lg">
                                                                {article.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-20 text-center"
                                        >
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                                <Search className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Ma'lumot topilmadi</h3>
                                            <p className="text-slate-500 max-w-sm">
                                                Qidiruv so'roviga mos keladigan moddalar topilmadi. Iltimos, filtrlarni o'zgartirib ko'ring.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                <div className="mt-12 pt-12 border-t flex flex-col items-center">
                                    <blockquote className="p-8 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-2xl italic text-slate-600 mb-10 w-full text-center">
                                       "Konstitutsiya — davlatni davlat, millatni millat sifatida dunyoga tanitadigan Qomusnomadir."
                                    </blockquote>
                                    <button className="px-10 py-4 bg-[var(--color-surface-900)] text-white rounded-2xl hover:bg-[#153e5a] transition-all font-bold shadow-lg flex items-center gap-3 active:scale-95">
                                        <BookOpen className="w-6 h-6" />
                                        To'liq matnni yuklab olish (PDF)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConstitutionPage;
