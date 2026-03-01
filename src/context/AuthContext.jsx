/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API = 'https://advokat-1.onrender.com';

// Token va user ni localStorage dan doimiy o'qish
const loadToken = () => localStorage.getItem('advokat_auth_token') || null;
const loadUser  = () => {
  try { return JSON.parse(localStorage.getItem('advokat_user')) || null; }
  catch { return null; }
};

const saveSession = (token, user) => {
  if (token) localStorage.setItem('advokat_auth_token', token);
  if (user)  localStorage.setItem('advokat_user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('advokat_auth_token');
  localStorage.removeItem('advokat_user');
};

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(loadUser);
  const [authToken, setAuthToken] = useState(loadToken);

  // Tab / refresh bo'lganda sinxronlash
  useEffect(() => {
    const sync = () => {
      setAuthToken(loadToken());
      setUser(loadUser());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // ─── 1. LOGIN ─────────────────────────────────────────────────────────────
  // Backend: POST /auth/login → { token, user } yoki { success, token, user }
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || data.error ||
        (res.status === 401 ? 'Email yoki parol noto\'g\'ri' :
         res.status === 404 ? 'Foydalanuvchi topilmadi' :
         `Server xatosi: ${res.status}`)
      );
    }

    const token = data.token || data.accessToken;
    const userData = data.user || data;

    if (!token) throw new Error('Token server tomonidan qaytarilmadi');

    saveSession(token, userData);
    setAuthToken(token);
    setUser(userData);
    return { token, user: userData };
  };

  // ─── 2. SEND CODE (Register uchun OTP) ───────────────────────────────────
  // Backend: POST /auth/send-code → { token } (10 xonali temp token)
  const sendCode = async (email, password) => {
    const res = await fetch(`${API}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || data.error ||
        (res.status === 409 ? 'Bu email allaqachon ro\'yxatdan o\'tgan' :
         `Kod yuborishda xato: ${res.status}`)
      );
    }

    // Backend 10 xonali tokenni qaytaradi — saqlash (verify uchun kerak)
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem('advokat_auth_token', data.token);
    }

    return data;
  };

  // ─── 3. VERIFY CODE (OTP tasdiqlash) ─────────────────────────────────────
  // Backend: POST /auth/verify-code → { token, user }
  const verifyCode = async (email, code) => {
    const currentToken = loadToken(); // yangi token bo'lishi mumkin

    if (!currentToken) {
      throw new Error('Token topilmadi. Iltimos, qayta urinib ko\'ring');
    }

    const res = await fetch(`${API}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken: currentToken, code }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || data.error ||
        (res.status === 400 ? 'Tasdiqlash kodi noto\'g\'ri yoki muddati o\'tgan' :
         `Tasdiqlashda xato: ${res.status}`)
      );
    }

    const finalToken = data.token || data.accessToken || currentToken;
    const userData   = data.user  || data;

    saveSession(finalToken, userData);
    setAuthToken(finalToken);
    setUser(userData);
    return { token: finalToken, user: userData };
  };

  // ─── 4. LOGOUT ────────────────────────────────────────────────────────────
  const logout = () => {
    clearSession();
    setAuthToken(null);
    setUser(null);
  };

  // ─── 5. ADMIN TOKEN SAQLASH ───────────────────────────────────────────────
  // Admin paneldan token berilganda uni saqlash uchun
  const setManualToken = (token, userData = null) => {
    localStorage.setItem('advokat_auth_token', token);
    setAuthToken(token);
    if (userData) {
      saveSession(token, userData);
      setUser(userData);
    }
  };

  const isAuthenticated = Boolean(authToken && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isAuthenticated,
        login,
        sendCode,
        verifyCode,
        logout,
        setManualToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
