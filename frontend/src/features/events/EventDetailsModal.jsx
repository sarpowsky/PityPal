// Path: src/features/events/EventDetailsModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Star, AlertCircle, Trophy } from 'lucide-react';
import BannerCountdown from '../banners/BannerCountdown';

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="relative aspect-[16/9] rounded-t-xl overflow-hidden border border-white/10">
          <div className="w-full h-full bg-black">
            <img 
              src={event.image}
              alt={event.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />

          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full 
                     bg-black/50 backdrop-blur-sm hover:bg-white/10 
                     transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4
                       bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded-full text-xs
                             ${event.type === 'main' 
                               ? 'bg-amber-500/20 text-amber-400' 
                               : 'bg-purple-500/20 text-purple-400'}`}>
                  {event.type.toUpperCase()} EVENT
                </div>
                <BannerCountdown endDate={event.endDate} />
              </div>
              <h2 className="text-xl font-genshin">{event.name}</h2>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-black/95 rounded-b-xl border-x border-b border-white/10">
          <div className="grid grid-cols-2 gap-3 p-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/90">{event.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Clock size={14} />
                  <span>Duration</span>
                </div>
                <div className="text-sm">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {event.rewards && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Trophy size={16} />
                    <span className="text-sm font-medium">Rewards</span>
                  </div>
                  <div className="space-y-1.5">
                    {event.rewards.map((reward, index) => (
                      <div key={index} 
                           className="flex items-center gap-2 p-2 rounded-lg
                                  bg-white/5 text-sm">
                        <Star size={14} className="text-amber-400" />
                        <span>{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-500/10">
                <AlertCircle size={16} className="text-indigo-400 mt-0.5" />
                <div className="text-xs text-white/80">
                  Adventure Rank 20 or above required. Complete Archon Quest Chapter I: Act III.
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailsModal;