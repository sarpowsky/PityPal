// Path: frontend/src/components/analytics/DistributionChart.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 rounded-lg bg-black/80 border border-white/20 text-xs">
        <p className="font-medium">{`Pity: ${label}`}</p>
        <p className="text-amber-400">{`Count: ${payload[0].value}`}</p>
        <p className="text-xs text-white/60">{`${payload[0].value} pulls at pity ${label}`}</p>
      </div>
    );
  }
  return null;
};

const DistributionChart = ({ data, type = '5★', color = '#FFB938' }) => {
  // Fill in missing pity values for a complete chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const maxPity = Math.max(...data.map(d => d.pity));
    const filledData = [];
    
    // Create array with all pity values
    for (let i = 1; i <= maxPity; i++) {
      const existing = data.find(d => d.pity === i);
      filledData.push({
        pity: i,
        count: existing ? existing.count : 0
      });
    }
    
    return filledData;
  }, [data]);
  
  // Calculate the soft pity threshold for visual indicators
  const softPity = type === '5★' ? 74 : 8;
  
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="pity" 
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="count" 
            name={`${type} Count`} 
            fill={color}
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
          {/* Soft Pity Indicator */}
          <Bar 
            dataKey={() => 0} // Invisible reference line
            name="Soft Pity"
            stroke="rgba(147, 51, 234, 0.7)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
            legendType="line"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;