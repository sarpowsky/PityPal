import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, BarChart2, Info, HelpCircle, Loader, BrainCircuit } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const BannerInfoCard = ({ title, children }) => (
  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2">
    <Info className="text-indigo-400 mt-0.5 shrink-0" size={16} />
    <div>
      <h3 className="text-sm font-medium text-indigo-400 mb-1">{title}</h3>
      <div className="text-xs text-white/70">{children}</div>
    </div>
  </div>
);

const Analytics = () => {
  const { state } = useApp();
  const { showNotification } = useNotification();
  const [currentBanner, setCurrentBanner] = useState('character-1');
  const [currentPity, setCurrentPity] = useState(0);
  const [isGuaranteed, setIsGuaranteed] = useState(false);
  const [numPulls, setNumPulls] = useState(40);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(true);

  // Update current pity when state.wishes.pity changes
  useEffect(() => {
    if (state.wishes?.pity) {
      if (currentBanner.startsWith('character') && state.wishes.pity.character) {
        setCurrentPity(state.wishes.pity.character.current || 0);
        setIsGuaranteed(state.wishes.pity.character.guaranteed || false);
      } else if (currentBanner === 'weapon' && state.wishes.pity.weapon) {
        setCurrentPity(state.wishes.pity.weapon.current || 0);
        setIsGuaranteed(state.wishes.pity.weapon.guaranteed || false);
      }
    }
  }, [state.wishes?.pity, currentBanner]);

  const [isTraining, setIsTraining] = useState(false);

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

  const getSoftPity = () => {
    return currentBanner.includes('weapon') ? 63 : 74;
  };

  const getHardPity = () => {
    return currentBanner.includes('weapon') ? 80 : 90;
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
      case 'character-1': return 'Character Event';
      case 'character-2': return 'Character Event (2nd Banner)';
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
              Predict your chances of getting a 5★ in upcoming wishes
            </p>
          </div>
          <button 
            onClick={() => setShowInfoCard(!showInfoCard)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <HelpCircle size={20} className="text-white/60" />
          </button>
        </header>

        {showInfoCard && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BannerInfoCard title="About Wish Predictions">
              <p className="mb-2">This tool uses historical wish data to predict your chances of getting a 5★ character or weapon in future pulls.</p>
              <p className="mb-2"><strong>Soft Pity</strong> begins at pull 74 for character banners and 63 for weapon banners, significantly increasing your chances.</p>
              <p className="mb-2"><strong>Hard Pity</strong> guarantees a 5★ at pull 90 for character banners and 80 for weapon banners.</p>
              <p><strong>Train Model:</strong> Create a personalized prediction model based on your wish history for more accurate results.</p>
            </BannerInfoCard>
          </motion.div>
        )}

        {/* Configuration Panel */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-genshin mb-4">Prediction Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Banner Type</label>
                <select 
                  value={currentBanner}
                  onChange={(e) => setCurrentBanner(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                           border border-white/10 text-white focus:outline-none
                           focus:border-purple-500/50"
                >
                  <option value="character-1">Character Event Banner</option>
                  <option value="character-2">Character Event Banner 2</option>
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
              {currentBanner.startsWith('character') && (
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
                           from-blue-500 to-cyan-500 hover:from-blue-600 
                           hover:to-cyan-600 text-white font-medium disabled:opacity-50
                           disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isTraining ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Training...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={16} />
                      <span>Train Model</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePrediction}
                  disabled={loading || isTraining}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r 
                           from-indigo-500 to-purple-500 hover:from-indigo-600 
                           hover:to-purple-600 text-white font-medium disabled:opacity-50
                           disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <span>Generate Prediction</span>
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

        {/* Results */}
        {predictions && !loading && (
          <div className="space-y-6">
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
                    {predictions.summary.guaranteed ? 'Guaranteed Featured 5★' : '50/50 Chance'}
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
            
            {/* Chart */}
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
              
              {predictions.chart_image && (
                <div className="flex justify-center">
                  <img 
                    src={`data:image/png;base64,${predictions.chart_image}`} 
                    alt="Prediction Chart" 
                    className="max-w-full rounded-lg border border-white/10"
                  />
                </div>
              )}
              
              <div className="mt-4 text-sm text-white/60">
                <p className="flex items-start gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                  <span>The <strong>blue bars</strong> show the probability of getting a 5★ on each specific pull.</span>
                </p>
                <p className="flex items-start gap-2 mt-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full shrink-0 mt-1"></span>
                  <span>The <strong>green line</strong> shows your cumulative probability of getting a 5★ by that pull number.</span>
                </p>
              </div>
            </motion.div>
            
            {/* Detailed prediction table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-genshin">Detailed Predictions</h2>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-xs text-white/80">Probability per Pull</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-white/80">Cumulative Probability</span>
                  </div>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto pr-2">
                <table className="w-full">
                  <thead className="text-white/60 text-xs uppercase">
                    <tr>
                      <th className="py-2 text-left">Pity</th>
                      <th className="py-2 text-left">Pull Probability</th>
                      <th className="py-2 text-left">Cumulative Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.predictions.map((pred) => (
                      <tr key={pred.pull} className="border-t border-white/10">
                        <td className="py-2 flex items-center gap-2">
                          <span className={getColorForPull(pred.pull)}>{pred.pull}</span>
                          {pred.pull === getSoftPity() && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                              Soft Pity
                            </span>
                          )}
                          {pred.pull === getHardPity() && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                              Hard Pity
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{width: `${Math.min(pred.probability * 100, 100)}%`}}
                            ></div>
                            <span className="text-sm">{(pred.probability * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${Math.min(pred.cumulative * 100, 100)}%`}}
                            ></div>
                            <span className="text-sm">{(pred.cumulative * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;