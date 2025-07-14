import React, { useState } from 'react';
import '../styles/Sidebar.scss';

const Sidebar = ({ language, toggleLanguage, translations }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isHebrew = language === 'he';

  return (
    <>
      <div className={`sidebar ${isHebrew ? 'right-sidebar' : 'left-sidebar'} ${isOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '×' : '☰'}
        </button>
        
        <div className="sidebar-content">
          <h3>{isHebrew ? 'תפריט' : 'Menu'}</h3>
          
          <div className="menu-section">
            <h4>{isHebrew ? 'שפה' : 'Language'}</h4>
            <div className="language-options">
              <button 
                className={`language-button ${language === 'en' ? 'active' : ''}`}
                onClick={() => language !== 'en' && toggleLanguage()}
              >
                English
              </button>
              <button 
                className={`language-button ${language === 'he' ? 'active' : ''}`}
                onClick={() => language !== 'he' && toggleLanguage()}
              >
                עברית
              </button>
            </div>
          </div>

          <div className="menu-section">
            <h4>{isHebrew ? 'הגדרות' : 'Settings'}</h4>
            {/* Add more menu items here */}
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
};

export default Sidebar; 