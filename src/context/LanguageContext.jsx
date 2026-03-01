import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'uz';
  });

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('app_language', langCode);
  };

  const t = (path) => {
    const keys = path.split('.');

    // Tilni sinab ko'rish, agar mavjud bo'lmasa uz ga fallback
    const langs = [currentLanguage, 'uz'];
    for (const lang of langs) {
      if (!translations[lang]) continue;
      let value = translations[lang];
      let found = true;
      for (const key of keys) {
        if (value !== null && value !== undefined && (Array.isArray(value) ? key < value.length : key in Object(value))) {
          value = value[key];
        } else {
          found = false;
          break;
        }
      }
      if (found && value !== null && value !== undefined) return value;
    }

    return path; // fallback: key yo'li
  };

  const languages = [
    { code: 'uz', name: "O'zbek", flag: "🇺🇿" },
    { code: 'oz', name: "Ўзбек", flag: "🇺🇿" },
    { code: 'ru', name: "Русский", flag: "🇷🇺" },
    { code: 'en', name: "English", flag: "🇺🇸" }
  ];

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
