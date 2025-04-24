// src/components/StatCard.jsx
import React from 'react';
import Icon from './Icon';

const StatCard = ({ icon, label, value, color = "indigo" }) => {
  return (
    <div className="backdrop-blur-sm rounded-xl shadow-lg border border-white/10 
                    hover:shadow-xl hover:border-white/20 transition-all duration-300
                    bg-black/30 p-4 group">
      <div className="flex items-center gap-4">
        <Icon 
          name={icon} 
          size={48} 
          className="text-white/90 group-hover:text-white transition-colors" 
        />
        <div>
          <div className="text-xs text-white/60 mb-1">{label}</div>
          <div className="text-lg font-semibold group-hover:text-white text-white/90
                        transition-colors duration-300">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;