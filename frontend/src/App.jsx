// Path: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Background from './components/Background';
import PaimonCompanion from './features/paimon/PaimonCompanion';
import { AudioProvider } from './features/audio/AudioSystem';

const Home = React.lazy(() => import('./pages/Home'));
const Characters = React.lazy(() => import('./pages/Characters'));
const WishHistory = React.lazy(() => import('./pages/WishHistory'));
const Settings = React.lazy(() => import('./pages/Settings'));

const LoadingSpinner = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center h-screen"
  >
    <div className="relative">
      <div className="w-16 h-16 border-4 border-white/20 border-t-amber-400 
                    rounded-full animate-spin" />
      <div className="mt-4 text-white/60 text-sm text-center">Loading...</div>
    </div>
  </motion.div>
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
          <Route path="/characters" element={<Characters />} />
          <Route path="/history" element={<WishHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
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
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <AnimatedRoutes />
                    </React.Suspense>
                  </div>
                </motion.main>
                <Navbar />
              </div>
              <PaimonCompanion />
            </Background>
          </AudioProvider>
        </NotificationProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;