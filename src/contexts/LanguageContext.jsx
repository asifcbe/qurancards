import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children, userSettings }) => {
  const [currentLanguage, setCurrentLanguage] = useState(userSettings?.language || 'en');

  useEffect(() => {
    if (userSettings?.language) {
      setCurrentLanguage(userSettings.language);
    }
  }, [userSettings?.language]);

  const t = (key) => getTranslation(currentLanguage, key);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
