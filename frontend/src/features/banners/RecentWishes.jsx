// Path: frontend/src/features/banners/RecentWishes.jsx
import React from 'react';
import { Star } from 'lucide-react';

const WishItem = ({ wish }) => {
  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 5:
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 border-amber-300';
      case 4:
        return 'bg-gradient-to-r from-purple-500 to-violet-300 border-purple-300';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-300 border-blue-300';
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm 
                   hover:scale-102 transition-all duration-300 border border-white/10">
      <div className="flex items-center gap-3 p-3">
        <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 ${getRarityColors(wish.rarity)}`}>
          <img 
            src={wish.image} 
            alt={wish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 right-0 flex items-center gap-0.5 px-1.5 py-0.5 
                        bg-black/60 backdrop-blur-sm rounded-tl text-xs">
            <Star size={10} className="fill-current" />
            <span>{wish.rarity}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-genshin text-sm truncate">{wish.name}</h4>
          <p className="text-xs text-white/60 truncate">
            {new Date(wish.time).toLocaleDateString()} • {wish.banner}
          </p>
        </div>
      </div>
      
      <div className={`absolute inset-y-0 left-0 w-1 ${getRarityColors(wish.rarity)}`} />
    </div>
  );
};

const RecentWishes = ({ wishes }) => {
  if (!wishes?.length) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No wishes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {wishes.map((wish) => (
        <WishItem key={wish.id} wish={wish} />
      ))}
    </div>
  );
};

export default RecentWishes;