// src/features/banners/RecentWishes.jsx (Updated)
import React from 'react';
import Icon from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { Calendar } from 'lucide-react';

const WishItem = ({ wish }) => {
  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 5: return 'text-white border-white/20 bg-black/40';
      case 4: return 'text-white border-white/20 bg-black/40';
      default: return 'text-white border-white/20 bg-black/40';
    }
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="relative rounded-lg bg-black/30 backdrop-blur-sm border border-white/10
                  hover:bg-black/40 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center gap-3 p-2.5">
        {/* Star rating indicator with consistent styling */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRarityColors(wish.rarity)} border`}>
          <div className="font-semibold text-sm">{wish.rarity}★</div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-genshin text-sm truncate text-white/90">{wish.name}</h4>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Calendar size={10} />
            <span>{formattedDate}</span>
            <span className="text-white/40 mx-0.5">•</span>
            <span className="truncate">{wish.bannerType}</span>
          </div>
        </div>

        {wish.pity > 0 && (
          <div className="px-2 py-0.5 rounded-full text-xs bg-black/30 border border-white/10 text-white/80">
            {wish.pity}
          </div>
        )}
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