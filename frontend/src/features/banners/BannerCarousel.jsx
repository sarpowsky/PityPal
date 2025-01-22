// Path: src/features/banners/BannerCarousel.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getCurrentBanners } from '../../data/banners';
import BannerCountdown from './BannerCountdown';
import BannerDetailsModal from './BannerDetailsModal';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBanners = () => {
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

  const nextBanner = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  
  const prevBanner = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="h-[240px] rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/40">
        Loading banners...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[240px] rounded-xl bg-black/20 backdrop-blur-sm border border-red-500/20 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!banners.length) return null;

  const currentBanner = banners[currentIndex];

  return (
    <>
      <div 
        onClick={() => setSelectedBanner(currentBanner)}
        className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden group w-[600px] h-[240px] cursor-pointer"
      >
        <div className="relative h-full">
          <img
            src={currentBanner.image}
            alt={currentBanner.name}
            className="w-full h-full object-cover"
          />
          
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
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 max-h-[60px]">
                <h3 className="text-xl font-genshin truncate">{currentBanner.name}</h3>
                {currentBanner.character && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-current text-amber-400" />
                      <span className="truncate">{currentBanner.character}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {!currentBanner.isPermanent && (
                <div className="flex-shrink-0 ml-4">
                  <BannerCountdown endDate={currentBanner.endDate} />
                </div>
              )}
            </div>
            
            {banners.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {banners.map((_, index) => (
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

      {selectedBanner && (
        <BannerDetailsModal 
          banner={selectedBanner} 
          onClose={() => setSelectedBanner(null)} 
        />
      )}
    </>
  );
};

export default BannerCarousel;