import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Chrome } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyCode, localFallbackEnabled } = useAuth();
  const { t } = useLanguage();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolveRedirect = () => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth') return from;
    return '/dashboard';
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const form = new FormData(event.target);
    const emailVal = String(form.get('email') || '').trim();
    const passwordVal = String(form.get('password') || '').trim();

    try {
      await login(emailVal, passwordVal);
      navigate(resolveRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || t('auth.error_general'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const form = new FormData(event.target);
    const emailVal = String(form.get('email') || '').trim();
    const passwordVal = String(form.get('password') || '').trim();

    if (passwordVal.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak');
      setLoading(false);
      return;
    }

    try {
      const result = await register(emailVal, passwordVal);

      if (result?.requiresVerification) {
        setEmail(emailVal);
        setStep('verify');
        return;
      }

      navigate(resolveRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || t('auth.error_general'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await verifyCode(email, code);
      navigate(resolveRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || t('auth.error_code'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setStep('form');
    setError(null);
    setCode('');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <span className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 inline-flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Logo className="w-9 h-9" color="text-[var(--color-primary)] dark:text-blue-300" />
              </span>
            </Link>
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              {isLogin ? t('auth.welcome') : t('auth.register_title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLogin ? t('auth.login_desc') : t('auth.register_desc')}
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-2xl mb-8">
            {[true, false].map((loginMode) => (
              <button
                key={String(loginMode)}
                onClick={() => switchMode(loginMode)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  isLogin === loginMode
                    ? 'bg-white dark:bg-slate-600 shadow-md text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {loginMode ? t('auth.login_btn') : t('auth.register_btn')}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2">
              <Scale size={18} className="rotate-12 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLogin && (
            <form className="space-y-5" onSubmit={handleLogin}>
              <EmailField t={t} />
              <PasswordField t={t} autoComplete="current-password" />

              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-[var(--color-primary)] dark:text-blue-400 hover:underline">
                  {t('auth.forgot')}
                </a>
              </div>

              <SubmitButton loading={loading} label={t('auth.login_btn')} />
            </form>
          )}

          {!isLogin && step === 'form' && (
            <form className="space-y-5" onSubmit={handleRegister}>
              <EmailField t={t} />
              <PasswordField t={t} autoComplete="new-password" />
              <SubmitButton loading={loading} label={t('auth.register_btn')} />
            </form>
          )}

          {!isLogin && step === 'verify' && (
            <form className="space-y-6" onSubmit={handleVerify}>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>{' '}
                {t('auth.verify_desc')}
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.verify_title')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 dark:bg-slate-900/50 dark:text-white transition-all font-mono tracking-[0.5em] text-center text-xl"
                  />
                </div>
              </div>

              <SubmitButton loading={loading} disabled={code.length !== 6} label={t('auth.verify_btn')} />

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                  setCode('');
                }}
                className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {t('auth.change_email') || "Emailni o'zgartirish"}
              </button>
            </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                {t('auth.or')}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="Tez orada"
            className="flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-100 dark:border-slate-700 rounded-2xl w-full font-bold text-slate-400 dark:text-slate-500 bg-transparent cursor-not-allowed opacity-60"
          >
            <Chrome size={22} />
            {t('auth.google')}
          </button>

          {localFallbackEnabled && (
            <div className="mt-6 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-bold mb-1">Local fallback mode yoqilgan</p>
              <p>Backend ulanmaganida test loginlar local storage orqali ishlashi mumkin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailField({ t }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {t('auth.email')}
      </label>
      <div className="relative group">
        <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="example@mail.com"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
        />
      </div>
    </div>
  );
}

function PasswordField({ t, autoComplete }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {t('auth.password')}
      </label>
      <div className="relative group">
        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
        <input
          name="password"
          type="password"
          required
          autoComplete={autoComplete}
          minLength={6}
          placeholder="••••••••"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, disabled = false }) {
  return (
    <Button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-4 text-lg font-bold btn-primary shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : label}
    </Button>
  );
}
