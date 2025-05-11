import React from 'react';
import { Loader, Brain, Zap } from 'lucide-react';

const PredictionForm = ({ 
  currentBanner, 
  handleBannerChange, 
  currentPity, 
  setCurrentPity, 
  isGuaranteed, 
  setIsGuaranteed, 
  numPulls, 
  setNumPulls, 
  handleTrainModel, 
  handleSimplePrediction,
  isTraining,
  loading,
  getSoftPity
}) => {
  return (
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
  );
};

export default PredictionForm; 