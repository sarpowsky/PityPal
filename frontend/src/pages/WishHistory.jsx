// Path: frontend/src/pages/WishHistory.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { exportWishHistory } from '../context/appActions';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, Download, Search, Filter, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const bannerTypes = [
  { id: 'all', label: 'All', icon: 'award' },
  { id: 'character', label: 'Character', icon: 'history-character' },
  { id: 'weapon', label: 'Weapon', icon: 'history-weapon' },
  { id: 'permanent', label: 'Standard', icon: 'history-permanent' }
];

const rarityFilters = [
  { id: 'all', label: 'All', color: 'text-white' },
  { id: '5', label: '5★', color: 'text-amber-400', bg: 'amber-500' },
  { id: '4', label: '4★', color: 'text-purple-400', bg: 'purple-500' },
  { id: '3', label: '3★', color: 'text-blue-400', bg: 'blue-500' }
];

const typeFilters = [
  { id: 'all', label: 'All Types' },
  { id: 'Character', label: 'Characters' },
  { id: 'Weapon', label: 'Weapons' }
];

const WishItem = ({ wish }) => {
  const rarityColors = {
    5: 'text-amber-400',
    4: 'text-purple-400',
    3: 'text-blue-400'
  };

  const rarityBgColors = {
    5: 'bg-black/30 border-amber-500/30',
    4: 'bg-black/30 border-purple-500/30',
    3: 'bg-black/30 border-blue-500/30'
  };

  const date = new Date(wish.time);
  const formattedDate = date.toLocaleDateString();
  
  return (
    <div className={`relative rounded-xl ${rarityBgColors[wish.rarity]} backdrop-blur-sm border
                  hover:bg-black/40 transition-all duration-300`}>
      <div className="flex items-center gap-3 p-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center`}
             style={{ backgroundColor: `${rarityColors[wish.rarity].replace('text', 'bg')}` }}>
          <span className="text-white font-medium text-xs">{wish.rarity}★</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium mb-1 ${rarityColors[wish.rarity]}`}>{wish.name}</h3>
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
  const [rarityFilter, setRarityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
    return history.filter(wish => {
      // Banner type filter
      if (activeFilter !== 'all') {
        if (activeFilter === 'character' && !wish.bannerType.startsWith('character')) return false;
        if (activeFilter !== 'character' && wish.bannerType !== activeFilter) return false;
      }
      
      // Rarity filter
      if (rarityFilter !== 'all' && wish.rarity.toString() !== rarityFilter) return false;
      
      // Item type filter
      if (typeFilter !== 'all' && wish.type !== typeFilter) return false;
      
      // Search term
      if (searchTerm && !wish.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [history, activeFilter, sortOrder, rarityFilter, typeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedWishes.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, rarityFilter, typeFilter, searchTerm]);

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
        {/* Banner Type Filter */}
        <div className="flex flex-wrap gap-2">
          {bannerTypes.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                        ${activeFilter === id 
                         ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-purple-500/50' 
                         : 'bg-black/20 border-white/10 hover:bg-black/30'} border`}
            >
              <Icon name={icon} size={20} className={activeFilter === id ? 'text-purple-400' : 'text-white/60'} />
              <span className={activeFilter === id ? 'text-white' : 'text-white/60'}>{label}</span>
            </button>
          ))}
        </div>

        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-3">
          <div className="relative flex-grow max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wish history..."
              className="w-full py-2 pl-10 pr-10 rounded-lg bg-black/30 backdrop-blur-sm
                       border border-white/10 text-white/90 placeholder-white/50
                       focus:outline-none focus:border-purple-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${showFilters 
                         ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                         : 'bg-black/20 border-white/10 hover:bg-black/30 text-white/80'} border`}
            >
              <Filter size={16} />
              <span className="text-sm">Filters</span>
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            <button
              onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg 
                       bg-black/20 hover:bg-black/30 border border-white/10 text-sm transition-colors"
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
              className="p-2 rounded-lg bg-black/20 hover:bg-black/30 
                       border border-white/10 transition-colors"
              title="Export History"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Rarity Filter</h3>
                <div className="flex flex-wrap gap-2">
                  {rarityFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setRarityFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                               ${rarityFilter === filter.id ? 
                               `bg-${filter.bg || 'indigo'}-500/20 border-${filter.bg || 'indigo'}-500/40 ${filter.color}` : 
                               'bg-black/30 border-white/10 text-white/60 hover:bg-black/40'} border`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Item Type</h3>
                <div className="flex flex-wrap gap-2">
                  {typeFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setTypeFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                               ${typeFilter === filter.id ? 
                               'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 
                               'bg-black/30 border-white/10 text-white/60 hover:bg-black/40'} border`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end ml-auto">
                <button
                  onClick={() => {
                    setRarityFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm bg-black/30 
                           hover:bg-black/40 border border-white/10 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Showing {filteredAndSortedWishes.length} of {history.length} wishes</span>
            {filteredAndSortedWishes.length !== history.length && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                Filtered
              </span>
            )}
          </div>

          {/* Top Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>

        {/* Wish List */}
        <div className="space-y-2">
          {currentWishes.length > 0 ? (
            currentWishes.map(wish => (
              <WishItem key={wish.id} wish={wish} />
            ))
          ) : (
            <div className="p-8 text-center text-white/60 border border-white/10 rounded-xl bg-black/20">
              No wishes matching your filter criteria
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
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