import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Clock, Settings, Bell, Shield, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: t('dashboard.stats.active'), value: '2', icon: FileText, color: 'bg-blue-500' },
    { label: t('dashboard.stats.messages'), value: '5', icon: MessageSquare, color: 'bg-green-500' },
    { label: t('dashboard.stats.pending'), value: '1', icon: Clock, color: 'bg-amber-500' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              {t('dashboard.welcome')}, {user.name}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
               <Settings size={18} /> {t('dashboard.settings')}
             </Button>
             <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
               <LogOut size={18} className="mr-2" /> {t('dashboard.logout')}
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Important Notices */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[var(--color-primary)] dark:text-blue-400" />
                {t('dashboard.applications.title')}
              </h2>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        #{i}04
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{t('dashboard.applications.items.inheritance')}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">12 Feb, 2026</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-lg text-xs font-bold">
                      {t('dashboard.applications.status.process')}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                <Button className="btn-primary w-full sm:w-auto">
                  {t('dashboard.applications.new_btn')}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-[var(--color-primary)] dark:bg-blue-900 p-6 rounded-3xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                   <Shield size={20} />
                   {t('dashboard.sidebar.protection.title')}
                 </h3>
                 <p className="text-blue-100 text-sm mb-4">
                   {t('dashboard.sidebar.protection.desc')}
                 </p>
                 <Button className="bg-white text-[var(--color-primary)] w-full text-sm py-2 h-auto hover:bg-blue-50 dark:text-blue-900">
                   {t('dashboard.sidebar.protection.btn')}
                 </Button>
               </div>
               {/* Pattern */}
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} />
                {t('dashboard.sidebar.notices.title')}
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-3 items-start pb-4 border-b border-slate-50 dark:border-slate-700">
                   <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('dashboard.sidebar.notices.items.lawyer_reply')}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">20 min ago</p>
                   </div>
                 </div>
                 <div className="flex gap-3 items-start">
                   <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2 flex-shrink-0"></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('dashboard.sidebar.notices.items.maintenance')}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">1 day ago</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
