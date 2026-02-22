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
  const { sendCode, verifyCode } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const emailVal = formData.get('email');
    const passwordVal = formData.get('password');

    try {
      // Ikkalasi ham (login ham, register ham) → send-code → verify-code
      await sendCode(emailVal, passwordVal);
      setEmail(emailVal);
      setStep('verify');
    } catch (err) {
      setError(err.message || t('auth.error_general'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await verifyCode(email, code);
      console.log("✅ verifyCode result:", result);
      const from = location.state?.from?.pathname || '/dashboard';
      console.log("🔀 navigating to:", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("❌ verifyCode error:", err);
      setError(err.message || t('auth.error_code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700 transition-all"
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
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              {isLogin ? t('auth.welcome') : t('auth.register_title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? t('auth.login_desc') : t('auth.register_desc')}
            </p>
          </div>

          {/* Login / Ro'yxatdan o'tish toggle */}
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-2xl mb-8">
            <button
              onClick={() => { setIsLogin(true); setStep('form'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                isLogin
                  ? 'bg-white dark:bg-slate-600 shadow-md text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('auth.login_btn')}
            </button>
            <button
              onClick={() => { setIsLogin(false); setStep('form'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                !isLogin
                  ? 'bg-white dark:bg-slate-600 shadow-md text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('auth.register_btn')}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <Scale size={18} className="rotate-12" />
              {error}
            </div>
          )}

          {/* LOGIN yoki REGISTER formasi */}
          {step === 'form' ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--color-primary)] dark:group-focus-within:text-blue-400 transition-colors" size={20} />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={t('auth.email_placeholder') || 'example@mail.com'}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] dark:focus:border-blue-400 bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--color-primary)] dark:group-focus-within:text-blue-400 transition-colors" size={20} />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] dark:focus:border-blue-400 bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm font-medium text-[var(--color-primary)] dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    {t('auth.forgot')}
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-bold btn-primary shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isLogin ? t('auth.login_btn') : t('auth.register_btn')
                )}
              </Button>
            </form>
          ) : (
            /* OTP VERIFY (faqat register uchun) */
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
              onSubmit={handleVerify}
            >
              <div className="text-center mb-6">
                <p className="text-slate-600 dark:text-slate-400">
                  {email} {t('auth.verify_desc')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.verify_title')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--color-primary)] dark:group-focus-within:text-blue-400 transition-colors" size={20} />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] dark:focus:border-blue-400 bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium tracking-[0.5em] text-center text-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-4 text-lg font-bold btn-primary shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('auth.verify_btn')
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('form'); setError(null); }}
                className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {t('auth.change_email') || "Emailni o'zgartirish"}
              </button>
            </motion.form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium transition-colors">{t('auth.or')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all w-full font-bold text-slate-700 dark:text-white group bg-transparent">
              <Chrome size={22} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
              {t('auth.google')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
