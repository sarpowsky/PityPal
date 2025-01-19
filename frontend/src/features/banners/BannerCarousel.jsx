// src/features/banners/BannerCarousel.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Star } from 'lucide-react';
import { getCurrentBanners, getTimeRemaining } from '../../data/banners';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        const currentBanners = getCurrentBanners();
        if (currentBanners.length === 0) {
          throw new Error('No active banners found');
        }
        setBanners(currentBanners);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  if (loading) {
    return (
      <div className="h-56 rounded-xl bg-black/20 backdrop-blur-sm animate-pulse">
        <div className="h-full flex items-center justify-center text-white/40">
          Loading banners...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-56 rounded-xl bg-black/20 backdrop-blur-sm border border-red-500/20">
        <div className="h-full flex items-center justify-center text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];
  const timeLeft = !currentBanner.isPermanent ? getTimeRemaining(currentBanner) : null;

  return (
    <div className="relative h-56 rounded-xl overflow-hidden group">
      <div className="absolute inset-0">
        <img
          src={currentBanner.image}
          alt={currentBanner.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/banners/placeholder.jpg';
            e.target.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        {!currentBanner.isPermanent && timeLeft && (
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Calendar size={14} />
              <span>Ends {new Date(currentBanner.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Clock size={14} />
              <span>{timeLeft.days}d {timeLeft.hours}h remaining</span>
            </div>
          </div>
        )}

        <h3 className="text-xl font-genshin mb-1">{currentBanner.name}</h3>

        {currentBanner.character && (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>Featured:</span>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-current text-amber-400" />
              <span>{currentBanner.character}</span>
            </div>
          </div>
        )}

        {currentBanner.fourStars?.length > 0 && (
          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
            <span>Rate Up:</span>
            <div className="flex items-center gap-1">
              {currentBanner.fourStars.join(' • ')}
            </div>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                     bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                     transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                     bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                     transition-opacity"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 right-4 flex gap-1">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all
                  ${index === currentIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;