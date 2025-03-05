// Path: src/features/banners/BannerDetailsModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Clock, Info, Bell } from 'lucide-react';
import BannerCountdown from './BannerCountdown';
import BannerReminderDialog from '../../components/reminders/BannerReminderDialog';

const BannerDetailsModal = ({ banner, onClose }) => {
  if (!banner) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                  flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl overflow-hidden"
      >
        {/* Main Banner Section */}
        <div className="relative aspect-[16/9] rounded-t-xl overflow-hidden
                     bg-gradient-to-br from-indigo-900/90 to-purple-900/90
                     border border-white/10">
          <div className="w-full h-full bg-black">
            <img 
              src={banner.image}
              alt={banner.name}
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
              <h2 className="text-xl font-genshin">{banner.name}</h2>
              {banner.character && (
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  <span>{banner.character}</span>
                  {!banner.isPermanent && <BannerCountdown endDate={banner.endDate} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-black/95 rounded-b-xl border-x border-b border-white/10">
          <div className="grid grid-cols-2 gap-3 p-4">
            {/* Featured Items */}
            <div className="space-y-3">
              {banner.weapons && (
                <div>
                  <h3 className="text-sm font-medium text-amber-400/90 mb-2">5★ Weapons</h3>
                  <div className="space-y-1.5">
                    {banner.weapons.map((weapon, index) => (
                      <div key={index} className="flex items-center gap-2 p-2
                                              rounded-lg bg-amber-500/10 text-sm">
                        <Star size={14} className="text-amber-400" />
                        <span>{weapon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {banner.fourStars && (
                <div>
                  <h3 className="text-sm font-medium text-purple-400/90 mb-2">4★ Characters</h3>
                  <div className="space-y-1.5">
                    {banner.fourStars.map((char, index) => (
                      <div key={index} className="flex items-center gap-2 p-2
                                              rounded-lg bg-purple-500/10 text-sm">
                        <Star size={14} className="text-purple-400" />
                        <span>{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rates Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-500/10">
                <Info size={16} className="text-indigo-400 mt-0.5" />
                <div className="space-y-1.5 text-xs text-white/80">
                  <p>5★ Base Rate: 0.600%</p>
                  <p>5★ Guaranteed: 90 wishes</p>
                  <p>4★ Base Rate: 5.100%</p>
                  <p>4★ Guaranteed: 10 wishes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BannerDetailsModal;