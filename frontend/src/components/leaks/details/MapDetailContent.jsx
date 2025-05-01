// Path: src/components/leaks/details/MapDetailContent.jsx
import React from 'react';
import SafeImage from '../../../components/SafeImage';

const MapDetailContent = ({ update }) => {
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden">
        <SafeImage
          src={update.image}
          alt={update.title}
          className="w-full max-h-96 object-contain"
          fallbackSrc="/images/maps/placeholder.png"
        />
      </div>
      
      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
        <h3 className="font-genshin text-xl mb-2">{update.title}</h3>
        <p className="text-white/70 mb-3">{update.description}</p>
        
        {update.features && update.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Features:</h4>
            <ul className="space-y-1">
              {update.features.map((feature, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDetailContent;