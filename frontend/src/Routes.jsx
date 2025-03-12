import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WishHistory from './pages/WishHistory';
import Analytics from './pages/Analytics';
import WishSimulator from './pages/WishSimulator';
import Settings from './pages/Settings';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/history" element={<WishHistory />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/simulator" element={<WishSimulator />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="*" element={<Home />} />
  </Routes>
);

export default AppRoutes;