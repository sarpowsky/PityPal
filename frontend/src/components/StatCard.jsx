// src/components/StatCard.jsx
import React from 'react';
import Icon from './Icon';

const StatCard = ({ icon, label, value, color = "indigo" }) => {
  return (
    <div className="backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden
                   group hover:border-indigo-500/30 transition-all duration-300">
      {/* Background with subtle gradient */}
      <div className="bg-gradient-to-br from-black/40 to-black/20 p-4 h-full relative">
        {/* Value as main focal point */}
        <div className="text-2xl font-genshin mb-1 text-white/90 group-hover:text-white transition-colors">
          {value}
        </div>
        
        {/* Label below value */}
        <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
          {label}
        </div>
        
        {/* Icon as background accent - smaller and more to the left */}
        <div className="absolute -right-1 -bottom-4 opacity-10 group-hover:opacity-20
                      transform rotate-12 group-hover:rotate-0 scale-[1.8]
                      transition-all duration-500">
          <Icon name={icon} size={64} />
        </div>
        
        {/* Accent glow on hover */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full
                      bg-indigo-500/0 group-hover:bg-indigo-500/20 blur-xl
                      transition-all duration-500"></div>
      </div>
    </div>
  );
};

export default StatCard;