/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('advokat_auth_token') || null);

  useEffect(() => {
    const storedUser = localStorage.getItem('advokat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 1-qadam: Email yuborish → backend OTP kodni emailga jo'natadi + 10 xonali token qaytaradi
  const sendCode = async (email, password) => {
    try {
      const res = await fetch("https://advokat-1.onrender.com/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Kod yuborishda xato");
      }

      const data = await res.json();
      // Backend 10 xonali tokenni qaytaradi — saqlab qo'yamiz
      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem('advokat_auth_token', data.token);
      }
      return data;
    } catch (err) {
      console.error("Send code error:", err.message);
      throw err;
    }
  };

  // 2-qadam: OTP kodni tekshirish → muvaffaqiyatli bo'lsa foydalanuvchi tizimga kiradi
  const verifyCode = async (email, code) => {
    try {
      const res = await fetch("https://advokat-1.onrender.com/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authToken, code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Kod noto'g'ri");
      }

      const data = await res.json();
      setUser(data.user || data);
      localStorage.setItem('advokat_user', JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      console.error("Verification error:", err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('advokat_user');
    localStorage.removeItem('advokat_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, sendCode, verifyCode, logout, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};
