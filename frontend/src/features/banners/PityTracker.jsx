/* Path: frontend/src/features/banners/PityTracker.jsx */
import React from 'react';
import { Target, Crown } from 'lucide-react';

const PityTracker = ({ currentPity, guaranteed }) => {
  const softPityStart = 74;
  const hardPity = 90;
  const progress = (currentPity / hardPity) * 100;

  const getProgressGradient = () => {
    if (currentPity >= softPityStart) {
      return 'from-amber-500 via-yellow-500 to-amber-400';
    }
    if (guaranteed) {
      return 'from-emerald-500 via-green-500 to-emerald-400';
    }
    return 'from-indigo-500 via-blue-500 to-indigo-400';
  };

  const pityStatus = currentPity >= softPityStart 
    ? 'Soft pity active!' 
    : currentPity >= 45 
      ? 'Getting closer...' 
      : 'Building pity';

  return (
    <div className="w-full rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-3 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-white/60" />
            <h3 className="font-genshin text-sm">Pity Status</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs
            ${guaranteed 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
              : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'}`}>
            {guaranteed ? 'Guaranteed' : '50/50'}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">{pityStatus}</div>
            <div className="flex items-center gap-1">
              <Crown size={14} className="text-amber-400" />
              <span className="text-lg font-semibold">{currentPity}</span>
            </div>
          </div>

          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 bg-gradient-to-r ${getProgressGradient()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-white/40">
          <span>0</span>
          <div className="flex items-center gap-1">
            <span className="text-amber-400/60">Soft Pity</span>
            <span>{softPityStart}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400/60">Hard Pity</span>
            <span>{hardPity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PityTracker;