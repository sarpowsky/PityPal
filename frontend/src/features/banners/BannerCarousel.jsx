// Path: src/features/banners/BannerCarousel.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useFirebase } from '../../context/FirebaseContext';
import SafeImage from '../../components/SafeImage';
import BannerCountdown from './BannerCountdown';
import BannerDetailsModal from './BannerDetailsModal';

const BannerCarousel = () => {
  const { getBanners, isLoading } = useFirebase();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        // Get banners from Firebase instead of local data
        const bannersData = await getBanners();
        
        // Filter to show only current banners
        const now = new Date();
        const currentBanners = bannersData.filter(banner => {
          if (banner.isPermanent) return true;
          const start = banner.startDate ? new Date(banner.startDate) : null;
          const end = banner.endDate ? new Date(banner.endDate) : null;
          return (!start || now >= start) && (!end || now <= end);
        });

        if (currentBanners.length === 0) {
          throw new Error('No active banners found');
        }
        
        setBanners(currentBanners);
      } catch (err) {
        setError(err.message);
        console.error('Error loading banners:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, [getBanners]);

  const nextBanner = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  
  const prevBanner = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading || isLoading) {
    return (
      <div className="h-[240px] w-[600px] rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin mb-2"></div>
          <div className="text-sm text-white/70">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[240px] w-[600px] rounded-xl bg-black/20 backdrop-blur-sm border border-indigo-500/20 flex items-center justify-center text-white/70">
        <div className="text-center p-4">
          <div className="mb-2 text-indigo-400">No active banners found</div>
          <div className="text-sm">Check back later for updates</div>
        </div>
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
          <SafeImage
            src={currentBanner.image}
            alt={currentBanner.name}
            className="w-full h-full object-cover"
            fallbackSrc="/images/banners/placeholder.png"
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