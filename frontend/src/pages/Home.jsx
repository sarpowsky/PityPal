// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { waitForPyWebView } from '../utils/pywebview-bridge';
import BannerCarousel from '../features/banners/BannerCarousel';
import EventCarousel from '../features/events/EventCarousel';
import PityTracker from '../features/banners/PityTracker';
import RecentWishes from '../features/banners/RecentWishes';
import UrlImporter from '../components/UrlImporter';
import ImportGuideModal from '../components/ImportGuideModal';
import RemindersButton from '../components/reminders/RemindersButton';
import { calculateRateComparison } from '../services/analyticsService';

const StatCard = ({ icon, label, value, gradient, delay }) => (
  <div className={`group flex items-center gap-4 px-4 py-4 rounded-xl
                  bg-gradient-to-br ${gradient} backdrop-blur-sm
                  border border-white/10 transition-all duration-300
                  hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5
                  hover:-translate-y-0.5`}
       style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-center">
      <Icon name={icon} size={48} className="text-white" />
    </div>
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-semibold group-hover:text-white 
                    transition-colors duration-300">
        {value}
      </div>
    </div>
  </div>
);

const Home = () => {
  const [showGuide, setShowGuide] = useState(false);
  const { state } = useApp();
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

  return (
    <>
      {/* Fixed Reminders Button */}
      <div className="fixed top-6 left-6 z-50">
        <RemindersButton />
      </div>
      
      {/* Main content */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header with guide button and title */}
        <div className="relative flex justify-center items-center pt-6 mb-6">
          {/* Centered title */}
          <h1 className="text-5xl font-genshin animate-gradient-text">
            PityPal
          </h1>
          
          {/* Guide button positioned absolutely to the right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-black/40 backdrop-blur-sm hover:bg-black/50 border border-white/10 
                       text-sm transition-colors"
            >
              <Icon name="info" size={24} />
              <span>How to Import Wishes</span>
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-4 transform hover:scale-[1.01] transition-transform duration-300">
          <UrlImporter />
        </div>

        <div className="transition-transform duration-300 rounded-xl">
          <div className="flex gap-6">
            <BannerCarousel />
            <EventCarousel />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 grid grid-cols-1 gap-3">
            <StatCard
              icon="gem"
              label="Primogems"
              value={stats.primogems_spent.toLocaleString()}
              gradient="from-purple-500/20 to-pink-500/20"
              delay={100}
            />
            <StatCard
              icon="star"
              label="5★ Characters/Items"
              value={stats.five_stars}
              gradient="from-amber-500/20 to-orange-500/20"
              delay={200}
            />
            <StatCard
              icon="circle"
              label="4★ Characters/Items"
              value={stats.four_stars}
              gradient="from-indigo-500/20 to-blue-500/20"
              delay={300}
            />
            <StatCard
              icon="award"
              label="Total Wishes"
              value={stats.total_wishes.toLocaleString()}
              gradient="from-emerald-500/20 to-green-500/20"
              delay={400}
            />
          </div>

          <div className="col-span-4">
            <PityTracker />
          </div>

          <div className="col-span-4">
            <div className="h-full rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 
                        overflow-hidden transform hover:scale-[1.02] transition-all duration-300
                        hover:shadow-lg hover:shadow-purple-500/10" 
                style={{ animationDelay: '300ms' }}>
              <div className="p-3 border-b border-white/10">
                <h2 className="text-sm font-genshin">Recent Wishes</h2>
              </div>
              <div className="p-3 h-[240px] overflow-y-auto">
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
          background: linear-gradient(to right, #a78bfa, #ec4899, #8b5cf6, #d946ef);
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradient-animation 5s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Home;