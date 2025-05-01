// Path: src/components/leaks/details/BossDetailContent.jsx
import React from 'react';
import { Skull, MapPin } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const BossDetailContent = ({ boss }) => {
  return (
    <div className="space-y-4">
      <div className="relative h-64 rounded-lg overflow-hidden">
        <SafeImage
          src={boss.image}
          alt={boss.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/bosses/placeholder.png"
        />
      </div>
      
      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
        <h3 className="font-genshin text-xl mb-2">{boss.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {boss.type && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
              <Skull size={16} className="text-red-400" />
              <span>{boss.type}</span>
            </div>
          )}
          
          {boss.location && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <MapPin size={16} className="text-indigo-400" />
              <span>{boss.location}</span>
            </div>
          )}
        </div>
        
        {boss.description && (
          <p className="text-white/70 mb-3">{boss.description}</p>
        )}
        
        {boss.drops && boss.drops.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Notable Drops:</h4>
            <div className="flex flex-wrap gap-2">
              {boss.drops.map((drop, idx) => (
                <div key={idx} className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs">
                  {drop}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossDetailContent;