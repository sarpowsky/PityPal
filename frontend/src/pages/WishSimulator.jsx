// Path: frontend/src/pages/WishSimulator.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { 
  simulateWish, 
  simulateTenPull, 
  formatBanner, 
  createNewSimulationState 
} from '../services/wishSimulatorService';
import BannerSelection from '../components/simulator/BannerSelection';
import SimulatorControls from '../components/simulator/SimulatorControls';
import SimulatorHistory from '../components/simulator/SimulatorHistory';
import WishAnimation from '../components/simulator/WishAnimation';
import { useAudio } from '../features/audio/AudioSystem';
import Icon from '../components/Icon';

const InfoCard = ({ title, children }) => (
  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2">
    <Icon name="info" className="text-indigo-400 mt-0.5 shrink-0" size={16} />
    <div>
      <h3 className="text-sm font-medium text-indigo-400 mb-1">{title}</h3>
      <div className="text-xs text-white/70">{children}</div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon = null }) => (
  <div className="p-3 rounded-lg bg-black/20 border border-white/10 text-center hover:bg-black/30 transition-colors">
    <div className="text-xs text-white/60 mb-1">{label}</div>
    <div className="text-lg font-genshin">
      {icon && <span className="mr-1">{icon}</span>}
      {value}
    </div>
  </div>
);

const WishSimulator = () => {
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formattedBanner, setFormattedBanner] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [stats, setStats] = useState({
    totalPulls: 0,
    fiveStars: 0, 
    fourStars: 0,
    threeStars: 0,
    spent: 0,
    qiqiPulls: 0,
    capturingRadiance: 0
  });
  
  // Track pity separately for each banner type
  const [simulationStates, setSimulationStates] = useState({
    'character': createNewSimulationState('character'),
    'weapon': createNewSimulationState('weapon'),
    'permanent': createNewSimulationState('permanent')
  });
  
  const [currentSimState, setCurrentSimState] = useState(null);
  const [wishResults, setWishResults] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playAudio } = useAudio();
  // Use Firebase hook to get banner data
  const { getBanners, isLoading: firebaseLoading } = useFirebase();

  // Load banners on component mount
  useEffect(() => {
    const loadBanners = async () => {
      try {
        // Get banners from Firebase with fallback to cached data
        const availableBanners = await getBanners();
        
        // Filter to only show active banners
        const now = new Date();
        const activeBanners = availableBanners.filter(banner => {
          if (banner.isPermanent) return true;
          const start = banner.startDate ? new Date(banner.startDate) : null;
          const end = banner.endDate ? new Date(banner.endDate) : null;
          return (!start || now >= start) && (!end || now <= end);
        });
        
        setBanners(activeBanners);
        
        // Select first banner by default
        if (activeBanners.length > 0) {
          setSelectedBanner(activeBanners[0]);
        }
      } catch (error) {
        console.error('Error loading banners for simulator:', error);
        // If error occurs, default banners will be used as fallback (handled by getBanners)
      }
    };
    
    loadBanners();
  }, [getBanners]);

  // Format banner when selected and set current simulation state
  useEffect(() => {
    if (selectedBanner) {
      const formatted = formatBanner(selectedBanner);
      setFormattedBanner(formatted);
      
      // Determine which pity pool to use
      let bannerKey = formatted.bannerType;
      if (bannerKey.startsWith('character')) {
        bannerKey = 'character'; // Character banners share pity
      } else if (bannerKey === 'weapon') {
        bannerKey = 'weapon';
      } else {
        bannerKey = 'permanent';
      }
      
      // Set current simulation state
      setCurrentSimState(simulationStates[bannerKey]);
    }
  }, [selectedBanner, simulationStates]);

  const updateSimulationState = (newState) => {
    if (!formattedBanner) return;
    
    // Determine banner key
    let bannerKey = formattedBanner.bannerType;
    if (bannerKey.startsWith('character')) {
      bannerKey = 'character';
    } else if (bannerKey === 'weapon') {
      bannerKey = 'weapon';
    } else {
      bannerKey = 'permanent';
    }
    
    // Update the simulation state for this banner type
    setSimulationStates(prev => ({
      ...prev,
      [bannerKey]: newState
    }));
    
    // Update current state reference
    setCurrentSimState(newState);
  };

  const handleSingleWish = () => {
    if (!formattedBanner || !currentSimState || isLoading) return;
    
    setIsLoading(true);
    playAudio('buttonClick');
    
    // Simulate a single wish
    const { result, newState } = simulateWish(currentSimState, formattedBanner);
    
    // Display animation
    setWishResults([result]);
    setShowAnimation(true);
    
    // Update statistics
    setStats(prev => ({
      totalPulls: prev.totalPulls + 1,
      fiveStars: prev.fiveStars + (result.rarity === 5 ? 1 : 0),
      fourStars: prev.fourStars + (result.rarity === 4 ? 1 : 0),
      threeStars: prev.threeStars + (result.rarity === 3 ? 1 : 0),
      spent: prev.spent + 160,
      qiqiPulls: prev.qiqiPulls + (result.name === "Qiqi" ? 1 : 0),
      capturingRadiance: prev.capturingRadiance + (result.isCapturingRadiance ? 1 : 0)
    }));
    
    // Update simulation state with history
    const updatedState = {
      ...newState,
      history: [result, ...currentSimState.history]
    };
    
    updateSimulationState(updatedState);
  };
  
  const handleTenWish = () => {
    if (!formattedBanner || !currentSimState || isLoading) return;
    
    setIsLoading(true);
    playAudio('buttonClick');
    
    // Simulate ten pulls
    const { results, newState } = simulateTenPull(currentSimState, formattedBanner);
    
    // Display animation
    setWishResults(results);
    setShowAnimation(true);
    
    // Update statistics
    setStats(prev => ({
      totalPulls: prev.totalPulls + 10,
      fiveStars: prev.fiveStars + results.filter(r => r.rarity === 5).length,
      fourStars: prev.fourStars + results.filter(r => r.rarity === 4).length,
      threeStars: prev.threeStars + results.filter(r => r.rarity === 3).length,
      spent: prev.spent + 1600,
      qiqiPulls: prev.qiqiPulls + results.filter(r => r.name === "Qiqi").length,
      capturingRadiance: prev.capturingRadiance + results.filter(r => r.isCapturingRadiance).length
    }));
    
    // Update simulation state with history
    const updatedState = {
      ...newState,
      history: [...results, ...currentSimState.history]
    };
    
    updateSimulationState(updatedState);
  };
  
  const handleReset = () => {
    if (!formattedBanner) return;
    
    playAudio('buttonClick');
    
    // Determine which pity pool to reset
    let bannerKey = formattedBanner.bannerType;
    if (bannerKey.startsWith('character')) {
      bannerKey = 'character';
    } else if (bannerKey === 'weapon') {
      bannerKey = 'weapon';
    } else {
      bannerKey = 'permanent';
    }
    
    // Create new simulation state but preserve history
    const newState = {
      ...createNewSimulationState(bannerKey),
      history: simulationStates[bannerKey].history
    };
    
    // Update the simulation state
    setSimulationStates(prev => ({
      ...prev,
      [bannerKey]: newState
    }));
    
    // Update current state reference
    setCurrentSimState(newState);
  };
  
  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setWishResults(null);
    setIsLoading(false);
  };
  
  const clearHistory = () => {
    if (!currentSimState || !formattedBanner) return;
    
    // Determine which pity pool to clear history for
    let bannerKey = formattedBanner.bannerType;
    if (bannerKey.startsWith('character')) {
      bannerKey = 'character';
    } else if (bannerKey === 'weapon') {
      bannerKey = 'weapon';
    } else {
      bannerKey = 'permanent';
    }
    
    // Update state with empty history
    setSimulationStates(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        history: []
      }
    }));
    
    // Update current state reference
    setCurrentSimState({
      ...currentSimState,
      history: []
    });
    
    // Reset stats when history is cleared
    setStats({
      totalPulls: 0,
      fiveStars: 0, 
      fourStars: 0,
      threeStars: 0,
      spent: 0,
      qiqiPulls: 0,
      capturingRadiance: 0
    });
  };

  // Loading state while getting banner data
  if (firebaseLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/70">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                       via-purple-300 to-pink-300 text-transparent bg-clip-text">
            Wish Simulator
          </h1>
          <p className="text-white/60 mt-1">
            Simulate wishes without spending your primogems
          </p>
        </div>
        <button 
          onClick={() => setShowInfoCard(!showInfoCard)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Icon name="bell-ring" size={36} className="text-white/60" />
        </button>
      </header>

      {showInfoCard && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <InfoCard title="About Wish Simulator">
            <p className="mb-2">This simulator uses actual game rates and pity mechanics!</p>
            <p className="mb-2">• Character banners share pity across both featured character banners</p>
            <p className="mb-2">• Weapon and Standard banners each have separate pity counters</p>
            <p className="mb-2">• Soft pity increases your 5★ chance starting at 74 pulls for characters and 63 for weapons</p>
            <p>• When you lose the 50/50, there's a 10% chance to trigger "Capturing Radiance" and still get the featured character!</p>
          </InfoCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Banner Selection */}
          {banners.length > 0 && (
            <BannerSelection 
              banners={banners} 
              selectedBanner={selectedBanner}
              onSelectBanner={setSelectedBanner}
            />
          )}
          
          {/* Controls */}
          {currentSimState && (
            <SimulatorControls 
              onWish={handleSingleWish}
              onTenWish={handleTenWish}
              onReset={handleReset}
              simulationState={currentSimState}
              isLoading={isLoading}
            />
          )}
          
          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="Total Pulls" value={stats.totalPulls.toLocaleString()} />
            <StatCard label="Primogems Spent" value={stats.spent.toLocaleString()} />
            <StatCard 
              label="5★ Rate" 
              value={`${stats.totalPulls ? (stats.fiveStars / stats.totalPulls * 100).toFixed(1) : '0.0'}%`} 
            />
            <StatCard 
              label="4★ Rate" 
              value={`${stats.totalPulls ? (stats.fourStars / stats.totalPulls * 100).toFixed(1) : '0.0'}%`} 
            />
            {stats.qiqiPulls > 0 && (
              <StatCard 
                label="Qiqi Pulls" 
                value={stats.qiqiPulls} 
              />
            )}
          </div>

          {/* Capturing Radiance indicator */}
          {stats.capturingRadiance > 0 && (
            <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-400">Capturing Radiance</div>
                <div className="text-xs text-white/60">Triggered {stats.capturingRadiance} times</div>
              </div>
            </div>
          )}
          
          {/* Pity Status */}
          {currentSimState && formattedBanner && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-genshin">Pity Status</h2>
                <div className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                  {formattedBanner.bannerType.startsWith('character') ? 'Character Banner' : 
                   formattedBanner.bannerType === 'weapon' ? 'Weapon Banner' : 'Standard Banner'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-genshin">{currentSimState.pity5}</div>
                  <div className="text-xs text-white/60">Current Pity</div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs ${
                  currentSimState.guaranteed5Star 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                } border`}>
                  {currentSimState.guaranteed5Star ? 'Guaranteed' : '50/50'}
                </div>
              </div>
              
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ 
                    width: `${Math.min(100, (currentSimState.pity5 / 
                      (formattedBanner.bannerType === 'weapon' ? 80 : 90)) * 100)}%` 
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>0</span>
                <span>Soft Pity ({formattedBanner.bannerType === 'weapon' ? '63' : '74'})</span>
                <span>{formattedBanner.bannerType === 'weapon' ? '80' : '90'}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* History */}
          {currentSimState && (
            <SimulatorHistory 
              history={currentSimState.history}
              onClear={clearHistory}
            />
          )}
        </div>
      </div>
      
      {/* Wish Animation */}
      {showAnimation && (
        <WishAnimation
          results={wishResults}
          simulationState={currentSimState}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
};

export default WishSimulator;