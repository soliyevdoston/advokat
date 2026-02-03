import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Clock, Settings, Bell, Shield, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: 'Faol arizalar', value: '2', icon: FileText, color: 'bg-blue-500' },
    { label: 'Xabarlar', value: '5', icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Kutilayotgan', value: '1', icon: Clock, color: 'bg-amber-500' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              Xush kelibsiz, {user.name}!
            </h1>
            <p className="text-slate-600">Sizning shaxsiy kabinetingiz va huquqiy holatingiz</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2">
               <Settings size={18} /> Sozlamalar
             </Button>
             <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
               <LogOut size={18} className="mr-2" /> Chiqish
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Important Notices */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[var(--color-primary)]" />
                Mening arizalarim
              </h2>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        #{i}04
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Meros taqsimlash bo'yicha ariza</h3>
                        <p className="text-xs text-slate-500">Yuborilgan: 12 Fevral, 2026</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                      Jarayonda
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <Button className="btn-primary w-full sm:w-auto">
                  Yangi ariza yaratish
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                   <Shield size={20} />
                   Huquqiy Himoya
                 </h3>
                 <p className="text-blue-100 text-sm mb-4">
                   Sizning obunangiz faol va siz 24/7 yuridik yordam olish huquqiga egasiz.
                 </p>
                 <Button className="bg-white text-[var(--color-primary)] w-full text-sm py-2 h-auto hover:bg-blue-50">
                   Obunani yangilash
                 </Button>
               </div>
               {/* Pattern */}
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bell size={20} />
                Bildirishnomalar
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-3 items-start pb-4 border-b border-slate-50">
                   <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900">Advokat sizning so'rovingizga javob berdi</p>
                     <p className="text-xs text-slate-400 mt-1">20 daqiqa oldin</p>
                   </div>
                 </div>
                 <div className="flex gap-3 items-start">
                   <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 flex-shrink-0"></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900">Tizimda profilaktika ishlari</p>
                     <p className="text-xs text-slate-400 mt-1">1 kun oldin</p>
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
