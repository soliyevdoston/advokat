import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Mail, Lock, User, Chrome } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);

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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img 
                src="/logo.jpg" 
                alt="Advokat Logo" 
                className="w-12 h-12 rounded-xl object-cover shadow-md"
              />
              <span className="text-2xl font-serif font-bold text-[var(--color-primary)]">LegalLink</span>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Xush kelibsiz!' : "Ro'yxatdan o'tish"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isLogin 
                ? "Platformaga kirish uchun ma'lumotlaringizni kiriting" 
                : "Professional yuridik yordam olishni boshlang"}
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">To'liq ismingiz</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input name="name" type="text" placeholder="Azizbek Tursunov" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email manzili</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input name="email" type="email" placeholder="example@gmail.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input name="password" type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-slate-50 focus:bg-white transition-all" />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                  Parolni unutdingizmi?
                </a>
              </div>
            )}

            <Button className="w-full py-3 text-lg btn-primary shadow-lg shadow-blue-900/20">
              {isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Yoki bu orqali kiring</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-full">
              <Chrome size={20} /> Google orqali davom etish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
