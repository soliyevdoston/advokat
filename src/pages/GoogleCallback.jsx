import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, buildApiUrl } from '../config/appConfig';

const GOOGLE_TOKEN_ENDPOINTS = [
  '/user/auth/google/callback',
  '/user/auth/google',
  '/auth/google/callback',
];

const ME_ENDPOINTS = [
  '/user/auth/me',
  '/auth/me',
  '/user/me',
  '/me',
];

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function fetchUserFromToken(token) {
  for (const endpoint of ME_ENDPOINTS) {
    try {
      const res = await fetch(buildApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const user = data.user || data.data?.user || data.data || data;
      if (user && (user.email || user.id || user._id)) return user;
    } catch {
      continue;
    }
  }
  return null;
}

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

      // Agar user ma'lumoti URL da bo'lmasa — API yoki JWT dan olamiz
      if (!userData) {
        userData = await fetchUserFromToken(token);
      }
      if (!userData) {
        const jwtPayload = decodeJwtPayload(token);
        if (jwtPayload) {
          userData = {
            id: jwtPayload.id || jwtPayload.userId || jwtPayload.sub,
            email: jwtPayload.email,
            name: jwtPayload.name || jwtPayload.fullName,
            role: jwtPayload.role || 'user',
          };
        }
      }
      // Oxirgi fallback — minimal user object
      if (!userData) {
        userData = { role: 'user' };
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
      const currentRedirectUri = `${window.location.origin}/user/auth/login-gugl`;
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
