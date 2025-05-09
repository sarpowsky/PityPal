// Path: frontend/src/components/simulator/SimulatorControls.jsx
import React from 'react';
import Icon from '../../components/Icon';

const SimulatorControls = ({ 
  onWish, 
  onTenWish, 
  onReset,
  simulationState,
  isLoading
}) => {
  const { pity5, pity4, guaranteed5Star } = simulationState || {};
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-genshin mb-4">Simulator Controls</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Status Panel - Redesigned */}
          <div className="grid grid-cols-3 gap-3">
            {/* 5★ Pity Card */}
            <div className="p-3 rounded-lg border border-white/10 relative overflow-hidden
                         bg-gradient-to-br from-black/40 to-black/20 group
                         hover:border-amber-400/30 transition-all duration-300">
              <div className="relative z-10">
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">5★ Pity</span>
                <div className="text-xl font-genshin text-amber-400">{pity5 || 0}</div>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20
                          transform rotate-12 group-hover:rotate-0 scale-[2.2] 
                          transition-all duration-500">
                <Icon name="star" className="text-amber-400" size={48} />
              </div>
            </div>
            
            {/* 4★ Pity Card */}
            <div className="p-3 rounded-lg border border-white/10 relative overflow-hidden
                         bg-gradient-to-br from-black/40 to-black/20 group
                         hover:border-purple-400/30 transition-all duration-300">
              <div className="relative z-10">
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">4★ Pity</span>
                <div className="text-xl font-genshin text-purple-400">{pity4 || 0}</div>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20
                          transform rotate-12 group-hover:rotate-0 scale-[2.2] 
                          transition-all duration-500">
                <Icon name="circle" className="text-purple-400" size={48} />
              </div>
            </div>
            
            {/* Status Card - Modified as requested */}
            <div className="p-3 rounded-lg border border-white/10 relative overflow-hidden
                         bg-gradient-to-br from-black/40 to-black/20 group
                         hover:border-white/20 transition-all duration-300
                         animate-fadeIn">
              <div className="relative z-10 flex flex-col items-start">
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Status</span>
                <div className={`text-xs mt-1 px-1.5 py-0.5 rounded ${
                  guaranteed5Star 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {guaranteed5Star ? 'Guaranteed' : '50/50'}
                </div>
              </div>
              <div className="absolute right-2 top-4 opacity-10 group-hover:opacity-20
                          scale-[2] transition-opacity duration-500">
                <Icon name="status" size={38} />
              </div>
            </div>
          </div>
          
          {/* Capturing Radiance Info - Smaller */}
          <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
            <div className="p-0.5 rounded-full bg-yellow-500/15 mt-0.5">
              <Icon name="info" size={14} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-yellow-400">Capturing Radiance System</p>
              <p className="text-xs text-white/70 text-[11px]">
                When you lose the 50/50, there's a 10% chance of triggering "Capturing Radiance" which will still give you the featured 5★ character!
              </p>
            </div>
          </div>
          
          {/* Wish Buttons - Original design */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => onWish(1)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-4
                       rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20
                       border border-purple-500/30 text-white font-medium disabled:opacity-50
                       hover:from-indigo-500/30 hover:to-purple-500/30 transition-colors"
              >
                {isLoading ? (
                  <Icon name="loader" size={18} className="animate-spin text-purple-400" />
                ) : (
                  <Icon name="gem" size={27} className="text-purple-400" />
                )}
                <div className="flex flex-col items-center">
                  <span>Wish × 1</span>
                  <span className="text-xs text-white/60">160 Primogems</span>
                </div>
              </button>
              
              <button
                onClick={() => onTenWish()}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-4
                       rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20
                       border border-amber-500/30 text-white font-medium disabled:opacity-50
                       hover:from-amber-500/30 hover:to-yellow-500/30 transition-colors"
              >
                {isLoading ? (
                  <Icon name="loader" size={18} className="animate-spin text-amber-400" />
                ) : (
                  <Icon name="gem" size={27} className="text-amber-400" />
                )}
                <div className="flex flex-col items-center">
                  <span>Wish × 10</span>
                  <span className="text-xs text-white/60">1,600 Primogems</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset Button */}
      <div className="px-4 py-3 border-t border-white/10 flex justify-end">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2
                   rounded-lg bg-red-500/10 border border-red-500/20
                   hover:bg-red-500/20 hover:border-red-500/30 text-red-400 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Icon name="rotate-cw" size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset Pity</span>
        </button>
      </div>
    </div>
  );
};

export default SimulatorControls;