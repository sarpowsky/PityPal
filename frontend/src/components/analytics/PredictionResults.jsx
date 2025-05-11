import React from 'react';
import { motion } from 'framer-motion';
import { Info, AlertCircle } from 'lucide-react';

// Inline DiamondIcon component instead of importing it
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

const PredictionResults = ({ 
  predictions, 
  quickMode, 
  getBannerName,
  getSoftPity,
  getHardPity
}) => {
  if (!predictions) return null;

  return (
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
              {predictions.summary.banner_type === 'character' ? 
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
  );
};

export default PredictionResults; 