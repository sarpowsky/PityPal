// Path: src/components/leaks/PrimogemButton.jsx
import React from 'react';

const PrimogemButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl 
               bg-black/30 backdrop-blur-sm border border-white/10
               hover:bg-black/40 hover:border-white/20
               transition-all duration-300
               group"
    >
      {/* Using a small primogem image instead of an icon */}
      <img 
        src="/icons/gem.png" 
        alt="Primogem" 
        className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" 
      />
      <span className="font-medium">Primogem Count</span>
    </button>
  );
};

export default PrimogemButton;