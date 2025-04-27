import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh-CN', name: '中文 (简体)' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  // Add more languages as needed
];

function WelcomeScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Function to initialize Google Translate
  const initializeGoogleTranslate = () => {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: languages.map(lang => lang.code).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    }
  };

  // Load Google Translate script
  useEffect(() => {
    // Define the callback function
    window.googleTranslateElementInit = initializeGoogleTranslate;
    
    // Only add the script if it hasn't been added before
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      initializeGoogleTranslate();
    }

    // Modified cleanup function that doesn't try to delete the window property
    return () => {
      // Just set it to null instead of trying to delete it
      window.googleTranslateElementInit = null;
    };
  }, []);

  // Handle language selection
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    // Trigger Google Translate programmatically
    setTimeout(() => {
      if (window.google && window.google.translate) {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = e.target.value;
          select.dispatchEvent(new Event('change'));
        }
      }
    }, 100); // Small delay to ensure Google Translate is ready
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
      {/* Language selector */}
      <div className="absolute top-4 right-4 flex items-center">
        <select 
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-1 text-sm backdrop-blur-sm"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        {/* Hidden Google Translate element */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          {/* Hero section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome to AI Coding</h1>
            <p className="text-xl text-blue-200 mb-6">A modern webcam application built with React</p>
            <p className="text-lg max-w-xl mx-auto text-blue-100">
              Capture and share moments easily with our webcam app. 
              Featuring a sleek interface and powerful functionality.
            </p>
          </div>
          
          {/* Features */}
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-xl p-8 mb-10 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Webcam integration", "Multi-language support", "React Router navigation", "Responsive design"].map((feature, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg bg-white bg-opacity-10">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-blue-500">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Link 
              to="/webcam" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
            >
              <span>Try the Webcam App</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
        
        <Link 
          to="/webcam" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#4285f4',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          Try the Webcam App
        </Link>
      </div>
  );
}

export default WelcomeScreen;