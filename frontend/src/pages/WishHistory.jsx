/* Path: frontend/src/pages/WishHistory.jsx */
import React, { useState } from 'react';
import { Calendar, Filter, Download, ChevronDown } from 'lucide-react';
import { Star } from 'lucide-react';

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
              <span>{new Date(wish.date).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <span>{wish.banner}</span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full text-xs
                     bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
                     border border-purple-500/30">
          Pity {wish.pityCount}
        </div>
      </div>
    </div>
  );
};

const WishHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [wishes] = useState([
    {
      id: 1,
      name: "Kaedehara Kazuha",
      rarity: 5,
      image: "/characters/kazuha.jpg",
      date: "2025-01-15",
      banner: "Wandering Winds",
      pityCount: 78
    }
    // Add more wishes here
  ]);

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
            count={wishes.length}
            onClick={() => setActiveFilter('all')}
          />
          <WishTypeFilter
            active={activeFilter === 'character'}
            icon={Star}
            label="Character Event"
            count={wishes.filter(w => w.banner.includes('Character')).length}
            onClick={() => setActiveFilter('character')}
          />
          <WishTypeFilter
            active={activeFilter === 'weapon'}
            icon={Star}
            label="Weapon Event"
            count={wishes.filter(w => w.banner.includes('Weapon')).length}
            onClick={() => setActiveFilter('weapon')}
          />
        </div>

        <div className="flex gap-2">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                         border border-white/10 transition-colors">
            <Filter size={20} />
          </button>
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                         border border-white/10 transition-colors">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-white/60 text-sm px-4">
          <span>Showing {wishes.length} wishes</span>
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <span>Sort by Date</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {wishes.map((wish) => (
            <WishItem key={wish.id} wish={wish} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishHistory;