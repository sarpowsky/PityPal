// src/features/banners/PityTracker.jsx (Redesigned)
import React, { useState } from 'react';
import Icon from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnimatedNumber = ({ value, className = "" }) => (
  <div className={`tabular-nums transition-all duration-300 ${className}`}>
    {value}
  </div>
);

const CircularProgress = ({ value, max, size = 120, strokeWidth = 8, className = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(100, (value / max) * 100);
  const offset = circumference - (progress / 100) * circumference;

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
  
  const getPityStats = () => {
    if (!state.wishes.pity) return null;
    
    switch (currentBannerType) {
      case 'weapon':
        return state.wishes.pity.weapon;
      case 'permanent':
        return { 
          ...state.wishes.pity.character, 
          guaranteed: false,
          bannerType: 'permanent'
        };
      case 'character':
      default:
        return state.wishes.pity.character;
    }
  };
  
  const pityStats = getPityStats();
  if (!pityStats) return null;
  
  const bannerLabels = {
    'character': 'Character Event',
    'weapon': 'Weapon Event',
    'permanent': 'Standard Banner'
  };
  
  const bannerIcons = {
    'character': 'crown',
    'weapon': 'sword',
    'permanent': 'standard-banner'
  };
  
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

  // Calculate thresholds based on banner type
  const maxPity = currentBannerType === 'weapon' ? 80 : 90;
  const softPity = currentBannerType === 'weapon' ? 63 : 74;
  
  // Calculate probability
  const calculate5StarProbability = () => {
    if (pityStats.current >= maxPity) return 100;
    if (pityStats.current >= softPity) {
      const softPityPulls = pityStats.current - softPity + 1;
      const baseRate = currentBannerType === 'weapon' ? 0.7 : 0.6;
      const softPityBoost = softPityPulls * 6;
      return Math.min(baseRate + softPityBoost, 100).toFixed(1);
    }
    return currentBannerType === 'weapon' ? 0.7 : 0.6;
  };
  
  // Status text based on pity
  const getPityStatus = () => {
    if (pityStats.current >= softPity + 10) return "High Pity";
    if (pityStats.current >= softPity) return "Soft Pity";
    if (pityStats.current >= softPity - 10) return "Approaching";
    return "Base Rate";
  };
  
  const probability = calculate5StarProbability();
  const pityStatus = getPityStatus();
  const pullsUntilHard = maxPity - pityStats.current;
  const pullsUntilSoft = Math.max(0, softPity - pityStats.current);

  // Get color based on pity status
  const getPityStatusColor = () => {
    if (pityStats.current >= softPity + 10) return "text-white/90 bg-gradient-to-r from-indigo-300/30 via-purple-300/40 to-pink-300/50";
    if (pityStats.current >= softPity) return "text-white/90 bg-gradient-to-r from-indigo-300/20 via-purple-300/30 to-pink-300/40";
    if (pityStats.current >= softPity - 10) return "text-white/80 bg-black/40";
    return "text-white/70 bg-black/30";
  };
  
  // Key pity points to mark on the bar
  const pityPoints = [
    { value: 0, label: 'Start' },
    { value: softPity, label: 'Soft' },
    { value: maxPity, label: 'Hard' }
  ];

  return (
    <div className="w-full h-full backdrop-blur-sm transition-all duration-300">
      {/* Header with guaranteed and banner switcher */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          
          {/* Banner type switcher */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
            <button
              onClick={handlePrevBanner}
              className="p-1 rounded-lg bg-black/40 hover:bg-black/50 transition-colors"
            >
              <ChevronLeft size={14} className="text-white/80" />
            </button>
            
            <div className="flex items-center justify-center w-32">
              <Icon name={bannerIcons[currentBannerType]} size={18} className="text-white/80 mr-2" />
              <div className="text-xs font-medium text-center">{bannerLabels[currentBannerType]}</div>
            </div>
            
            <button
              onClick={handleNextBanner}
              className="p-1 rounded-lg bg-black/40 hover:bg-black/50 transition-colors"
            >
              <ChevronRight size={14} className="text-white/80" />
            </button>
          </div>
          
          {/* Guarantee status */}
          {currentBannerType !== 'permanent' && (
            <div className={`px-3 py-1.5 rounded-lg text-xs border ${
              pityStats.guaranteed 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center gap-1.5">
                <Icon name="shield" size={14} className={pityStats.guaranteed ? 'text-emerald-400' : 'text-red-400'} />
                <span>{pityStats.guaranteed ? 'Guaranteed' : '50/50'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main centered circular progress */}
      <div className="px-3 pb-3">
        <div className="flex flex-col items-center">
          {/* Status above circle */}
          <div className={`mb-1 px-4 py-1 rounded-full ${getPityStatusColor()}`}>
            <div className="text-xs">{pityStatus}</div>
          </div>
          
          {/* Circular progress */}
          <CircularProgress 
            value={pityStats.current} 
            max={maxPity} 
            className="my-1"
          />
          
          {/* Probability below circle */}
          <div className="mt-1 px-4 py-1.5 rounded-lg bg-black/30 border border-white/10">
            <div className="flex items-center gap-2">
              <Icon name="star" size={14} className="text-white/80" />
              <span className="text-xs text-white/70">5★ Chance:</span>
              <span className="text-sm font-medium">{probability}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pity info and progress */}
      <div className="px-3 pb-2">
        {/* Pity stats cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center p-2 bg-black/30 rounded-lg border border-white/10">
            <Icon name="hourglass" size={16} className="text-white/60 mr-2" />
            <div>
              <div className="text-xs text-white/60">Until Soft Pity</div>
              <div className="text-sm font-medium">{pullsUntilSoft}</div>
            </div>
          </div>
          
          <div className="flex items-center p-2 bg-black/30 rounded-lg border border-white/10">
            <Icon name={pityStats.current >= softPity ? "alert-triangle" : "shield"} size={16} className="text-white/60 mr-2" />
            <div>
              <div className="text-xs text-white/60">Until Hard Pity</div>
              <div className="text-sm font-medium">{pullsUntilHard}</div>
            </div>
          </div>
        </div>
          
        {/* Progress bar */}
        <div className="bg-black/30 rounded-lg p-2.5 border border-white/10">
          <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
            {/* Progress fill */}
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300"
                 style={{ width: `${(pityStats.current / maxPity) * 100}%` }} />
            
            {/* Current position marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white"
                 style={{ left: `${(pityStats.current / maxPity) * 100}%` }} />
            
            {/* Key points markers */}
            {pityPoints.map((point, index) => (
              <div key={index}
                   className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                   style={{ left: `${(point.value / maxPity) * 100}%` }} />
            ))}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-[9px] text-white/50 mt-1.5">
            <div>0</div>
            <div>{softPity} (Soft)</div>
            <div>{maxPity} (Hard)</div>
          </div>
        </div>
        
        {/* Tips */}
        <div className="text-[9px] text-white/40 text-center mt-2">
          {currentBannerType === 'weapon' 
            ? "Soft pity starts at 63 (rate increases ~7% per pull)" 
            : "Soft pity starts at 74 (rate increases ~6% per pull)"}
        </div>
      </div>
    </div>
  );
};

export default PityTracker;