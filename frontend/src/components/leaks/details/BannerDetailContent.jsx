// Path: src/components/leaks/details/BannerDetailContent.jsx
import React from 'react';
import SafeImage from '../../../components/SafeImage';

const BannerDetailContent = ({ banner }) => {
  return (
    <div className="space-y-4">
      <div className="relative h-80 rounded-lg overflow-hidden">
        <SafeImage
          src={banner.image}
          alt={banner.name}
          className="w-full h-full object-contain"
          fallbackSrc="/images/banners/placeholder.png"
        />
      </div>
      
      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
        <h3 className="font-genshin text-xl mb-2">{banner.name}</h3>
        
        {banner.description && (
          <p className="text-white/70 mb-3">{banner.description}</p>
        )}
        
        {banner.characters && banner.characters.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Featured Characters:</h4>
            <div className="flex flex-wrap gap-2">
              {banner.characters.map((character, idx) => (
                <div key={idx} className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs">
                  {character}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerDetailContent;