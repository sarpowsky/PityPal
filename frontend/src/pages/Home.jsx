// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { waitForPyWebView } from '../utils/pywebview-bridge';
import { useFirebase } from '../context/FirebaseContext';
import BannerCarousel from '../features/banners/BannerCarousel';
import EventCarousel from '../features/events/EventCarousel';
import PityTracker from '../features/banners/PityTracker';
import RecentWishes from '../features/banners/RecentWishes';
import UrlImporter from '../components/UrlImporter';
import ImportGuideModal from '../components/ImportGuideModal';
import RemindersButton from '../components/reminders/RemindersButton';
import { calculateRateComparison } from '../services/analyticsService';
import { AlertTriangle, Sparkles } from 'lucide-react';

const StatCard = ({ icon, label, value }) => (
  <div className="backdrop-blur-sm rounded-xl shadow-lg border border-white/10 
                  hover:shadow-xl hover:border-white/20 transition-all duration-300
                  bg-black/30 p-4 group">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-black/30 group-hover:bg-black/40 transition-colors">
        <Icon name={icon} size={36} className="text-white/80 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-xs text-white/60 mb-1">{label}</div>
        <div className="text-lg font-semibold group-hover:text-white text-white/90
                      transition-colors duration-300">
          {value}
        </div>
      </div>
    </div>
  </div>
);

const LeaksButton = () => (
  <Link to="/leaks" className="flex items-center gap-2 px-4 py-2 rounded-xl 
                            bg-black/30 backdrop-blur-sm border border-white/10
                            hover:bg-black/40 hover:border-white/20
                            transition-all duration-300
                            group">
    <Sparkles size={20} className="text-white/80 group-hover:text-white transition-colors" />
    <span className="font-medium">Upcoming Content</span>
  </Link>
);

const ContentUpdateNotice = ({ onUpdate }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
    <div className="flex items-center gap-2">
      <AlertTriangle size={18} className="text-white/80" />
      <span className="text-sm">New game content available</span>
    </div>
    <button 
      onClick={onUpdate}
      className="px-3 py-1 rounded-lg bg-black/30 hover:bg-black/40
                text-xs text-white font-medium transition-colors border border-white/10"
    >
      Update Now
    </button>
  </div>
);

const Home = () => {
  const [showGuide, setShowGuide] = useState(false);
  const { state } = useApp();
  const { contentUpdateAvailable, refreshContent, isLoading: firebaseLoading } = useFirebase();
  const [stats, setStats] = useState({
    total_wishes: 0,
    five_stars: 0,
    four_stars: 0,
    primogems_spent: 0,
    average_pity: 0,
    guaranteed: false
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await waitForPyWebView();
        
        // Get pity calculation
        const pityResult = await window.pywebview.api.calculate_pity();
        if (!pityResult.success) {
          console.error("Failed to calculate pity:", pityResult.error);
          return;
        }
        
        // Get wish history only once
        const history = state.wishes.history;
        if (!history || history.length === 0) return;
        
        // Use analytics service to calculate stats
        const rateComparison = calculateRateComparison(history);
        
        // Calculate average pity using pull distribution
        const characterWishes = history.filter(w => w.bannerType.startsWith('character'));
        const fiveStarWishes = characterWishes.filter(w => w.rarity === 5 && w.pity);
        const averagePity = fiveStarWishes.length ? 
          (fiveStarWishes.reduce((acc, w) => acc + w.pity, 0) / fiveStarWishes.length).toFixed(1) : 0;
        
        setStats({
          total_wishes: history.length,
          five_stars: rateComparison.counts.fiveStar,
          four_stars: rateComparison.counts.fourStar,
          primogems_spent: history.length * 160,
          average_pity: averagePity,
          guaranteed: pityResult.data.character.guaranteed
        });
      } catch (error) {
        console.error('Failed to calculate stats:', error);
      }
    };

    fetchStats();
  }, [state.wishes.history]);

  const handleContentUpdate = async () => {
    await refreshContent();
    // Force a page reload to show updated content
    window.location.reload();
  };

  return (
    <>
      {/* Main content */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header with all navigation elements in one row */}
        <div className="flex items-center justify-between pt-6 mb-6">
          {/* Left side buttons */}
          <div className="flex items-center gap-3">
            <RemindersButton />
            <LeaksButton />
          </div>
          
          {/* Centered title */}
          <h1 className="text-5xl font-genshin animate-gradient-text bg-gradient-to-r 
                         from-indigo-300 via-purple-300 to-pink-300 
                         text-transparent bg-clip-text ml-[-20px]">
            PityPal
          </h1>
          
          {/* Right side button */}
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
                     bg-black/30 backdrop-blur-sm hover:bg-black/40 border border-white/10 
                     text-sm transition-colors"
          >
            <Icon name="info" size={24} />
            <span>How to Import Wishes</span>
          </button>
        </div>

        {/* Content update notice */}
        {contentUpdateAvailable && (
          <div className="max-w-2xl mx-auto mb-4">
            <ContentUpdateNotice onUpdate={handleContentUpdate} />
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-4 transform hover:translate-y-[-2px] transition-transform duration-300">
          <UrlImporter />
        </div>

        <div className="transition-transform duration-300 rounded-xl">
          <div className="flex gap-6">
            <BannerCarousel />
            <EventCarousel />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <StatCard
              icon="gem"
              label="Primogems"
              value={stats.primogems_spent.toLocaleString()}
            />
            <StatCard
              icon="star"
              label="5★ Characters/Items"
              value={stats.five_stars}
            />
            <StatCard
              icon="circle"
              label="4★ Characters/Items"
              value={stats.four_stars}
            />
            <StatCard
              icon="award"
              label="Total Wishes"
              value={stats.total_wishes.toLocaleString()}
            />
          </div>

          <div className="col-span-4">
            <div className="h-full backdrop-blur-sm rounded-xl border border-white/10 
                          bg-black/30 overflow-hidden transform hover:translate-y-[-2px] 
                          transition-all duration-300 hover:shadow-lg">
              <PityTracker />
            </div>
          </div>

          <div className="col-span-4">
            <div className="h-full backdrop-blur-sm rounded-xl border border-white/10 
                          bg-black/30 overflow-hidden transform hover:translate-y-[-2px] 
                          transition-all duration-300 hover:shadow-lg">
              <div className="p-3 border-b border-white/10">
                <h2 className="text-sm font-genshin">Recent Wishes</h2>
              </div>
              <div className="h-[calc(100%-43px)] overflow-y-auto">
                <RecentWishes />
              </div>
            </div>
          </div>
        </div>

        {showGuide && <ImportGuideModal onClose={() => setShowGuide(false)} />}
      </div>

      <style jsx>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-text {
          background-size: 300% 300%;
          animation: gradient-animation 5s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Home;