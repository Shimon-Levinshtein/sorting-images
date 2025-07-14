import React, { useState, useContext, useRef } from 'react';
import { LanguageContext } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import './styles/App.scss';

// Check if we're running in Electron
const isElectron = window.require !== undefined;
const ipcRenderer = isElectron ? window.require('electron').ipcRenderer : null;

function App() {
  const [sourcePath, setSourcePath] = useState('');
  const [destinationPath, setDestinationPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const { language, toggleLanguage, translations } = useContext(LanguageContext);
  
  const sourceInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  const handleFolderSelect = (event, type) => {
    const files = event.target.files;
    console.log('--------files--------');
    console.log(files);
    
    if (files && files[0]) {
      // Get the path from the first file in the directory
      let path = files[0].webkitRelativePath || files[0].path;
      
      console.log('--------path--------');
      console.log(path);
      // Remove the file name to get the directory path
      path = path.substring(0, path.lastIndexOf('/'));
      console.log('--------path--------');
      console.log(path);
      console.log('--------type--------');
      console.log(type);
      
      if (type === 'source') {
        setSourcePath(path);
      } else {
        setDestinationPath(path);
      }

      // Reset the input value to allow selecting the same folder again
      event.target.value = '';
    }
  };

  const handleSort = async () => {
    if (!sourcePath || !destinationPath) {
      setStatus(translations.selectBothPaths);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sort-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourcePath, destinationPath }),
      });
      
      const data = await response.json();
      setStatus(data.success ? translations.success : translations.error);
      
      if (data.success) {
        const progressInterval = setInterval(async () => {
          const statusResponse = await fetch('http://localhost:5000/api/sort-status');
          const statusData = await statusResponse.json();
          
          setProgress(statusData.progress);
          
          if (!statusData.isProcessing) {
            clearInterval(progressInterval);
          }
        }, 1000);
      }
    } catch (error) {
      setStatus(translations.error + ': ' + error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Sidebar 
        language={language} 
        toggleLanguage={toggleLanguage} 
        translations={translations}
      />
      <div className={`container ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <h1>{translations.title}</h1>
        
        <div className="form-group">
          <label>{translations.sourcePath}</label>
          <div className="input-with-button">
            <input
              type="text"
              value={sourcePath}
              readOnly
              placeholder={translations.sourcePathPlaceholder}
            />
            <input
              ref={sourceInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              style={{ display: 'none' }}
              onChange={(e) => handleFolderSelect(e, 'source')}
            />
            <button 
              className="browse-button"
              onClick={() => sourceInputRef.current.click()}
            >
              {translations.browse}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>{translations.destinationPath}</label>
          <div className="input-with-button">
            <input
              type="text"
              value={destinationPath}
              readOnly
              placeholder={translations.destinationPathPlaceholder}
            />
            <input
              ref={destinationInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              style={{ display: 'none' }}
              onChange={(e) => handleFolderSelect(e, 'destination')}
            />
            <button 
              className="browse-button"
              onClick={() => destinationInputRef.current.click()}
            >
              {translations.browse}
            </button>
          </div>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{`${progress}%`}</span>
          </div>
        )}

        <button 
          className="sort-button"
          onClick={handleSort}
          disabled={loading || !sourcePath || !destinationPath}
        >
          {loading ? translations.sorting : translations.sortButton}
        </button>

        {status && <div className="status">{status}</div>}
      </div>
    </>
  );
}

export default App; 