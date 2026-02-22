import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('advokat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mavjud foydalanuvchi uchun TO'G'RIDAN-TO'G'RI login (OTP yo'q)
  const loginDirect = async (email, password) => {
    try {
      const res = await fetch("https://advokat-becent.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login muvaffaqiyatsiz");
      }

      const data = await res.json();
      setUser(data.user || data);
      localStorage.setItem('advokat_user', JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  // Yangi foydalanuvchi uchun REGISTER — email kod (OTP) yuboradi
  const sendCode = async (email, password) => {
    try {
      const res = await fetch("https://advokat-becent.onrender.com/auth/send-code", {
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
      if (data.token) setAuthToken(data.token);
      return data;
    } catch (err) {
      console.error("Send code error:", err.message);
      throw err;
    }
  };

  // OTP kodni tekshirish (faqat register uchun)
  const verifyCode = async (email, code) => {
    try {
      const res = await fetch("https://advokat-becent.onrender.com/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, token: authToken }),
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
  };

  return (
    <AuthContext.Provider value={{ user, loginDirect, sendCode, verifyCode, logout, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};
