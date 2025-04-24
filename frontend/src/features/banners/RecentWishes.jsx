// src/features/banners/RecentWishes.jsx (Updated)
import React from 'react';
import Icon from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { Calendar } from 'lucide-react';

const WishItem = ({ wish }) => {
  const rarityColors = {
    3: 'text-blue-400',
    4: 'text-purple-400',
    5: 'text-amber-400'
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="relative rounded-lg bg-black/30 backdrop-blur-sm border border-white/10
                  hover:bg-black/40 hover:border-white/20 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center gap-3 p-3">
        {/* Colored circle indicator instead of image */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ backgroundColor: `${rarityColors[wish.rarity].replace('text', 'bg')}` }}>
          <span className="text-white font-medium text-xs">{wish.rarity}★</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${rarityColors[wish.rarity]}`}>{wish.name}</h3>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <span>{wish.bannerType}</span>
          </div>
        </div>
        
        <div className="px-3 py-1 rounded-full text-xs
                     bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
                     border border-purple-500/30">
          Pity {wish.pity || '0'}
        </div>
      </div>
    </div>
  );
};

const RecentWishes = () => {
  const { state } = useApp();

  if (state.wishes.loading) {
    return (
      <div className="space-y-2 px-3 py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-black/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!state.wishes.history.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/60 py-4">
        <Icon name="info" size={28} className="mb-2 text-white/40" />
        <p className="text-center text-sm">No wishes recorded yet</p>
        <p className="text-xs text-white/40 mt-1">Import your wishes to see them here</p>
      </div>
    );
  }

  // Show the 5 most recent wishes
  const recentWishes = state.wishes.history.slice(0, 5);
  
  return (
    <div className="px-3 py-2 space-y-2 animate-fadeIn">
      {recentWishes.map(wish => (
        <WishItem key={wish.id} wish={wish} />
      ))}
    </div>
  );
};

export default RecentWishes;