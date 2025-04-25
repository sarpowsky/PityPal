// src/features/banners/PityTracker.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

const AnimatedNumber = ({ value, className = "" }) => (
  <div className={`tabular-nums transition-all duration-300 ${className}`}>
    {value}
  </div>
);

const CircularProgress = ({ value, max, size = 120, strokeWidth = 8, className = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercentage = Math.min(100, (value / max) * 100);
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#grad1)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {/* Define the gradient */}
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(148, 99, 245)" />
            <stop offset="50%" stopColor="rgb(199, 105, 243)" />
            <stop offset="100%" stopColor="rgb(240, 110, 242)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={value} className="text-4xl font-bold" />
        <div className="text-xs text-white/60">Current Pity</div>
      </div>
    </div>
  );
};

const PityTracker = () => {
  const { state } = useApp();
  const [currentBannerType, setCurrentBannerType] = useState('character');
  const [permanentBannerData, setPermanentBannerData] = useState(null);
  
  // Calculate permanent banner pity separately from history
  useEffect(() => {
    if (state.wishes && state.wishes.history && state.wishes.history.length > 0) {
      const permanentWishes = state.wishes.history.filter(wish => wish.bannerType === 'permanent');
      
      if (permanentWishes.length > 0) {
        // Sort by time ascending (oldest first) for proper counting
        const sortedWishes = [...permanentWishes].sort((a, b) => new Date(a.time) - new Date(b.time));
        
        let currentPity = 0;
        
        // Count from the end to get current pity
        for (let i = sortedWishes.length - 1; i >= 0; i--) {
          if (sortedWishes[i].rarity === 5) {
            break;
          }
          currentPity++;
        }
        
        setPermanentBannerData({
          current: currentPity,
          bannerType: 'permanent',
          thresholds: {
            soft_pity: 74,
            hard_pity: 90
          }
        });
      } else {
        // No permanent wishes found
        setPermanentBannerData({
          current: 0,
          bannerType: 'permanent',
          thresholds: {
            soft_pity: 74,
            hard_pity: 90
          }
        });
      }
    }
  }, [state.wishes.history]);
  
  // Get pity stats for current banner type
  const getPityStats = () => {
    if (!state.wishes.pity) return null;
    
    switch (currentBannerType) {
      case 'weapon':
        return state.wishes.pity.weapon;
      case 'permanent':
        return permanentBannerData || {
          current: 0,
          bannerType: 'permanent',
          thresholds: {
            soft_pity: 74,
            hard_pity: 90
          }
        };
      case 'character':
      default:
        return state.wishes.pity.character;
    }
  };
  
  const pityStats = getPityStats();
  if (!pityStats) return null;
  
  // Banner-specific configurations
  const bannerConfig = {
    'character': {
      label: 'Character Event',
      icon: 'history-character',
      softPity: 74,
      hardPity: 90,
      baseRate: 0.6,
      hasGuarantee: true,
      guaranteedText: pityStats.guaranteed ? 'Guaranteed Featured' : '50/50',
      softPityIncrease: 7 // ~7% increase per pull after soft pity
    },
    'weapon': {
      label: 'Weapon Banner',
      icon: 'history-weapon',
      softPity: 63,
      hardPity: 80,
      baseRate: 0.7,
      hasGuarantee: true,
      guaranteedText: pityStats.guaranteed ? 'Guaranteed Featured' : '75/25',
      softPityIncrease: 7 // ~7% increase per pull after soft pity
    },
    'permanent': {
      label: 'Standard Banner',
      icon: 'history-permanent',
      softPity: 74,
      hardPity: 90,
      baseRate: 0.6,
      hasGuarantee: false,
      softPityIncrease: 7 // ~7% increase per pull after soft pity
    }
  };
  
  const currentConfig = bannerConfig[currentBannerType];
  
  // Navigation handlers
  const handleNextBanner = () => {
    const order = ['character', 'weapon', 'permanent'];
    const currentIndex = order.indexOf(currentBannerType);
    const nextIndex = (currentIndex + 1) % order.length;
    setCurrentBannerType(order[nextIndex]);
  };
  
  const handlePrevBanner = () => {
    const order = ['character', 'weapon', 'permanent'];
    const currentIndex = order.indexOf(currentBannerType);
    const prevIndex = (currentIndex - 1 + order.length) % order.length;
    setCurrentBannerType(order[prevIndex]);
  };
  
  // Calculate probability
  const calculate5StarProbability = () => {
    const { softPity, hardPity, baseRate } = currentConfig;
    
    if (pityStats.current >= hardPity) return 100;
    if (pityStats.current >= softPity) {
      const softPityPulls = pityStats.current - softPity + 1;
      // Different boost rates for different banner types
      const softPityBoost = currentBannerType === 'weapon' ? softPityPulls * 7 : softPityPulls * 6;
      return Math.min(baseRate + softPityBoost, 100).toFixed(1);
    }
    return baseRate;
  };
  
  // Status text based on pity
  const getPityStatus = () => {
    const { softPity } = currentConfig;
    
    if (pityStats.current >= softPity + 10) return "High Pity";
    if (pityStats.current >= softPity) return "Soft Pity";
    if (pityStats.current >= softPity - 10) return "Approaching";
    return "Base Rate";
  };
  
  // Get color based on pity status
  const getPityStatusColor = () => {
    const { softPity } = currentConfig;
    
    if (pityStats.current >= softPity + 10) return "text-white/90 bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-pink-500/50";
    if (pityStats.current >= softPity) return "text-white/90 bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-pink-500/40";
    if (pityStats.current >= softPity - 10) return "text-white/80 bg-black/40";
    return "text-white/70 bg-black/30";
  };
  
  // Calculate values
  const probability = calculate5StarProbability();
  const pityStatus = getPityStatus();
  const { softPity, hardPity } = currentConfig;
  
  // Get color for guarantee status
  const getGuaranteeStatusColor = () => {
    if (pityStats.guaranteed) {
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
    }
    return "bg-red-500/20 border-red-500/30 text-red-400";
  };

  return (
    <div className="w-full h-full backdrop-blur-sm transition-all duration-300">
      {/* Header with centered banner switcher */}
      <div className="p-3">
        <div className="flex items-center justify-center">
          {/* Banner type switcher */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/30 border border-white/10">
            <button
              onClick={handlePrevBanner}
              className="p-1 rounded-lg bg-black/40 hover:bg-black/50 transition-colors"
            >
              <ChevronLeft size={14} className="text-white/80" />
            </button>
            
            <div className="flex items-center justify-center w-36">
              <Icon name={currentConfig.icon} size={20} className="text-white/80 mr-2" />
              <div className="text-sm font-medium text-center">{currentConfig.label}</div>
            </div>
            
            <button
              onClick={handleNextBanner}
              className="p-1 rounded-lg bg-black/40 hover:bg-black/50 transition-colors"
            >
              <ChevronRight size={14} className="text-white/80" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main centered circular progress */}
      <div className="px-3 pb-3">
        <div className="flex flex-col items-center">
          {/* Pity status indicator */}
          <div className={`mb-1 px-4 py-1 rounded-full ${getPityStatusColor()}`}>
            <div className="text-xs">{pityStatus}</div>
          </div>
          
          {/* Circular progress */}
          <CircularProgress 
            value={pityStats.current} 
            max={hardPity} 
            className="my-1"
          />
          
          {/* Probability and guarantee indicators */}
          <div className="flex items-center mt-2 gap-2">
            {/* 5★ chance indicator */}
            <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center gap-2">
                <Icon name="star" size={29} className="text-amber-400" />
                <span className="text-s text-white/70">5★ Chance:</span>
                <span className="text-sm font-semibold">{probability}%</span>
              </div>
            </div>
            
            {/* Guarantee status - only for banners with guarantee */}
            {currentConfig.hasGuarantee && (
              <div className={`px-4 py-2 rounded-lg text-sm border ${getGuaranteeStatusColor()}`}>
                <div className="flex items-center gap-2">
                  <Icon name="status" size={27} className={pityStats.guaranteed ? "text-emerald-400" : "text-red-400"} />
                  <span className="font-semibold">{currentConfig.guaranteedText}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="px-3 pb-2">
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
            {/* Progress fill with enhanced transition */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-in-out"
              style={{ width: `${Math.min(100, (pityStats.current / hardPity) * 100)}%` }} 
            />
            
            {/* Animated glow effect for more fluid feeling */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/10 w-full animate-pulse-slow opacity-30"
            />
            
            {/* Key points markers with enhanced transitions */}
            {[
              { value: 0, label: 'Start' },
              { value: softPity, label: 'Soft' },
              { value: hardPity, label: 'Hard' }
            ].map((point, index) => (
              <div 
                key={index}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40 transition-all duration-700 ease-in-out"
                style={{ left: `${(point.value / hardPity) * 100}%` }} 
              />
            ))}
            
            {/* Current position marker with enhanced transition */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white transition-all duration-700 ease-in-out shadow-md shadow-white/30"
              style={{ left: `${Math.min(100, (pityStats.current / hardPity) * 100)}%` }} 
            />
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <div>0</div>
            <div>{softPity} (Soft)</div>
            <div>{hardPity} (Hard)</div>
          </div>
          
          {/* Simplified tooltip about soft pity rate increase */}
          <div className="flex items-center justify-center mt-2 text-xs text-white/60 gap-1.5">
            <Info size={12} className="text-indigo-400" />
            <span>Soft pity increases 5★ chance by ~{currentConfig.softPityIncrease}% per pull</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this style to your CSS or use this inline style section
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

export default PityTracker;