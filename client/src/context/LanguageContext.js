import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    title: 'Hebrew Date File Sorter',
    sourcePath: 'Source Folder Path:',
    destinationPath: 'Destination Folder Path:',
    sortButton: 'Sort Files',
    sorting: 'Sorting...',
    success: 'Files sorted successfully!',
    error: 'Error sorting files',
    sourcePathPlaceholder: '/path/to/source/folder',
    destinationPathPlaceholder: '/path/to/destination/folder',
    menuTitle: 'Menu',
    languageSection: 'Language',
    settingsSection: 'Settings',
    browse: 'Browse',
    selectBothPaths: 'Please select both source and destination folders',
  },
  he: {
    title: 'מיון קבצים לפי תאריך עברי',
    sourcePath: 'נתיב תיקיית המקור:',
    destinationPath: 'נתיב תיקיית היעד:',
    sortButton: 'מיין קבצים',
    sorting: 'ממיין...',
    success: 'הקבצים מוינו בהצלחה!',
    error: 'שגיאה במיון הקבצים',
    sourcePathPlaceholder: 'נתיב/לתיקיית/המקור',
    destinationPathPlaceholder: 'נתיב/לתיקיית/היעד',
    menuTitle: 'תפריט',
    languageSection: 'שפה',
    settingsSection: 'הגדרות',
    browse: 'בחר',
    selectBothPaths: 'אנא בחר תיקיית מקור ותיקיית יעד',
  }
};

export const LanguageProvider = ({ children }) => {
  // Set default language to Hebrew
  const [language, setLanguage] = useState('he');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}; 