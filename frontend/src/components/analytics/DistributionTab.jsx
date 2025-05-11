import React from 'react';
import DistributionChart from './DistributionChart';

const DistributionTab = ({ analyticsData }) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default DistributionTab; 