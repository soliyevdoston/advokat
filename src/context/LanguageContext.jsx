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
    let value = translations[currentLanguage];
    
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        return path; // Return key if translation not found
      }
    }
    return value;
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
