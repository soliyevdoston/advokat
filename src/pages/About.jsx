import React from 'react';
import { Shield, Users, Trophy, Target, CheckCircle2, ArrowRight, UserPlus, Search, MessageSquare, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const stats = [
    { label: t('about_page.stats.exp'), value: "10+", icon: Trophy },
    { label: t('about_page.stats.lawyers'), value: "50+", icon: Users },
    { label: t('about_page.stats.cases'), value: "1500+", icon: CheckCircle2 },
    { label: t('about_page.stats.satisfaction'), value: "98%", icon: Target },
  ];

  const values = [
    {
      title: t('about_page.values.items.pro.title'),
      desc: t('about_page.values.items.pro.desc'),
      icon: <Shield className="w-6 h-6 text-white" />,
      color: "bg-blue-600"
    },
    {
      title: t('about_page.values.items.transparency.title'),
      desc: t('about_page.values.items.transparency.desc'),
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      color: "bg-green-600"
    },
    {
      title: t('about_page.values.items.innovation.title'),
      desc: t('about_page.values.items.innovation.desc'),
      icon: <Target className="w-6 h-6 text-white" />,
      color: "bg-purple-600"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Hero Background Section */}
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
                alt="Background" 
                className="w-full h-full object-cover opacity-10 dark:opacity-5"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-slate-50/50 to-slate-50 dark:from-slate-900/0 dark:via-slate-900/50 dark:via-slate-900/80 dark:to-slate-900" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2"
            >
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold mb-6">
                LegalLink Platform
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                {t('about_page.hero.title')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                {t('about_page.hero.subtitle')}
              </p>
              <Link to="/lawyers">
                <Button size="lg" className="shadow-xl shadow-blue-500/20">
                  {t('about_page.hero.btn')}
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute -inset-4 bg-blue-600/20 rounded-3xl blur-2xl transform rotate-3" />
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000" 
                alt="Our Team" 
                className="relative rounded-3xl shadow-2xl border border-white/20"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-[var(--color-secondary)] dark:text-yellow-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Mission Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="lg:w-1/2">
                <img 
                    src="https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=1000" 
                    alt="Our Mission" 
                    className="rounded-3xl shadow-xl w-full h-auto object-cover"
                />
            </div>
            <div className="lg:w-1/2">
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold mb-4">
                    {t('about_page.mission.tag')}
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                    {t('about_page.mission.title')}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {t('about_page.mission.desc')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="text-green-500" size={20} /> {t('about_page.mission.items.support')}
                     </div>
                     <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="text-green-500" size={20} /> {t('about_page.mission.items.ai')}
                     </div>
                     <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="text-green-500" size={20} /> {t('about_page.mission.items.top')}
                     </div>
                     <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="text-green-500" size={20} /> {t('about_page.mission.items.secure')}
                     </div>
                </div>
            </div>
        </div>

        {/* Process Section */}
        <div className="mb-24 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                {t('about_page.process.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
                {t('about_page.process.subtitle')}
            </p>

            <div className="grid md:grid-cols-4 gap-8">
                {[
                    { icon: UserPlus, step: 1, color: "bg-blue-100 text-blue-600" },
                    { icon: Search, step: 2, color: "bg-purple-100 text-purple-600" },
                    { icon: MessageSquare, step: 3, color: "bg-orange-100 text-orange-600" },
                    { icon: Gavel, step: 4, color: "bg-green-100 text-green-600" }
                ].map((item, index) => (
                    <div key={index} className="relative group">
                         {index < 3 && (
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
                         )}
                         <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-2xl group-hover:scale-110 transition-transform`}>
                            <item.icon size={32} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {t(`about_page.process.steps.${item.step}.title`)}
                         </h3>
                         <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t(`about_page.process.steps.${item.step}.desc`)}
                         </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('about_page.values.title')}</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('about_page.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((item, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[var(--color-primary)] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-overlay filter blur-3xl"></div>
           </div>
           
           <div className="relative z-10 max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">{t('about_page.cta.title')}</h2>
             <p className="text-blue-100 text-lg mb-10 leading-relaxed">
               {t('about_page.cta.desc')}
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/chat">
                 <Button className="bg-white text-[var(--color-primary)] hover:bg-blue-50 border-none px-8 py-4 h-auto text-lg w-full sm:w-auto">
                   {t('about_page.cta.btn_ai')}
                 </Button>
               </Link>
               <Link to="/lawyers">
                 <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 h-auto text-lg w-full sm:w-auto">
                   {t('about_page.cta.btn_lawyer')}
                 </Button>
               </Link>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
