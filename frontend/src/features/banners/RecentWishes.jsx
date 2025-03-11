// src/features/banners/RecentWishes.jsx
import React from 'react';
import Icon from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { Calendar } from 'lucide-react';

const WishItem = ({ wish }) => {
  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 5: return 'text-amber-400';
      case 4: return 'text-purple-400';
      default: return 'text-blue-400';
    }
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="group relative rounded-lg bg-black/20 backdrop-blur-sm border border-white/10
                  hover:bg-black/30 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center gap-3 p-3">
        <div className={`flex items-center justify-center ${getRarityColors(wish.rarity)}`}>
          <div className="font-semibold text-lg">{wish.rarity}★</div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-genshin text-sm truncate">{wish.name}</h4>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Calendar size={12} />
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{formattedTime}</span>
            <span>•</span>
            <span>{wish.bannerType}</span>
          </div>
        </div>

        {wish.pity > 0 && (
          <div className="px-2 py-1 rounded-full text-xs bg-white/10">
            Pity {wish.pity}
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
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!state.wishes.history.length) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No wishes recorded yet</p>
      </div>
    );
  }

  const recentWishes = state.wishes.history.slice(0, 5);

  return (
    <div className="space-y-2">
      {recentWishes.map(wish => (
        <WishItem key={wish.id} wish={wish} />
      ))}
    </div>
  );
};

export default RecentWishes;