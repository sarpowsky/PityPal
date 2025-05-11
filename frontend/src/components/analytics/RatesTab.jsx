import React from 'react';
import RateComparisonChart from './RateComparisonChart';
import BannerDistributionChart from './BannerDistributionChart';

const RatesTab = ({ analyticsData }) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default RatesTab; 