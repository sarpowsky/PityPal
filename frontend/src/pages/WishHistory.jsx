// Path: src/pages/WishHistory.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { exportWishHistory } from '../context/appActions';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, Download } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const bannerTypes = [
  { id: 'all', label: 'All Wishes', icon: 'award' },
  { id: 'character', label: 'Character Event', icon: 'history-character' },
  { id: 'weapon', label: 'Weapon Banner', icon: 'history-weapon' },
  { id: 'permanent', label: 'Permanent Banner', icon: 'history-permanent' }
];

const WishTypeFilter = ({ active, icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
              ${active 
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-purple-500/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'}
              border backdrop-blur-sm`}
  >
    <Icon name={icon} size={30} className={active ? 'text-purple-400' : 'text-white/60'} />
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
    5: 'text-amber-400',
    4: 'text-purple-400',
    3: 'text-blue-400'
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  return (
    <div className="group relative rounded-lg bg-black/20 backdrop-blur-sm border border-white/10
                  hover:bg-black/30 transition-all duration-300 animate-fadeIn">
      <div className="flex items-center gap-3 p-3">
        <div className={`flex items-center justify-center w-10 ${rarityColors[wish.rarity]}`}>
          <div className="font-semibold text-lg">{wish.rarity}★</div>
        </div>

        <div className="flex-1 min-w-0">
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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedWishes.length / ITEMS_PER_PAGE));

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Get current page's data
  const currentWishes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedWishes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedWishes, currentPage]);

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
          {bannerTypes.map(({ id, label, icon }) => (
            <WishTypeFilter
              key={id}
              active={activeFilter === id}
              icon={icon}
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

        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>Showing {filteredAndSortedWishes.length} wishes</span>
          </div>

          {/* Pagination and Sorting Controls */}
          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg 
                         bg-white/5 hover:bg-white/10 text-sm transition-colors"
              >
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                {sortOrder === 'desc' ? (
                  <ChevronDown size={14} className="transition-transform" />
                ) : (
                  <ChevronUp size={14} className="transition-transform" />
                )}
              </button>
              
              <button 
                onClick={handleExport}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
                        transition-colors"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {currentWishes.length > 0 ? (
            currentWishes.map(wish => (
              <WishItem key={wish.id} wish={wish} />
            ))
          ) : (
            <div className="p-8 text-center text-white/60 border border-white/10 rounded-lg bg-black/20">
              No wishes matching your filter criteria
            </div>
          )}
        </div>

        {/* Bottom Pagination for Mobile */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WishHistory;