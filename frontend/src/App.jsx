/* Path: frontend/src/App.jsx */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Background from './components/Background';
import PaimonCompanion from './features/paimon/PaimonCompanion';
import { AudioProvider } from './features/audio/AudioSystem';

const Home = React.lazy(() => import('./pages/Home'));
const Characters = React.lazy(() => import('./pages/Characters'));
const WishHistory = React.lazy(() => import('./pages/WishHistory'));
const Settings = React.lazy(() => import('./pages/Settings'));

const App = () => {
  return (
    <BrowserRouter>
      <AudioProvider>
        <Background>
          <main className="min-h-screen pb-24 pt-6 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <React.Suspense 
                fallback={
                  <div className="flex items-center justify-center h-[80vh]">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/20 border-t-amber-400 
                                  rounded-full animate-spin" />
                      <div className="mt-4 text-white/60 text-sm text-center">Loading...</div>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/characters" element={<Characters />} />
                  <Route path="/history" element={<WishHistory />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </React.Suspense>
            </div>
          </main>
          <Navbar />
          <PaimonCompanion />
        </Background>
      </AudioProvider>
    </BrowserRouter>
  );
};

export default App;