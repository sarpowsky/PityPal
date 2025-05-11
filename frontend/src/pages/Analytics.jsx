// Path: frontend/src/pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, BarChart2, PieChart } from 'lucide-react';

// Import analytics components
import PredictionsTab from '../components/analytics/PredictionsTab';
import DistributionTab from '../components/analytics/DistributionTab';
import RatesTab from '../components/analytics/RatesTab';

// Import analytics services
import { 
  calculatePullDistribution,
  calculateRateComparison,
  calculateBannerTypeDistribution,
  calculateItemTypeDistribution
} from '../services/analyticsService';

// Define BannerInfoCard component inline to fix import issues
const BannerInfoCard = ({ title, children }) => (
  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2">
    <Icon name="info" className="text-indigo-400 mt-0.5 shrink-0" size={16} />
    <div>
      <h3 className="text-sm font-medium text-indigo-400 mb-1">{title}</h3>
      <div className="text-xs text-white/70">{children}</div>
    </div>
  </div>
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
              <TabsContent value="predictions">
                <PredictionsTab 
                  currentBanner={currentBanner}
                  handleBannerChange={handleBannerChange}
                  currentPity={currentPity}
                  setCurrentPity={setCurrentPity}
                  isGuaranteed={isGuaranteed}
                  setIsGuaranteed={setIsGuaranteed}
                  numPulls={numPulls}
                  setNumPulls={setNumPulls}
                  handleTrainModel={handleTrainModel}
                  handleSimplePrediction={handleSimplePrediction}
                  isTraining={isTraining}
                  loading={loading}
                  error={error}
                  predictions={predictions}
                  quickMode={quickMode}
                  getSoftPity={getSoftPity}
                  getHardPity={getHardPity}
                  getBannerName={getBannerName}
                />
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution">
                <DistributionTab analyticsData={analyticsData} />
              </TabsContent>

              {/* Rates Tab */}
              <TabsContent value="rates">
                <RatesTab analyticsData={analyticsData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;