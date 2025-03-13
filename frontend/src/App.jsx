// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { AudioProvider } from './features/audio/AudioSystem';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import WishHistory from './pages/WishHistory';
import Analytics from './pages/Analytics';
import WishSimulator from './pages/WishSimulator';
import Settings from './pages/Settings';
import UpdateNotification from './components/UpdateNotification';
import PaimonCompanion from './features/paimon/PaimonCompanion';
import FeaturesIntegration from './features/FeaturesIntegration';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="text-center">
      <img src="/loading.gif" alt="Loading" className="w-32 h-32 object-contain animate-bounce-slow" />
      <div className="text-lg font-genshin mt-2">Loading...</div>
    </div>
  </div>
);

const App = () => {
  const [loading, setLoading] = useState(true);
  const homeButtonRef = useRef(null);
  
  // Pass this ref to Navbar
  const setHomeButtonRef = (ref) => {
    homeButtonRef.current = ref;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      
      // After loading, click the home button programmatically
      setTimeout(() => {
        if (homeButtonRef.current) {
          homeButtonRef.current.click();
        }
      }, 100);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <HashRouter>
      <AppProvider>
        <NotificationProvider>
          <AudioProvider>
            <Background>
              {loading ? (
                <LoadingScreen />
              ) : (
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pt-6 px-4 md:px-6 pb-32">
                    <div className="max-w-7xl mx-auto">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/history" element={<WishHistory />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/simulator" element={<WishSimulator />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Home />} />
                      </Routes>
                    </div>
                  </main>
                  <Navbar homeButtonRef={setHomeButtonRef} />
                  <PaimonCompanion />
                  <UpdateNotification />
                  {/* Add FeaturesIntegration component */}
                  <FeaturesIntegration />
                </div>
              )}
            </Background>
          </AudioProvider>
        </NotificationProvider>
      </AppProvider>
    </HashRouter>
  );
};

export default App;