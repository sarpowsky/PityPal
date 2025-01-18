/* Path: frontend/src/features/banners/BannerCarousel.jsx */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setBanners([
      {
        id: 1,
        name: "Wandering Winds",
        character: "Kazuha",
        image: "/banners/kazuha.jpg",
        endDate: "2025-02-15",
        type: "Character Event"
      }
    ]);
  }, []);

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  if (!banners.length) return null;

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  return (
    <div className="relative h-48 rounded-xl overflow-hidden group">
      {banners.map((banner, index) => {
        const timeLeft = calculateTimeLeft(banner.endDate);
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-500 ease-out
              ${index === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
          >
            <img
              src={banner.image}
              alt={banner.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Banner Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Calendar size={14} />
                  <span>Ends {new Date(banner.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Clock size={14} />
                  <span>{timeLeft.days}d {timeLeft.hours}h remaining</span>
                </div>
              </div>
              <h3 className="text-xl font-genshin">{banner.name}</h3>
              <p className="text-sm text-white/80">Featured: {banner.character}</p>
            </div>
          </div>
        );
      })}
      
      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={prevBanner}
          className="p-2 m-2 rounded-xl bg-black/30 backdrop-blur-sm text-white
                   border border-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={nextBanner}
          className="p-2 m-2 rounded-xl bg-black/30 backdrop-blur-sm text-white
                   border border-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
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
    </div>
  );
};

export default BannerCarousel;