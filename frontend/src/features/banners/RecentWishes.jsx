// src/features/banners/RecentWishes.jsx
import React, { useState, useEffect } from 'react';
import { Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ITEMS_PER_PAGE = 10;

const WishItem = ({ wish }) => {
  const getRarityColors = (rarity) => {
    switch (rarity) {
      case 5: return 'bg-gradient-to-r from-amber-500 to-yellow-300 border-amber-300';
      case 4: return 'bg-gradient-to-r from-purple-500 to-violet-300 border-purple-300';
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-300 border-blue-300';
    }
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 
                   hover:bg-black/30 transition-all duration-300">
      <div className="flex items-center gap-3 p-3">
        <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 
                      ${getRarityColors(wish.rarity)}`}>
          <img 
            src={`/items/${wish.name.toLowerCase().replace(/\s+/g, '-')}.png`}
            alt={wish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/items/placeholder.png';
            }}
          />
          <div className="absolute bottom-0 right-0 px-1.5 py-0.5 
                       bg-black/60 backdrop-blur-sm rounded-tl text-xs">
            <Star size={10} className="fill-current" />
            <span>{wish.rarity}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-genshin text-sm truncate">{wish.name}</h4>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock size={12} />
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{wish.bannerType}</span>
          </div>
        </div>

        <div className="px-2 py-1 rounded-full text-xs bg-white/10">
          Pity #{wish.pity || '?'}
        </div>
      </div>
    </div>
  );
};

const RecentWishes = () => {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [sortedWishes, setSortedWishes] = useState([]);

  useEffect(() => {
    const wishes = state.wishes.history;
    const filtered = filter === 'all' 
      ? wishes 
      : wishes.filter(w => w.bannerType === filter);
      
    setSortedWishes(filtered);
  }, [state.wishes.history, filter]);

  const totalPages = Math.ceil(sortedWishes.length / ITEMS_PER_PAGE);
  const pageWishes = sortedWishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  if (state.wishes.loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sortedWishes.length) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No wishes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {['all', 'character', 'weapon', 'standard'].map(type => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors
                     ${filter === type 
                       ? 'bg-indigo-500 text-white' 
                       : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {pageWishes.map(wish => (
          <WishItem key={wish.id} wish={wish} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-white/60">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentWishes;