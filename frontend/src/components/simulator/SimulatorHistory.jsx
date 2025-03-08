// Path: frontend/src/components/simulator/SimulatorHistory.jsx
import React from 'react';
import { Star, Trash2, Sparkles } from 'lucide-react';

const rarityColors = {
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-amber-400'
};

const rarityBgColors = {
  3: 'bg-blue-500/10 border-blue-500/20',
  4: 'bg-purple-500/10 border-purple-500/20',
  5: 'bg-amber-500/10 border-amber-500/20'
};

const WishItem = ({ item, index }) => {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg 
                   ${rarityBgColors[item.rarity]} animate-fadeIn`}
                   style={{ animationDelay: `${index * 50}ms` }}>
      {/* Colored circle indicator instead of image */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center"
           style={{ backgroundColor: `${rarityColors[item.rarity].replace('text', 'bg')}` }}>
        <span className="text-white font-medium text-xs">{item.rarity}★</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${rarityColors[item.rarity]}`}>
            {item.name}
          </span>
          {item.isCapturingRadiance && (
            <Sparkles size={14} className="text-yellow-400" />
          )}
        </div>
        <div className="text-xs text-white/60">
          {item.type}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        {item.isLostFiftyFifty && (
          <div className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
            Lost 50/50
          </div>
        )}
        {item.isCapturingRadiance && (
          <div className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/30 text-yellow-400 whitespace-nowrap">
            Capturing Radiance
          </div>
        )}
      </div>
    </div>
  );
};

const SimulatorHistory = ({ history, onClear }) => {
  // Count items by rarity
  const counts = history.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1;
    return acc;
  }, {});
  
  // Count Capturing Radiance occurrences
  const capturingRadianceCount = history.filter(item => item.isCapturingRadiance).length;
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-genshin">Simulation History</h2>
          
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Trash2 size={16} className="text-white/60" />
            </button>
          )}
        </div>
        
        {history.length > 0 ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2 rounded-lg bg-black/20 border border-white/10 text-center">
                <div className="text-xs text-white/60">Total</div>
                <div className="text-xl font-genshin">{history.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-xs text-white/60">5★</div>
                <div className="text-xl font-genshin text-amber-400">{counts[5] || 0}</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-xs text-white/60">4★</div>
                <div className="text-xl font-genshin text-purple-400">{counts[4] || 0}</div>
              </div>
            </div>
            
            {/* Capturing Radiance Stats (if any) */}
            {capturingRadianceCount > 0 && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center mb-4">
                <div className="text-xs text-white/60">Capturing Radiance</div>
                <div className="text-xl font-genshin text-yellow-400">{capturingRadianceCount}</div>
              </div>
            )}
            
            {/* History list */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
              {history.slice(0, 100).map((item, index) => (
                <WishItem key={item.id || index} item={item} index={index} />
              ))}
              
              {history.length > 100 && (
                <div className="text-center text-xs text-white/60 p-2">
                  Showing 100 most recent pulls
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-white/60">
            <div className="relative w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-lg font-genshin mb-1">No Wishes Yet</div>
            <p className="text-sm">Use the controls to start wishing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorHistory;