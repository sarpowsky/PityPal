/* Path: frontend/src/pages/Home.jsx */
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import BannerCarousel from '../features/banners/BannerCarousel';
import PityTracker from '../features/banners/PityTracker';
import RecentWishes from '../features/banners/RecentWishes';
import UrlImporter from '../components/UrlImporter';
import ImportGuideModal from '../components/ImportGuideModal';
import { Star, Circle, Award, GemIcon } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl
                  bg-gradient-to-br ${gradient} backdrop-blur-sm
                  border border-white/10 transition-all duration-300
                  hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5
                  animate-fadeIn hover:-translate-y-0.5`}
       style={{ animationDelay: `${delay}ms` }}>
    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 
                  transition-colors duration-300">
      <Icon size={16} className="text-white" />
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
  const [pityData] = useState({
    current: 45,
    guaranteed: false,
    totalWishes: 248,
    stats: {
      fiveStars: 4,
      fourStars: 32,
      pity: 45,
      primogems: 1600
    }
  });

  return (
    <div className="space-y-3 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl 
                   bg-white/5 hover:bg-white/10 border border-white/10 
                   text-sm transition-colors"
        >
          <Info size={16} />
          <span>How to Import Wishes</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto mb-4 transform hover:scale-[1.01] transition-transform duration-300">
        <UrlImporter />
      </div>

      <div className="transform hover:scale-[1.01] transition-transform duration-300
                    hover:shadow-lg hover:shadow-purple-500/10 rounded-xl">
        <BannerCarousel />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4 grid grid-cols-1 gap-3">
          <StatCard
            icon={GemIcon}
            label="Primogems"
            value={pityData.stats.primogems}
            gradient="from-purple-500/20 to-pink-500/20"
            delay={100}
          />
          <StatCard
            icon={Star}
            label="5★ Characters"
            value={pityData.stats.fiveStars}
            gradient="from-amber-500/20 to-orange-500/20"
            delay={200}
          />
          <StatCard
            icon={Circle}
            label="4★ Items"
            value={pityData.stats.fourStars}
            gradient="from-indigo-500/20 to-blue-500/20"
            delay={300}
          />
          <StatCard
            icon={Award}
            label="Total Wishes"
            value={pityData.totalWishes}
            gradient="from-emerald-500/20 to-green-500/20"
            delay={400}
          />
        </div>

        <div className="col-span-4 transform hover:scale-[1.02] transition-all duration-300 
                     hover:shadow-lg hover:shadow-purple-500/10 self-start
                     animate-fadeIn" 
             style={{ animationDelay: '200ms' }}>
          <PityTracker 
            currentPity={pityData.current}
            guaranteed={pityData.guaranteed}
          />
        </div>

        <div className="col-span-4">
          <div className="h-full rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 
                       overflow-hidden transform hover:scale-[1.02] transition-all duration-300
                       hover:shadow-lg hover:shadow-purple-500/10
                       animate-fadeIn" 
               style={{ animationDelay: '300ms' }}>
            <div className="p-3 border-b border-white/10">
              <h2 className="text-sm font-genshin">Recent Wishes</h2>
            </div>
            <div className="p-3 h-[240px] overflow-y-auto">
              <RecentWishes wishes={[]} />
            </div>
          </div>
        </div>
      </div>

      {showGuide && <ImportGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default Home;