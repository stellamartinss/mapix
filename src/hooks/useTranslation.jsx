import { createContext, useContext, useState, useEffect } from 'react';
import pt from '../locales/pt';
import en from '../locales/en';

const translations = {
  pt,
  en,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('mapix_language');
    if (stored && translations[stored]) {
      return stored;
    }
    
    // Default to browser language
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('mapix_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
