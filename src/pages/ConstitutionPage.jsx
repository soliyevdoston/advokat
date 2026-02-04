import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ConstitutionPage = () => {
    const { t } = useLanguage();

    // Mock data for contents since we don't have the full text translated yet
    const chapters = [
        { id: 1, title: "I. Asosiy prinsiplar", articles: "1-18 moddalar" },
        { id: 2, title: "II. Inson va fuqarolarning asosiy huquqlari, erkinliklari va burchlari", articles: "19-52 moddalar" },
        { id: 3, title: "III. Jamiyat va shaxs", articles: "53-67 moddalar" },
        { id: 4, title: "IV. Ma'muriy-hududiy tuzilish", articles: "68-75 moddalar" },
        { id: 5, title: "V. Davlat hokimiyatining tashkil etilishi", articles: "76-128 moddalar" }
    ];

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
                        className="text-4xl md:text-6xl font-serif font-bold mb-6"
                    >
                        {t('constitution.title') || 'O\'zbekiston Respublikasi Konstitutsiyasi'}
                    </motion.h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                        {t('constitution.subtitle') || 'Our main law and guarantee of rights'}
                    </p>

                    <div className="max-w-2xl mx-auto relative">
                        <input 
                            type="text" 
                            placeholder={t('news_page.header.search_placeholder') || "Moddalar bo'yicha qidirish..."}
                            className="w-full pl-6 pr-14 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
                        />
                        <button className="absolute right-2 top-2 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors">
                            <Search className="w-6 h-6 text-white" />
                        </button>
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
                                Mundarija
                            </h3>
                            <div className="space-y-2">
                                {chapters.map((chapter) => (
                                    <button key={chapter.id} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium flex items-center justify-between group">
                                        <span>{chapter.title}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Text */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8">
                         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                            <div className="prose prose-lg max-w-none text-slate-700">
                                <h2 className="text-3xl font-serif font-bold text-[var(--color-surface-900)] mb-8">Muqaddima</h2>
                                <p className="leading-relaxed mb-6">
                                    O‘zbekiston xalqi,<br/>
                                    inson huquqlari va erkinliklariga, milliy va umuminsoniy qadriyatlarga, davlat suvereniteti prinsiplariga sodiqligini tantanali ravishda e’lon qilib,<br/>
                                    xalqaro huquqning umum e’tirof etilgan normalari ustuvorligini tan olib,<br/>
                                    o‘z taqdirini o‘zi belgilash huquqiga, O‘zbekiston davlatatchiligi rivojining tarixiy tajribasiga tayanib,<br/>
                                    demokratiya va ijtimoiy adolatga sadoqatini namoyon qilib,<br/>
                                    bugungi va kelajak avlodlar oldidagi yuksak mas’uliyatini anglagan holda,<br/>
                                    O‘zbekiston Respublikasining ushbu Konstitutsiyasini qabul qiladi.
                                </p>
                                
                                <blockquote className="p-6 bg-blue-50 bg-opacity-50 border-l-4 border-blue-500 rounded-r-xl italic text-slate-600">
                                   Konstitutsiya — davlatni davlat, millatni millat sifatida dunyoga tanitadigan Qomusnomadir.
                                </blockquote>

                                <div className="my-12 h-px bg-slate-200"></div>

                                <h3 className="text-2xl font-bold text-[var(--color-surface-900)] mb-6">BIRINCHI BO‘LIM. ASOSIY PRINSIPlar</h3>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">I bob. Davlat suvereniteti</h4>
                                
                                <div className="space-y-6">
                                    <div className="group hover:bg-slate-50 p-4 rounded-xl transition-colors -mx-4">
                                        <h5 className="font-bold text-blue-600 mb-2">1-modda</h5>
                                        <p>O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat.
                                        Davlatning «O‘zbekiston Respublikasi» va «O‘zbekiston» degan nomlari bir ma’noni anglatadi.</p>
                                    </div>

                                    <div className="group hover:bg-slate-50 p-4 rounded-xl transition-colors -mx-4">
                                        <h5 className="font-bold text-blue-600 mb-2">2-modda</h5>
                                        <p>Davlat xalq irodasini ifoda etib, uning manfaatlariga xizmat qiladi. Davlat organlari va mansabdor shaxslar jamiyat va fuqarolar oldida mas’uldirlar.</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-center">
                                    <button className="px-8 py-3 bg-[var(--color-surface-900)] text-white rounded-xl hover:bg-[#153e5a] transition-colors font-medium">
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
