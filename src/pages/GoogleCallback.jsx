import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/appConfig';

const GOOGLE_TOKEN_ENDPOINTS = [
  '/user/auth/google/callback',
  '/user/auth/google',
  '/auth/google/callback',
];

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { setManualToken } = useAuth();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const resolveRedirect = (role) => {
    return role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/dashboard';
  };

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);

    // Holat 1: Backend token bilan qaytdi
    const token = params.get('token');
    if (token) {
      const userParam = params.get('user');
      let userData = null;
      if (userParam) {
        try { userData = JSON.parse(decodeURIComponent(userParam)); } catch { /* ignore */ }
      }
      window.history.replaceState({}, '', window.location.pathname);
      setManualToken(token, userData);
      navigate(resolveRedirect(userData?.role || 'user'), { replace: true });
      return;
    }

    // Holat 2: Backend xatolik qaytardi
    const error = params.get('error');
    if (error) {
      setStatus('error');
      setErrorMsg(params.get('error_description') || 'Google orqali kirishda xatolik yuz berdi');
      return;
    }

    // Holat 3: Google code bilan qaytdi — backendga yuboramiz
    const code = params.get('code');
    if (code) {
      const currentRedirectUri = `${window.location.origin}/auth/callback`;
      let lastErr = null;

      for (const endpoint of GOOGLE_TOKEN_ENDPOINTS) {
        try {
          const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirect_uri: currentRedirectUri }),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            if (res.status === 404 || res.status === 405) continue;
            lastErr = new Error(data?.message || data?.error || `Xatolik: ${res.status}`);
            continue;
          }

          const authToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
          const userData = data.user || data.data?.user || data.data;

          if (authToken) {
            setManualToken(authToken, userData);
            navigate(resolveRedirect(userData?.role || 'user'), { replace: true });
            return;
          }
        } catch (err) {
          lastErr = err;
        }
      }

      setStatus('error');
      setErrorMsg(lastErr?.message || "Google hisob ma'lumotlari olinmadi. Qayta urinib ko'ring.");
      return;
    }

    // Holat 4: Hech narsa yo'q — auth sahifasiga qaytamiz
    navigate('/auth', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Google hisob tekshirilmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-red-100 dark:border-red-900">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Google login xatosi</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{errorMsg}</p>
        <button
          onClick={() => navigate('/auth', { replace: true })}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
        >
          Qayta urinib ko'ring
        </button>
      </div>
    </div>
  );
}
