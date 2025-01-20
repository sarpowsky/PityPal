// src/features/banners/PityTracker.jsx
import React, { useEffect, useState } from 'react';
import { Target, Crown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { waitForPyWebView } from '../../utils/pywebview-bridge';

const PityTracker = () => {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pityStats, setPityStats] = useState({
    current: 0,
    guaranteed: false,
    pity_type: null,
    wishes_to_soft: 0,
    wishes_to_hard: 0,
    thresholds: { soft: 74, hard: 90 }
  });

  useEffect(() => {
    const fetchPityStats = async () => {
      try {
        setLoading(true);
        await waitForPyWebView();
        const result = await window.pywebview.api.calculate_pity();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to calculate pity');
        }
        
        setPityStats(result.data.character);
      } catch (err) {
        console.error('Failed to fetch pity stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (state.wishes.history.length > 0) {
      fetchPityStats();
    } else {
      setLoading(false);
    }
  }, [state.wishes.history]);

  if (loading) {
    return (
      <div className="w-full rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-8 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl bg-black/20 backdrop-blur-sm border border-red-500/20 p-6">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  const getProgressGradient = () => {
    if (pityStats.pity_type === 'soft') {
      return 'from-amber-500 to-yellow-500';
    }
    if (pityStats.guaranteed) {
      return 'from-emerald-500 to-green-500';
    }
    return 'from-indigo-500 to-blue-500';
  };

  const getPityStatus = () => {
    if (pityStats.pity_type === 'soft') return 'Soft pity active!';
    if (pityStats.current >= 45) return 'Getting closer...';
    return 'Building pity';
  };

  const progress = Math.min(100, (pityStats.current / 90) * 100);

  return (
    <div className="w-full rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm p-3 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-white/60" />
            <h3 className="font-genshin text-sm">Pity Status</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs
            ${pityStats.guaranteed 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
              : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'}`}>
            {pityStats.guaranteed ? 'Guaranteed' : '50/50'}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">{getPityStatus()}</div>
            <div className="flex items-center gap-1">
              <Crown size={14} className="text-amber-400" />
              <span className="text-lg font-semibold">{pityStats.current}</span>
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
            <span>{pityStats.thresholds.soft}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400/60">Hard Pity</span>
            <span>{pityStats.thresholds.hard}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PityTracker;