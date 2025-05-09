// Path: frontend/src/pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  LineChart, BarChart2, PieChart, HelpCircle, Brain, Loader, 
  Zap, Info, AlertCircle
} from 'lucide-react';

// Import analytics components
import DistributionChart from '../components/analytics/DistributionChart';
import RateComparisonChart from '../components/analytics/RateComparisonChart';
import BannerDistributionChart from '../components/analytics/BannerDistributionChart';

// Import analytics services
import { 
  calculatePullDistribution,
  calculateRateComparison,
  calculateBannerTypeDistribution,
  calculateItemTypeDistribution
} from '../services/analyticsService';

const BannerInfoCard = ({ title, children }) => (
  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2">
    <Icon name="info" className="text-indigo-400 mt-0.5 shrink-0" size={16} />
    <div>
      <h3 className="text-sm font-medium text-indigo-400 mb-1">{title}</h3>
      <div className="text-xs text-white/70">{children}</div>
    </div>
  </div>
);

const DiamondIcon = ({ className, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2.7 10.5H21.3L12 21.5L2.7 10.5Z" />
    <path d="M12 2.5L21.3 10.5H2.7L12 2.5Z" />
  </svg>
);

const Analytics = () => {
  const { state } = useApp();
  const { showNotification } = useNotification();
  const [currentBanner, setCurrentBanner] = useState('character');
  const [currentPity, setCurrentPity] = useState(0);
  const [isGuaranteed, setIsGuaranteed] = useState(false);
  const [numPulls, setNumPulls] = useState(40);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [activeTab, setActiveTab] = useState('predictions');
  const [isTraining, setIsTraining] = useState(false);
  const [quickMode, setQuickMode] = useState(false);

  // Calculate analytics data from wish history
  const analyticsData = useMemo(() => {
    const wishes = state.wishes?.history || [];
    return {
      pullDistribution: calculatePullDistribution(wishes),
      rateComparison: calculateRateComparison(wishes),
      bannerDistribution: calculateBannerTypeDistribution(wishes),
      itemTypeDistribution: calculateItemTypeDistribution(wishes)
    };
  }, [state.wishes?.history]);

  // Update current pity whenever state.wishes.pity changes or banner type changes
  // This runs on initial load and when wishes data is updated
  useEffect(() => {
    if (state.wishes?.pity) {
      updatePityFromState(currentBanner);
    }
  }, [state.wishes?.pity, currentBanner]); // Depend on both pity changes and banner changes

  // Handler for banner type change
  const handleBannerChange = (e) => {
    const newBanner = e.target.value;
    setCurrentBanner(newBanner);
    
    // Force immediate pity update when banner changes
    if (state.wishes?.pity) {
      updatePityFromState(newBanner);
    }
  };

  // Helper function to update pity from state.wishes.pity
  const updatePityFromState = (bannerType) => {
    if (state.wishes?.pity) {
      // Map frontend banner type to backend banner type if needed
      // Frontend uses 'permanent' for Standard Banner
      // Backend could be using 'permanent' or 'standard' - we'll check both
      let backendBannerTypes = [bannerType];
      
      // Add additional mappings if needed
      if (bannerType === 'permanent') {
        backendBannerTypes.push('standard'); // Try alternative name if used by backend
      } else if (bannerType === 'standard') {
        backendBannerTypes.push('permanent'); // Try alternative name if used by backend
      }
      
      // Try to find pity data using all possible banner type names
      let pityData = null;
      for (const type of backendBannerTypes) {
        if (state.wishes.pity[type]) {
          pityData = state.wishes.pity[type];
          break;
        }
      }
      
      if (pityData) {
        // If pity data exists for this banner, update the state
        setCurrentPity(pityData.current);
        
        // Set guaranteed status based on banner type
        if (bannerType === 'permanent' || bannerType === 'standard') {
          // Standard/Permanent banner never has guarantee
          setIsGuaranteed(false);
        } else {
          // Character and weapon banners can have guarantee
          setIsGuaranteed(pityData.guaranteed || false);
        }
      } else {
        // If no pity data exists for this banner, reset to defaults
        setCurrentPity(0);
        setIsGuaranteed(false);
      }
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const result = await window.pywebview.api.train_prediction_model();
      
      if (result.success) {
        showNotification('success', 'Model Trained', 'Prediction model has been successfully trained with your wish history');
        // After training, generate prediction
        handlePrediction();
      } else {
        setError(result.error || 'Failed to train model');
        showNotification('error', 'Training Failed', result.error || 'Failed to train prediction model');
      }
    } catch (err) {
      setError(`Training error: ${err.message}`);
      showNotification('error', 'Training Error', err.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handlePrediction = async () => {
    setLoading(true);
    setError(null);
    setQuickMode(false);
    
    try {
      const result = await window.pywebview.api.predict_wishes(
        currentPity,
        currentBanner,
        isGuaranteed,
        numPulls
      );
      
      if (result.success) {
        setPredictions(result);
        showNotification('success', 'Prediction Complete', 'Your wish prediction has been generated successfully');
      } else {
        // If error mentions no model, offer to train one
        if (result.error && result.error.includes("No prediction model available")) {
          setError("No prediction model available. Please train the model first using the button below.");
        } else {
          setError(result.error || 'Failed to generate predictions');
          showNotification('error', 'Prediction Failed', result.error || 'Failed to generate predictions');
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      showNotification('error', 'Prediction Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimplePrediction = async () => {
    setLoading(true);
    setError(null);
    setQuickMode(true);
    
    try {
      // Get thresholds for this banner type
      const softPity = getSoftPity();
      const hardPity = getHardPity();
      
      // Calculate pulls needed and probabilities using game mechanics
      const pullsNeeded = Math.min(numPulls, hardPity - currentPity);
      const predictions = [];
      let cumulativeProbability = 0;
      
      // Determine base rate based on banner type
      let baseRate;
      if (currentBanner === 'weapon') {
        baseRate = 0.007; // 0.7% for weapon banner
      } else if (currentBanner === 'permanent') {
        baseRate = 0.006; // 0.6% for standard banner
      } else {
        baseRate = 0.006; // 0.6% for all character banners
      }
      
      for (let i = 0; i < pullsNeeded; i++) {
        const pull = currentPity + i + 1;
        let probability;
        
        if (pull >= hardPity) {
          // Hard pity is 100%
          probability = 1.0;
        } else if (pull >= softPity) {
          // Soft pity formula (approximated from game data)
          const softPityProgress = (pull - softPity) / (hardPity - softPity);
          probability = 0.2 + softPityProgress * 0.6; // Ramps from 20% to 80%
        } else {
          // Base rate
          probability = baseRate;
        }
        
        // Calculate new cumulative probability
        cumulativeProbability = 1 - (1 - cumulativeProbability) * (1 - probability);
        
        predictions.push({
          pull: pull,
          probability: probability,
          cumulative: cumulativeProbability
        });
      }
      
      // Find pull with 50% and 90% chance
      const pull50 = predictions.find(p => p.cumulative >= 0.5);
      const pull90 = predictions.find(p => p.cumulative >= 0.9);

      // Calculate primogems needed
      const primogems50pct = pull50 ? (pull50.pull - currentPity) * 160 : null;
      const primogems90pct = pull90 ? (pull90.pull - currentPity) * 160 : null;
      
      // Generate chart image using backend API
      const chartResult = await window.pywebview.api.generate_quick_prediction_chart(
        currentPity,
        currentBanner,
        isGuaranteed,
        predictions
      );
      
      // Create enhanced insights
      const insights = [];
      
      if (currentPity >= softPity) {
        insights.push(`You're in soft pity (starts at ${softPity})! Your 5★ chances are significantly increased.`);
      } else if (currentPity >= softPity - 10) {
        insights.push(`You're getting close to soft pity at ${softPity} pulls. Just ${softPity - currentPity} more pulls!`);
      } else {
        insights.push(`You're at ${currentPity} pity. Soft pity begins at ${softPity} pulls.`);
      }
      
      if (isGuaranteed && currentBanner === 'character') {
        insights.push("You're guaranteed to get the featured character on your next 5★!");
      } else if (currentBanner === 'character') {
        insights.push("You're on 50/50 for your next 5★ (plus 10% Capturing Radiance chance if you lose 50/50).");
      }
      
      if (pull50) {
        const pulls50 = pull50.pull - currentPity;
        insights.push(`You have a 50% chance of getting a 5★ within ${pulls50} pulls (pity ${pull50.pull}).`);
        
        if (primogems50pct) {
          insights.push(`That's about ${primogems50pct} primogems for a 50% chance.`);
        }
      }
      
      if (pull90) {
        const pulls90 = pull90.pull - currentPity;
        insights.push(`You have a 90% chance of getting a 5★ within ${pulls90} pulls (pity ${pull90.pull}).`);
        
        if (primogems90pct) {
          insights.push(`That's about ${primogems90pct} primogems for a 90% chance.`);
        }
      }
      
      const remainingToHard = hardPity - currentPity;
      if (remainingToHard > 0) {
        insights.push(`You're guaranteed a 5★ within ${remainingToHard} pulls at hard pity (${hardPity}).`);
      } else {
        insights.push(`You've reached hard pity (${hardPity})! Your next pull will 100% be a 5★!`);
      }
      
      // Determine confidence interval (simplified)
      const confidenceInterval = pull90 && pull50 ? Math.max(1, Math.floor((pull90.pull - pull50.pull) / 2)) : 1;
      
      // Create a simplified result with chart image
      const simplePrediction = {
        success: true,
        predictions: predictions,
        chart_image: chartResult.success ? chartResult.chart_image : null,
        summary: {
          current_pity: currentPity,
          guaranteed: isGuaranteed,
          banner_type: currentBanner,
          pull_50pct: pull50 ? pull50.pull : null,
          pull_90pct: pull90 ? pull90.pull : null,
          confidence_interval: confidenceInterval,
          primogems_50pct: primogems50pct,
          primogems_90pct: primogems90pct,
          insights: insights
        }
      };
      
      setPredictions(simplePrediction);
      showNotification('success', 'Calculation Complete', 'Your wish probability has been calculated based on game mechanics');
    } catch (err) {
      setError(`Error: ${err.message}`);
      showNotification('error', 'Calculation Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSoftPity = () => {
    return currentBanner === 'weapon' ? 63 : 74;
  };

  const getHardPity = () => {
    return currentBanner === 'weapon' ? 80 : 90;
  };

  const getColorForPull = (pull) => {
    const softPity = getSoftPity();
    const hardPity = getHardPity();
    
    if (pull >= hardPity) return 'text-red-400';
    if (pull >= softPity) return 'text-purple-400';
    return 'text-white';
  };

  const getBannerName = (type) => {
    switch(type) {
      case 'character': return 'Character Event';
      case 'weapon': return 'Weapon Banner';
      case 'permanent': return 'Standard Banner';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="space-y-6 animate-fadeIn">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                         via-purple-300 to-pink-300 text-transparent bg-clip-text">
              Wish Analytics
            </h1>
            <p className="text-white/60 mt-1">
              Analyze your wish history and predict future pulls
            </p>
          </div>
          <button 
            onClick={() => setShowInfoCard(!showInfoCard)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Icon name='bell-ring' size={36}/>
          </button>
        </header>

        {showInfoCard && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BannerInfoCard title="About Wish Analytics">
              <p className="mb-2">This tool helps you analyze your wish history and predict future pulls using statistical models and machine learning.</p>
              <p className="mb-2"><strong>Predictions:</strong> Calculate your chances of getting 5★ items in upcoming pulls based on your pity and guarantee status.</p>
              <p className="mb-2"><strong>Distribution:</strong> View detailed statistics of your pull history, including 5★ and 4★ pity distributions.</p>
              <p><strong>Rates:</strong> Compare your actual pull rates to the expected probabilities to see if you've been lucky or unlucky.</p>
            </BannerInfoCard>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="predictions" className="flex items-center gap-2">
                  <LineChart size={16} />
                  <span>Pull Predictions</span>
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <BarChart2 size={16} />
                  <span>Pull Distribution</span>
                </TabsTrigger>
                <TabsTrigger value="rates" className="flex items-center gap-2">
                  <PieChart size={16} />
                  <span>Rate Analysis</span>
                </TabsTrigger>
              </TabsList>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                {/* Configuration Panel */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-genshin mb-4">Advanced Prediction Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Banner Type</label>
                        <select 
                          value={currentBanner}
                          onChange={handleBannerChange}
                          className="w-full px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                                   border border-white/10 text-white focus:outline-none
                                   focus:border-purple-500/50"
                        >
                          <option value="character">Character Event Banner</option>
                          <option value="weapon">Weapon Banner</option>
                          <option value="permanent">Standard Banner</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Current Pity</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            max="90"
                            value={currentPity}
                            onChange={(e) => setCurrentPity(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                                     border border-white/10 text-white focus:outline-none
                                     focus:border-purple-500/50"
                          />
                          <div className={`px-3 py-1.5 rounded-lg border text-sm
                                        ${currentPity >= getSoftPity() 
                                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                                          : 'bg-white/5 border-white/10 text-white/60'}`}>
                            {currentPity >= getSoftPity() ? 'Soft Pity' : 'Base Rate'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {currentBanner === 'character' && (
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">Guarantee Status</label>
                          <div className="flex gap-4 mt-1">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name="guarantee"
                                checked={!isGuaranteed}
                                onChange={() => setIsGuaranteed(false)}
                              />
                              <span className="ml-2 text-white/80">50/50 Chance</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name="guarantee"
                                checked={isGuaranteed}
                                onChange={() => setIsGuaranteed(true)}
                              />
                              <span className="ml-2 text-white/80">Guaranteed Featured</span>
                            </label>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Prediction Range</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="90"
                          value={numPulls}
                          onChange={(e) => setNumPulls(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                                   border border-white/10 text-white focus:outline-none
                                   focus:border-purple-500/50"
                        />
                        <span className="text-xs text-white/60 mt-1 block">
                          Predict chances for the next {numPulls} pulls
                        </span>
                      </div>
                      
                      <div className="flex justify-end mt-2 gap-2">
                        <button
                          onClick={handleTrainModel}
                          disabled={isTraining || loading}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r 
                                  from-indigo-500 to-purple-500 hover:from-indigo-600 
                                  hover:to-purple-600 text-white font-medium disabled:opacity-50
                                  disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isTraining ? (
                            <>
                              <Loader className="animate-spin" size={16} />
                              <span>Training ML Model...</span>
                            </>
                          ) : (
                            <>
                              <Brain size={16} />
                              <span>Generate ML Prediction</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleSimplePrediction}
                          disabled={loading || isTraining}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r 
                                  from-blue-500 to-cyan-500 hover:from-blue-600 
                                  hover:to-cyan-600 text-white font-medium disabled:opacity-50
                                  disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin" size={16} />
                              <span>Calculating...</span>
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              <span>Game-Based Calculation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
                    {error}
                  </div>
                )}

                {/* Prediction Results */}
                {predictions && !loading && (
                  <div className="space-y-6">
                    {/* Prediction Mode Indicator */}
                    <div className="flex items-center justify-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${quickMode ? 
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                        {quickMode ? 'Game Mechanics Calculation' : 'Machine Learning Prediction'}
                      </div>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
                      >
                        <div className="text-center">
                          <div className="text-xs text-white/60 mb-1">CURRENT PITY</div>
                          <div className="text-3xl font-genshin">{predictions.summary.current_pity}</div>
                          <div className="text-sm text-white/80 mt-1">
                            {currentBanner === 'character' ? 
                              (predictions.summary.guaranteed ? 'Guaranteed Featured 5★' : '50/50 Chance') :
                              `${getBannerName(predictions.summary.banner_type)}`}
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
                      >
                        <div className="text-center">
                          <div className="text-xs text-white/60 mb-1">50% CHANCE AT</div>
                          <div className="text-3xl font-genshin">
                            {predictions.summary.pull_50pct ?? '—'}
                          </div>
                          <div className="text-sm text-white/80 mt-1">
                            {predictions.summary.pull_50pct ? 
                              `${predictions.summary.pull_50pct - predictions.summary.current_pity} more pulls needed` :
                              'Beyond prediction range'}
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
                      >
                        <div className="text-center">
                          <div className="text-xs text-white/60 mb-1">90% CHANCE AT</div>
                          <div className="text-3xl font-genshin">
                            {predictions.summary.pull_90pct ?? '—'}
                          </div>
                          <div className="text-sm text-white/80 mt-1">
                            {predictions.summary.pull_90pct ? 
                              `${predictions.summary.pull_90pct - predictions.summary.current_pity} more pulls needed` :
                              'Beyond prediction range'}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Enhanced Insights Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6"
                    >
                      <h2 className="text-lg font-genshin mb-4">Prediction Insights</h2>
                      
                      <div className="space-y-3">
                        {predictions.summary.insights ? (
                          predictions.summary.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="rounded-full bg-indigo-500/20 p-1 mt-0.5">
                                <Info size={14} className="text-indigo-400" />
                              </div>
                              <p className="text-white/80">{insight}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/60">No additional insights available.</p>
                        )}
                      </div>
                      
                      {predictions.summary.primogems_50pct && (
                        <div className="mt-4 px-4 py-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                          <div className="flex items-center gap-2">
                            <DiamondIcon className="text-indigo-400" size={20} />
                            <p className="text-indigo-300 font-medium">
                              Estimated primogems needed: {predictions.summary.primogems_50pct} - {predictions.summary.primogems_90pct || "?"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {predictions.summary.confidence_interval > 0 && (
                        <div className="mt-4 flex items-start gap-3">
                          <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                            <AlertCircle size={14} className="text-purple-400" />
                          </div>
                          <p className="text-white/80">
                            {quickMode ? 
                              `There's a confidence interval of approximately ±${predictions.summary.confidence_interval} pulls around these estimates based on game mechanics.` :
                              `The ML model predicts a confidence interval of ±${predictions.summary.confidence_interval} pulls around these estimates based on your pull history.`
                            }
                          </p>
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Chart */}
                    {predictions.chart_image && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-genshin">Prediction Chart</h2>
                          <div className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-sm text-indigo-400">
                            {getBannerName(predictions.summary.banner_type)}
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <img 
                            src={`data:image/png;base64,${predictions.chart_image}`} 
                            alt="Prediction Chart" 
                            className="max-w-full rounded-lg border border-white/10"
                          />
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/60">
                          <div>
                            <p className="flex items-start gap-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                              <span>The <strong>blue bars</strong> show the probability of getting a 5★ on each specific pull.</span>
                            </p>
                            <p className="flex items-start gap-2 mt-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full shrink-0 mt-1"></span>
                              <span>The <strong>green line</strong> shows your cumulative probability of getting a 5★ by that pull number.</span>
                            </p>
                          </div>
                          <div>
                            <p className="flex items-start gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded-full shrink-0 mt-1"></span>
                              <span>The <strong>soft pity zone</strong> (starts at {getSoftPity()}) is where your 5★ chances increase significantly.</span>
                            </p>
                            <p className="flex items-start gap-2 mt-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full shrink-0 mt-1"></span>
                              <span>The <strong>hard pity</strong> ({getHardPity()}) guarantees a 5★ item.</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-6">
                {/* 5★ Pity Distribution */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-genshin mb-4">5★ Pity Distribution</h2>
                  <p className="text-sm text-white/60 mb-4">
                    This chart shows how many pulls it took to get your 5★ items. Higher bars indicate more frequent pity values.
                  </p>
                  
                  <DistributionChart 
                    data={analyticsData.pullDistribution.fiveStars} 
                    type="5★"
                    color="#FFB938"
                  />
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Average 5★ Pity</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fiveStars.length > 0 
                          ? (
                              analyticsData.pullDistribution.fiveStars.reduce(
                                (sum, item) => sum + (item.pity * item.count), 0
                              ) / 
                              analyticsData.pullDistribution.fiveStars.reduce(
                                (sum, item) => sum + item.count, 0
                              )
                            ).toFixed(1) 
                          : '0'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Most Common Pity</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fiveStars.length > 0 
                          ? analyticsData.pullDistribution.fiveStars.reduce(
                              (max, item) => item.count > max.count ? item : max, 
                              analyticsData.pullDistribution.fiveStars[0]
                            ).pity 
                          : '0'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Total 5★ Pulls</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fiveStars.reduce(
                          (sum, item) => sum + item.count, 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 4★ Pity Distribution */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-genshin mb-4">4★ Pity Distribution</h2>
                  <p className="text-sm text-white/60 mb-4">
                    This chart shows how many pulls it took to get your 4★ items. The guaranteed 4★ is at pity 10.
                  </p>
                  
                  <DistributionChart 
                    data={analyticsData.pullDistribution.fourStars} 
                    type="4★"
                    color="#A480CF"
                  />
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Average 4★ Pity</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fourStars.length > 0 
                          ? (
                              analyticsData.pullDistribution.fourStars.reduce(
                                (sum, item) => sum + (item.pity * item.count), 0
                              ) / 
                              analyticsData.pullDistribution.fourStars.reduce(
                                (sum, item) => sum + item.count, 0
                              )
                            ).toFixed(1) 
                          : '0'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Most Common Pity</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fourStars.length > 0 
                          ? analyticsData.pullDistribution.fourStars.reduce(
                              (max, item) => item.count > max.count ? item : max, 
                              analyticsData.pullDistribution.fourStars[0]
                            ).pity 
                          : '0'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                      <p className="text-xs text-white/60">Total 4★ Pulls</p>
                      <p className="text-xl font-genshin mt-1">
                        {analyticsData.pullDistribution.fourStars.reduce(
                          (sum, item) => sum + item.count, 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Rates Tab */}
              <TabsContent value="rates" className="space-y-6">
                {/* Rate Comparison Card */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-genshin mb-4">Pull Rates Comparison</h2>
                  <p className="text-sm text-white/60 mb-4">
                    Compare your actual pull rates with the expected probabilities from the game.
                  </p>
                  
                  <RateComparisonChart data={analyticsData.rateComparison} />
                  
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-2">Your 5★ Rate</h3>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-genshin">
                          {(analyticsData.rateComparison.actual.fiveStar * 100).toFixed(2)}%
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs ${
                          analyticsData.rateComparison.actual.fiveStar > analyticsData.rateComparison.expected.fiveStar
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {analyticsData.rateComparison.actual.fiveStar > analyticsData.rateComparison.expected.fiveStar
                            ? `${((analyticsData.rateComparison.actual.fiveStar / analyticsData.rateComparison.expected.fiveStar - 1) * 100).toFixed(1)}% better`
                            : `${((1 - analyticsData.rateComparison.actual.fiveStar / analyticsData.rateComparison.expected.fiveStar) * 100).toFixed(1)}% worse`
                          }
                        </div>
                        <div className="text-xs text-white/60">
                          (Expected: {(analyticsData.rateComparison.expected.fiveStar * 100).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-2">Your 4★ Rate</h3>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-genshin">
                          {(analyticsData.rateComparison.actual.fourStar * 100).toFixed(2)}%
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs ${
                          analyticsData.rateComparison.actual.fourStar > analyticsData.rateComparison.expected.fourStar
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {analyticsData.rateComparison.actual.fourStar > analyticsData.rateComparison.expected.fourStar
                            ? `${((analyticsData.rateComparison.actual.fourStar / analyticsData.rateComparison.expected.fourStar - 1) * 100).toFixed(1)}% better`
                            : `${((1 - analyticsData.rateComparison.actual.fourStar / analyticsData.rateComparison.expected.fourStar) * 100).toFixed(1)}% worse`
                          }
                        </div>
                        <div className="text-xs text-white/60">
                          (Expected: {(analyticsData.rateComparison.expected.fourStar * 100).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Banner Distribution */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-genshin mb-4">Wish Distribution by Banner</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BannerDistributionChart data={analyticsData.bannerDistribution} />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white/80">Pull Summary</h3>
                      
                      <div className="space-y-2">
                        {analyticsData.bannerDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10">
                            <div>
                              <p className="text-sm font-medium">{item.type}</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-white">{item.count}</span>
                              <span className="text-white/60 ml-2">({(item.percentage * 100).toFixed(1)}%)</span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <div>
                            <p className="text-sm font-medium text-indigo-400">Total Wishes</p>
                          </div>
                          <div className="text-sm font-bold">
                            {analyticsData.bannerDistribution.reduce((sum, item) => sum + item.count, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;