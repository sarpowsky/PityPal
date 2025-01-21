// Path: src/pages/WishHistory.jsx
import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Download, ChevronDown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportWishHistory } from '../context/appActions';

const ITEMS_PER_PAGE = 10;

const bannerTypes = [
  { id: 'all', label: 'All Wishes' },
  { id: 'character', label: 'Character Event' },
  { id: 'weapon', label: 'Weapon Banner' },
  { id: 'permanent', label: 'Permanent Banner' }
];

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

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="group relative rounded-lg bg-black/20 backdrop-blur-sm border border-white/10
                  hover:bg-black/30 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center gap-3 p-3">
        <div className={`relative w-12 h-12 rounded-lg overflow-hidden
                      border-2 bg-gradient-to-br ${rarityColors[wish.rarity]}`}>
          <img 
            src={`/items/${wish.name.toLowerCase().replace(/\s+/g, '-')}.png`}
            alt={wish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/items/placeholder.png';
            }}
          />
          <div className="absolute bottom-0 right-0 px-1.5 py-0.5 
                       bg-black/60 backdrop-blur-sm rounded-tl
                       flex items-center gap-0.5 text-xs">
            <Star size={10} className="fill-current" />
            <span>{wish.rarity}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">{wish.name}</h3>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <span>{formattedTime}</span>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
               disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft size={16} />
    </button>
    
    <div className="flex items-center gap-1">
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        const isActive = page === currentPage;
        
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 2 && page <= currentPage + 2)
        ) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors
                       ${isActive 
                         ? 'bg-indigo-500 text-white' 
                         : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
            >
              {page}
            </button>
          );
        } else if (
          (page === currentPage - 3 && currentPage > 4) ||
          (page === currentPage + 3 && currentPage < totalPages - 3)
        ) {
          return <span key={page} className="text-white/40">...</span>;
        }
        return null;
      })}
    </div>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
               disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

const WishHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
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

  const filteredAndSortedWishes = useMemo(() => {
    const filtered = history.filter(wish => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'character') return wish.bannerType.startsWith('character');
      return wish.bannerType === activeFilter;
    });
    
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [history, activeFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedWishes.length / ITEMS_PER_PAGE);
  const currentWishes = filteredAndSortedWishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Wish History
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {bannerTypes.map(({ id, label }) => (
            <WishTypeFilter
              key={id}
              active={activeFilter === id}
              icon={Star}
              label={label}
              count={id === 'all' 
                ? history.length 
                : id === 'character'
                ? history.filter(w => w.bannerType.startsWith('character')).length
                : history.filter(w => w.bannerType === id).length}
              onClick={() => {
                setActiveFilter(id);
                setCurrentPage(1);
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg 
                     bg-white/5 hover:bg-white/10 text-sm transition-colors"
          >
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            <ChevronDown size={14} className={`transform transition-transform
                                           ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
          </button>
          
          <button 
            onClick={handleExport}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
                    transition-colors"
          >
            <Download size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span>Showing {currentWishes.length} of {filteredAndSortedWishes.length} wishes</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          <div className="space-y-2">
            {currentWishes.map((wish) => (
              <WishItem key={wish.id} wish={wish} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishHistory;