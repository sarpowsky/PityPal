// Path: frontend/src/pages/WishHistory.jsx
import React, { useState } from 'react';
import { Calendar, Filter, Download, ChevronDown, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportWishHistory } from '../context/appActions';

const WishTypeFilter = ({ active, icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
              ${active 
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-purple-500/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'}
              border backdrop-blur-sm`}
  >
    <Icon size={18} className={active ? 'text-purple-400' : 'text-white/60'} />
    <span className={active ? 'text-white' : 'text-white/60'}>{label}</span>
    {count > 0 && (
      <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
        {count}
      </span>
    )}
  </button>
);

const WishItem = ({ wish }) => {
  const rarityColors = {
    5: 'from-amber-500 to-yellow-500',
    4: 'from-purple-500 to-violet-500',
    3: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="group relative rounded-xl bg-black/20 backdrop-blur-sm border border-white/10
                  hover:bg-black/30 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center gap-4 p-4">
        <div className={`relative w-16 h-16 rounded-xl overflow-hidden
                      border-2 bg-gradient-to-br ${rarityColors[wish.rarity]}`}>
          <img 
            src={wish.image} 
            alt={wish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 right-0 px-1.5 py-0.5 
                       bg-black/60 backdrop-blur-sm rounded-tl
                       flex items-center gap-0.5 text-xs">
            <Star size={10} className="fill-current" />
            <span>{wish.rarity}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-genshin mb-1">{wish.name}</h3>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{new Date(wish.time).toLocaleDateString()}</span>
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

const WishHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { state } = useApp();
  const { history } = state.wishes;

  const handleExport = async () => {
    try {
      const result = await exportWishHistory();
      if (result.success) {
        alert(`Wishes exported to: ${result.path}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Failed to export wishes: ${error.message}`);
    }
  };

  const filteredWishes = history.filter(wish => {
    if (activeFilter === 'all') return true;
    return wish.bannerType === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Wish History
        </h1>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <WishTypeFilter
            active={activeFilter === 'all'}
            icon={Star}
            label="All Wishes"
            count={history.length}
            onClick={() => setActiveFilter('all')}
          />
          <WishTypeFilter
            active={activeFilter === 'character'}
            icon={Star}
            label="Character Event"
            count={history.filter(w => w.bannerType === 'character').length}
            onClick={() => setActiveFilter('character')}
          />
          <WishTypeFilter
            active={activeFilter === 'weapon'}
            icon={Star}
            label="Weapon Event"
            count={history.filter(w => w.bannerType === 'weapon').length}
            onClick={() => setActiveFilter('weapon')}
          />
        </div>

        <button 
          onClick={handleExport}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                  border border-white/10 transition-colors"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-white/60 text-sm px-4">
          <span>Showing {filteredWishes.length} wishes</span>
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <span>Sort by Date</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {filteredWishes.map((wish) => (
            <WishItem key={wish.id} wish={wish} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishHistory;