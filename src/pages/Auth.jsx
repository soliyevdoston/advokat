import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { submitLawyerApplication } from '../utils/lawyerApplications';
import { API_BASE_URL } from '../config/appConfig';

const DEMO_ADMIN_EMAIL = 'admin@legallink.uz';
const DEMO_ADMIN_PASSWORD = 'admin12345';
const DEMO_LAWYER_EMAIL = 'lawyer@legallink.uz';
const DEMO_LAWYER_PASSWORD = 'lawyer12345';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.692H24.48v9.01h12.958c-.572 2.99-2.254 5.52-4.792 7.218v5.996h7.758c4.54-4.18 7.128-10.338 7.128-17.532z" fill="#4285F4"/>
      <path d="M24.48 48c6.494 0 11.942-2.154 15.922-5.836l-7.758-5.996c-2.154 1.444-4.912 2.294-8.164 2.294-6.278 0-11.59-4.238-13.488-9.932H2.954v6.192C6.914 42.892 15.104 48 24.48 48z" fill="#34A853"/>
      <path d="M10.992 28.53A14.52 14.52 0 0 1 10.24 24c0-1.574.274-3.104.752-4.53v-6.192H2.954A23.94 23.94 0 0 0 .48 24c0 3.874.928 7.542 2.474 10.722l8.038-6.192z" fill="#FBBC05"/>
      <path d="M24.48 9.538c3.538 0 6.712 1.216 9.208 3.608l6.9-6.9C36.414 2.392 30.974 0 24.48 0 15.104 0 6.914 5.108 2.954 13.278l8.038 6.192c1.898-5.694 7.21-9.932 13.488-9.932z" fill="#EA4335"/>
    </svg>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyCode, forgotPassword, setManualToken, localFallbackEnabled } = useAuth();
  const { t } = useLanguage();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [step, setStep] = useState('form');
  const [registerRole, setRegisterRole] = useState('client');
  const [email, setEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const resolveRedirect = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth') return from;
    return role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/dashboard';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    const userParam = params.get('user');
    let userData = null;
    if (userParam) {
      try { userData = JSON.parse(decodeURIComponent(userParam)); } catch { /* ignore */ }
    }

    window.history.replaceState({}, '', window.location.pathname);
    setManualToken(token, userData);
    navigate(resolveRedirect(userData?.role || 'user'), { replace: true });
  }, []);

  const handleGoogleLogin = () => {
    const googleUrl = `${API_BASE_URL}/user/auth/google`;
    window.location.href = googleUrl;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    const emailVal = String(loginEmail || '').trim();
    const passwordVal = String(loginPassword || '').trim();

    if (!emailVal || !passwordVal) {
      setError("Email va parolni kiriting");
      setLoading(false);
      return;
    }

    try {
      const session = await login(emailVal, passwordVal);
      navigate(resolveRedirect(session?.user?.role), { replace: true });
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
    setNotice('');
    setLoading(true);

    const form = new FormData(event.target);
    const emailVal = String(form.get('email') || '').trim();
    const passwordVal = String(form.get('password') || '').trim();

    if (registerRole === 'lawyer') {
      const fullName = String(form.get('fullName') || '').trim();
      const phone = String(form.get('phone') || '').trim();
      const specialization = String(form.get('specialization') || 'civil').trim();
      const experience = Number(form.get('experience') || 1) || 1;
      const city = String(form.get('city') || 'toshkent').trim();
      const license = String(form.get('license') || '').trim();
      const bio = String(form.get('bio') || '').trim();

      if (!fullName) {
        setError('Advokat F.I.Sh kiriting');
        setLoading(false);
        return;
      }

      if (passwordVal.length < 6) {
        setError('Kabinet paroli kamida 6 ta belgidan iborat bo‘lishi kerak');
        setLoading(false);
        return;
      }

      submitLawyerApplication({
        fullName,
        email: emailVal,
        loginPassword: passwordVal,
        phone,
        specialization,
        experience,
        city,
        license,
        bio,
      });

      setNotice('Advokat arizangiz yuborildi. Admin tasdiqlagach advokat kabinetiga kirishingiz mumkin.');
      setIsLogin(true);
      setRegisterRole('client');
      setLoading(false);
      return;
    }

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

      navigate(resolveRedirect(result?.user?.role), { replace: true });
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
      const session = await verifyCode(email, String(code || '').trim());
      navigate(resolveRedirect(session?.user?.role), { replace: true });
    } catch (err) {
      const rawMessage = String(err?.message || '').trim();
      const normalized = rawMessage.toLowerCase();
      if (normalized.includes('500') || normalized.includes('internal server error')) {
        setError("Server kodni tasdiqlashda xatolik berdi. Yangi kod yuborib qayta urinib ko'ring.");
      } else {
        setError(rawMessage || t('auth.error_code'));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setStep('form');
    setError(null);
    setNotice('');
    setCode('');
    setRegisterRole('client');
  };

  const fillLawyerDemoCredentials = () => {
    setIsLogin(true);
    setStep('form');
    setError(null);
    setNotice("Advokat demo login ma'lumotlari formaga qo'yildi.");
    setLoginEmail(DEMO_LAWYER_EMAIL);
    setLoginPassword(DEMO_LAWYER_PASSWORD);
  };

  const fillAdminDemoCredentials = () => {
    setIsLogin(true);
    setStep('form');
    setError(null);
    setNotice("Admin demo login ma'lumotlari formaga qo'yildi.");
    setLoginEmail(DEMO_ADMIN_EMAIL);
    setLoginPassword(DEMO_ADMIN_PASSWORD);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    if (loading) return;

    const fallbackPrompt = "Parolni tiklash uchun email manzilini kiriting:";
    const targetEmail = String(loginEmail || window.prompt(fallbackPrompt) || '').trim().toLowerCase();

    if (!targetEmail) {
      setError('Parolni tiklash uchun email kiriting');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice('');

    try {
      await forgotPassword(targetEmail);
      setNotice("Parolni tiklash ko'rsatmasi emailingizga yuborildi.");
    } catch (err) {
      setError(err?.message || 'Parolni tiklash so‘rovida xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
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
          {notice && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              {notice}
            </div>
          )}

          {isLogin && (
            <form className="space-y-5" onSubmit={handleLogin}>
              <EmailField
                t={t}
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
              <PasswordField
                t={t}
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-[var(--color-primary)] dark:text-blue-400 hover:underline"
                >
                  {t('auth.forgot')}
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillAdminDemoCredentials}
                  className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/40 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 hover:border-[var(--color-primary)] transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Admin kirishi:</span>{' '}
                  {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
                </button>
                <button
                  type="button"
                  onClick={fillLawyerDemoCredentials}
                  className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/40 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 hover:border-[var(--color-primary)] transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Advokat kirishi:</span>{' '}
                  {DEMO_LAWYER_EMAIL} / {DEMO_LAWYER_PASSWORD}
                </button>
              </div>

              <SubmitButton loading={loading} label={t('auth.login_btn')} />
            </form>
          )}

          {!isLogin && step === 'form' && (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRegisterRole('client')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                    registerRole === 'client'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-300'
                  }`}
                >
                  Mijoz ro‘yxatdan o‘tishi
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('lawyer')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                    registerRole === 'lawyer'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-300'
                  }`}
                >
                  Advokat sifatida ariza
                </button>
              </div>

              {registerRole === 'lawyer' && (
                <>
                  <TextField
                    name="fullName"
                    label="F.I.Sh"
                    placeholder="Ism Familiya"
                  />
                  <EmailField t={t} />
                  <PasswordField t={t} autoComplete="new-password" />
                  <TextField
                    name="phone"
                    label="Telefon"
                    placeholder="+998 90 123 45 67"
                  />
                  <TextField
                    name="specialization"
                    label="Mutaxassislik"
                    placeholder="civil / criminal / business ..."
                    defaultValue="civil"
                  />
                  <TextField
                    name="experience"
                    label="Tajriba (yil)"
                    type="number"
                    placeholder="5"
                    defaultValue="1"
                  />
                  <TextField
                    name="city"
                    label="Shahar"
                    placeholder="toshkent"
                    defaultValue="toshkent"
                  />
                  <TextField
                    name="license"
                    label="Litsenziya raqami"
                    placeholder="AB-123456"
                  />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                      O‘zingiz haqingizda qisqacha
                    </span>
                    <textarea
                      name="bio"
                      rows={3}
                      placeholder="Sud tajribasi, yo‘nalishlaringiz..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 dark:text-white"
                    />
                  </label>
                </>
              )}

              {registerRole === 'client' && (
                <>
                  <EmailField t={t} />
                  <PasswordField t={t} autoComplete="new-password" />
                </>
              )}
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
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-200 dark:border-slate-600 rounded-2xl w-full font-bold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {t('auth.google')}
          </button>

          {localFallbackEnabled && (
            <div className="mt-6 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-bold mb-1">Local fallback mode yoqilgan</p>
              <p>Backend ulanmaganida test loginlar local storage orqali ishlashi mumkin.</p>
              <p className="mt-1">Admin: `admin@legallink.uz` / `admin12345`</p>
              <p>Advokat: `lawyer@legallink.uz` / `lawyer12345`</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailField({ t, value, onChange, defaultValue = '' }) {
  const controlled = typeof value === 'string';

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
          {...(controlled ? { value, onChange } : { defaultValue })}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
        />
      </div>
    </div>
  );
}

function PasswordField({ t, autoComplete, value, onChange, defaultValue = '' }) {
  const controlled = typeof value === 'string';

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
          {...(controlled ? { value, onChange } : { defaultValue })}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[var(--color-primary)] bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all font-medium"
        />
      </div>
    </div>
  );
}

function TextField({ name, label, placeholder, type = 'text', defaultValue = '' }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 dark:text-white"
      />
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
