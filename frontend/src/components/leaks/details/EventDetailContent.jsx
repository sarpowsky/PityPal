// Path: src/components/leaks/details/EventDetailContent.jsx
import React from 'react';
import { Calendar, Award } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const EventDetailContent = ({ event }) => {
  return (
    <div className="space-y-4">
      <div className="relative h-80 rounded-lg overflow-hidden">
        <SafeImage
          src={event.image}
          alt={event.name}
          className="w-full h-full object-contain"
          fallbackSrc="/images/events/placeholder.png"
        />
      </div>
      
      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
        <h3 className="font-genshin text-xl mb-2">{event.name}</h3>
        
        {event.dateRange && (
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 
                        text-sm mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" />
              <span>{event.dateRange}</span>
            </div>
          </div>
        )}
        
        {event.description && (
          <p className="text-white/70 mb-3">{event.description}</p>
        )}
        
        {event.rewards && event.rewards.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Award size={14} className="text-amber-400" />
              <span>Rewards:</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.rewards.map((reward, idx) => (
                <div key={idx} className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs">
                  {reward}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailContent;