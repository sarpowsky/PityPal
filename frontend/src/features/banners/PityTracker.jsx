// src/features/banners/PityTracker.jsx
import React from 'react';
import { Target, Crown, Star, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AnimatedNumber = ({ value }) => (
  <div className="tabular-nums transition-all duration-300">
    {value}
  </div>
);

const PityStages = ({ current }) => {
  const stages = [
    { at: 0, label: 'Base', rate: '0.6%' },
    { at: 74, label: 'Soft', rate: '32.4%' },
    { at: 90, label: 'Hard', rate: '100%' }
  ];

  return (
    <div className="flex justify-between items-center px-2">
      {stages.map((stage) => {
        const isPast = current >= stage.at;
        return (
          <div key={stage.at} className="flex flex-col items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                         ${isPast ? 'bg-purple-400/80 scale-125' : 'bg-white/10'}`} />
            <div className="flex flex-col items-center">
              <span className={`text-xs ${isPast ? 'text-white/80' : 'text-white/40'}`}>
                {stage.label}
              </span>
              <span className={`text-[10px] ${isPast ? 'text-purple-400/80' : 'text-white/40'}`}>
                {stage.rate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PityTracker = () => {
  const { state } = useApp();
  const pityStats = state.wishes.pity.character;
  if (!pityStats) return null;

  const getProgressGradient = () => {
    if (pityStats.current >= 85) return 'from-amber-500/80 to-yellow-500/80';
    if (pityStats.current >= 74) return 'from-purple-500/80 to-violet-500/80';
    return 'from-indigo-500/80 to-blue-500/80';
  };

  const progress = Math.min(100, (pityStats.current / 90) * 100);

  return (
    <div className="w-full rounded-xl border border-white/10 
                  bg-black/20 backdrop-blur-sm
                  transition-all duration-300 hover:bg-black/30">
      <div className="p-4 space-y-6">
        {/* Header with 50/50 Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Crown size={18} className="text-amber-400/90" />
            </div>
            <div>
              <h3 className="font-genshin text-sm">Pity Counter</h3>
              <div className="text-xs text-white/60">Character Event Banner</div>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full font-medium text-sm border
                       ${pityStats.guaranteed 
                         ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/90' 
                         : 'bg-red-500/10 border-red-500/20 text-red-400/90'}`}>
            {pityStats.guaranteed ? 'Guaranteed' : '50/50'}
          </div>
        </div>

        {/* Main Pity Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-28 flex items-center justify-center px-3 py-1 border border-white/10 rounded-lg bg-white/5">
              <div className={`flex items-center gap-1 text-xl font-medium
                          ${pityStats.current >= 85 
                            ? 'text-amber-400/90' 
                            : pityStats.current >= 74 
                              ? 'text-purple-400/90' 
                              : 'text-white/90'}`}>
                <AnimatedNumber value={pityStats.current} />
              </div>
            </div>
          </div>

          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out 
                       bg-gradient-to-r ${getProgressGradient()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <PityStages current={pityStats.current} />
        </div>

        {/* Status Card */}
        {pityStats.current >= 74 && (
          <div className={`flex items-center gap-3 p-3 rounded-lg border
                        ${pityStats.current >= 85 
                          ? 'bg-amber-500/10 border-amber-500/20' 
                          : 'bg-purple-500/10 border-purple-500/20'}`}>
            <AlertTriangle size={20} className={pityStats.current >= 85 
              ? 'text-amber-400/90' 
              : 'text-purple-400/90'} />
            <div>
              <div className={`font-medium ${pityStats.current >= 85 
                ? 'text-amber-400/90' 
                : 'text-purple-400/90'}`}>
                {pityStats.current >= 85 ? '5★ Incoming!' : 'Soft Pity Active'}
              </div>
              <div className="text-xs text-white/60">
                Rate significantly increased!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PityTracker;