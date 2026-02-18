import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage on initial load
    const storedUser = localStorage.getItem('advokat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("https://advokat-becent.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      return await res.json();
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  const verifyCode = async (email, code) => {
    try {
      const res = await fetch("https://advokat-becent.onrender.com/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Verification failed");
      }

      const data = await res.json();
      setUser(data);
      localStorage.setItem('advokat_user', JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Verification error:", err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('advokat_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
