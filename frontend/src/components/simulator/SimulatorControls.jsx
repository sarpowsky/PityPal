// Path: frontend/src/components/simulator/SimulatorControls.jsx
import React from 'react';
import { GemIcon, Star, RotateCw, Cpu, Loader2, Info } from 'lucide-react';

const SimulatorControls = ({ 
  onWish, 
  onTenWish, 
  onReset,
  simulationState,
  isLoading
}) => {
  const { pity5, pity4, guaranteed5Star } = simulationState || {};
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="p-4">
        <h2 className="text-lg font-genshin mb-4">Simulator Controls</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Status Panel */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="flex items-center gap-2">
                <Star className="text-amber-400" size={16} />
                <span className="text-sm">5★ Pity</span>
              </div>
              <div className="text-lg font-genshin">{pity5 || 0}</div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="flex items-center gap-2">
                <Star className="text-purple-400" size={16} />
                <span className="text-sm">4★ Pity</span>
              </div>
              <div className="text-lg font-genshin">{pity4 || 0}</div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="flex items-center gap-2">
                <Cpu size={16} />
                <span className="text-sm">Status</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-xs ${
                guaranteed5Star 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {guaranteed5Star ? 'Guaranteed' : '50/50'}
              </div>
            </div>
          </div>
          
          {/* Capturing Radiance Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="p-1 rounded-full bg-yellow-500/20 mt-0.5">
              <Info size={14} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-400">Capturing Radiance System</p>
              <p className="text-xs text-white/70 mt-1">
                When you lose the 50/50, there's a 10% chance of triggering "Capturing Radiance" which will still give you the featured 5★ character!
              </p>
            </div>
          </div>
          
          {/* Wish Buttons */}
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
                  <Loader2 size={18} className="animate-spin text-purple-400" />
                ) : (
                  <GemIcon size={18} className="text-purple-400" />
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
                  <Loader2 size={18} className="animate-spin text-amber-400" />
                ) : (
                  <GemIcon size={18} className="text-amber-400" />
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
      
      {/* Reset Button in a separate section */}
      <div className="px-4 py-3 border-t border-white/10 flex justify-end">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2
                   rounded-lg bg-red-500/10 border border-red-500/20
                   hover:bg-red-500/20 text-red-400 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw size={16} />
          <span>Reset Pity</span>
        </button>
      </div>
    </div>
  );
};

export default SimulatorControls;