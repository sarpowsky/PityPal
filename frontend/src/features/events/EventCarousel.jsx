// Path: src/features/events/EventCarousel.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentEvents } from '../../data/events';
import BannerCountdown from '../banners/BannerCountdown';
import EventDetailsModal from './EventDetailsModal';

const EventCarousel = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const activeEvents = getCurrentEvents();
    setCurrentEvents(activeEvents);
  }, []);

  const nextEvent = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % currentEvents.length);
  };
  
  const prevEvent = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + currentEvents.length) % currentEvents.length);
  };

  if (!currentEvents.length) return null;

  const currentEvent = currentEvents[currentIndex];

  return (
    <>
      <div 
        onClick={() => setSelectedEvent(currentEvent)}
        className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden group w-[480px] h-[240px] cursor-pointer"
      >
        <div className="relative h-full">
          <img
            src={currentEvent.image}
            alt={currentEvent.name}
            className="w-full h-full object-cover"
          />
          
          {currentEvents.length > 1 && (
            <>
              <button
                onClick={prevEvent}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                         bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                         transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextEvent}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                         bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                         transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 max-h-[60px]">
                <h3 className="text-xl font-genshin truncate">{currentEvent.name}</h3>
                <p className="text-sm text-white/80 truncate">{currentEvent.description}</p>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <BannerCountdown endDate={currentEvent.endDate} />
              </div>
            </div>

            {currentEvents.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {currentEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all
                            ${index === currentIndex 
                              ? 'bg-white w-4' 
                              : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </>
  );
};

export default EventCarousel;