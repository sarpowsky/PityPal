// Path: frontend/src/components/simulator/BannerSelection.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, Star, Info } from 'lucide-react';
import BannerCountdown from '../../features/banners/BannerCountdown';

const BannerSelection = ({ 
  banners, 
  selectedBanner, 
  onSelectBanner
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    // Find the index of the selected banner
    const index = banners.findIndex(banner => banner.id === selectedBanner?.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [selectedBanner, banners]);
  
  const handlePrev = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex - 1 + banners.length) % banners.length;
    setCurrentIndex(newIndex);
    onSelectBanner(banners[newIndex]);
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex + 1) % banners.length;
    setCurrentIndex(newIndex);
    onSelectBanner(banners[newIndex]);
  };
  
  if (!banners || banners.length === 0) return null;
  const currentBanner = banners[currentIndex];
  
  return (
    <div className="relative">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden group w-full h-64 cursor-pointer">
        <div className="relative h-full" onClick={() => onSelectBanner(currentBanner)}>
          <img
            src={currentBanner.image}
            alt={currentBanner.name}
            className="w-full h-full object-cover"
          />
          
          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                         bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                         transition-opacity z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                         bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100
                         transition-opacity z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 max-h-[60px]">
                <h3 className="text-xl font-genshin truncate">{currentBanner.name}</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-white/80">
                  {currentBanner.character && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-current text-amber-400" />
                      <span className="truncate">{currentBanner.character}</span>
                    </div>
                  )}
                  
                  {currentBanner.weapons && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-current text-amber-400" />
                      <span className="truncate">{currentBanner.weapons.join(' & ')}</span>
                    </div>
                  )}
                </div>
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
                      onSelectBanner(banners[index]);
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

      {/* Banner Type Indicator */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm
                   border border-white/10 text-xs flex items-center gap-1">
        <Info size={12} className="text-white/60" />
        <span>
          {currentBanner.type === 'character' 
            ? 'Character Event Wish' 
            : currentBanner.type === 'weapon' 
              ? 'Weapon Event Wish' 
              : 'Standard Wish'}
        </span>
      </div>
    </div>
  );
};

export default BannerSelection;