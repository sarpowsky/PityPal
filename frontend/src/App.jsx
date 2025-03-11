import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Background from './components/Background';
import PaimonCompanion from './features/paimon/PaimonCompanion';
import { AudioProvider } from './features/audio/AudioSystem';
import Home from './pages/Home';
import WishHistory from './pages/WishHistory';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import WishSimulator from './pages/WishSimulator';
import UpdateNotification from './components/UpdateNotification';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
    <div className="space-y-4 text-center">
      <img 
        src="/loading.gif" 
        alt="Loading"
        className="w-32 h-32 object-contain animate-bounce-slow"
      />
      <div className="text-lg font-genshin">Loading...</div>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<WishHistory />} />
          <Route path="/analytics" element={<Analytics />} /> 
          <Route path="/simulator" element={<WishSimulator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload Home component
    import('./pages/Home').then(() => {
      setTimeout(() => setIsLoading(false), 3500);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
      <BrowserRouter>
        <AppProvider>
          <NotificationProvider>
            <AudioProvider>
              <Background>
                <div className="flex flex-col min-h-screen">
                  <motion.main 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 pt-6 px-4 md:px-6 pb-32"
                  >
                    <div className="max-w-7xl mx-auto">
                      <AnimatedRoutes />
                    </div>
                  </motion.main>
                  <Navbar />
                </div>
                <PaimonCompanion />
                <UpdateNotification />
              </Background>
            </AudioProvider>
          </NotificationProvider>
        </AppProvider>
      </BrowserRouter>
    );
};

export default App;