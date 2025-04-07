
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'np';

interface LanguageContextType {
  language: Language;
  isNepaliLanguage: boolean;
  toggleLanguage: () => void;
  t: (en: string, np: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const isNepaliLanguage = language === 'np';
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('nepaliLanguage');
    if (savedLanguage === 'true') {
      setLanguage('np');
    }
  }, []);
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'np' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('nepaliLanguage', newLanguage === 'np' ? 'true' : 'false');
  };
  
  // Translation helper
  const t = (en: string, np: string): string => {
    return language === 'en' ? en : np;
  };
  
  return (
    <LanguageContext.Provider value={{ language, isNepaliLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
