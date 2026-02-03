import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, User, Chrome } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);

  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login data
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const name = formData.get('name') || email.split('@')[0];
    
    login({ email, name });
    
    // Navigate back to where they came from or dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <img 
                src="/logo.jpg" 
                alt="Advokat Logo" 
                className="w-14 h-14 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              {isLogin ? t('auth.welcome') : t('auth.register_title')}
            </h2>
            <p className="text-slate-500">
              {isLogin 
                ? t('auth.login_desc')
                : t('auth.register_desc')}
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                isLogin ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('auth.login_btn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                !isLogin ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('auth.register_btn')}
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">{t('auth.name')}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                  <input 
                    name="name" 
                    type="text" 
                    placeholder={t('auth.name_placeholder')}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all font-medium" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">{t('auth.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="example@gmail.com" 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">{t('auth.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all font-medium" 
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-[var(--color-primary)] hover:underline hover:text-blue-700 transition-colors">
                  {t('auth.forgot')}
                </a>
              </div>
            )}

            <Button className="w-full py-4 text-lg font-bold btn-primary shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all">
              {isLogin ? t('auth.login_btn') : t('auth.register_btn')}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">{t('auth.or')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all w-full font-bold text-slate-700 group">
              <Chrome size={22} className="text-slate-500 group-hover:text-blue-500 transition-colors" /> 
              {t('auth.google')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
