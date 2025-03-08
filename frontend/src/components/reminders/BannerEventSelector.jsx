// Path: frontend/src/components/reminders/BannerEventSelector.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Filter } from 'lucide-react';
import { 
  getActiveBannersForReminders, 
  getActiveEventsForReminders 
} from '../../services/reminderService';

const ItemCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  type = 'banner' 
}) => {
  const endDate = new Date(item.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return (
    <div 
      className={`relative p-2 rounded-lg border transition-all cursor-pointer
               ${isSelected
                 ? 'bg-indigo-500/20 border-indigo-500/50'
                 : 'bg-black/20 border-white/10 hover:bg-black/30'}`}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = type === 'banner' 
                ? '/banners/placeholder.png' 
                : '/events/placeholder.png';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{item.name}</h3>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Clock size={12} />
            <span>{daysLeft} days left</span>
            
            {type === 'banner' && item.character && (
              <>
                <span>•</span>
                <Star size={12} className="text-amber-400" />
                <span className="truncate">{item.character}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                    bg-indigo-500 flex items-center justify-center text-white">
          ✓
        </div>
      )}
    </div>
  );
};

const BannerEventSelector = ({ 
  onBannerSelect, 
  onEventSelect,
  selectedBanner = null,
  selectedEvent = null,
  showBanners = true,
  showEvents = true
}) => {
  const [activeBanners, setActiveBanners] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // Load active items
    const banners = showBanners ? getActiveBannersForReminders() : [];
    const events = showEvents ? getActiveEventsForReminders() : [];
    
    setActiveBanners(banners);
    setActiveEvents(events);
    setLoading(false);
  }, [showBanners, showEvents]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 h-32">
        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  const filteredBanners = activeBanners.filter(banner => 
    filter === 'all' || (filter === 'banners')
  );
  
  const filteredEvents = activeEvents.filter(event => 
    filter === 'all' || (filter === 'events')
  );
  
  if (filteredBanners.length === 0 && filteredEvents.length === 0) {
    return (
      <div className="p-4 text-center text-white/60">
        <p>No active banners or events found</p>
      </div>
    );
  }
  
  return (
    <div>
      {(showBanners && showEvents) && (
        <div className="flex items-center gap-2 mb-3">
          <button
            className={`px-3 py-1 rounded-lg text-xs ${filter === 'all' 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'bg-white/5 text-white/60'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-xs ${filter === 'banners' 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'bg-white/5 text-white/60'}`}
            onClick={() => setFilter('banners')}
          >
            Banners
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-xs ${filter === 'events' 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'bg-white/5 text-white/60'}`}
            onClick={() => setFilter('events')}
          >
            Events
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Banners section */}
        {showBanners && filteredBanners.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">Banners</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredBanners.map(banner => (
                <ItemCard
                  key={banner.id}
                  item={banner}
                  type="banner"
                  isSelected={selectedBanner && selectedBanner.id === banner.id}
                  onSelect={onBannerSelect}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Events section */}
        {showEvents && filteredEvents.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">Events</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredEvents.map(event => (
                <ItemCard
                  key={event.id}
                  item={event}
                  type="event"
                  isSelected={selectedEvent && selectedEvent.id === event.id}
                  onSelect={onEventSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerEventSelector;