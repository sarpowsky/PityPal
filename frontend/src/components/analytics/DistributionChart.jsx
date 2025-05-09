// Path: frontend/src/components/analytics/DistributionChart.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Rectangle } from 'recharts';

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg bg-black/90 border border-white/30 shadow-lg">
        <p className="text-sm font-semibold text-white mb-1">{`Pity: ${label}`}</p>
        <p className="text-amber-400 font-bold">{`Count: ${payload[0].value}`}</p>
        <p className="text-xs text-white/70 mt-1">{`${payload[0].value} pulls at pity ${label}`}</p>
      </div>
    );
  }
  return null;
};

// Custom bar shape component to create more visually appealing bars
const CustomBar = (props) => {
  const { x, y, width, height, fill, pity, softPity, hardPity } = props;
  
  // Determine the color based on pity values
  let barFill = fill;
  if (pity >= hardPity) {
    barFill = '#E15759'; // Red for hard pity
  } else if (pity >= softPity) {
    // Gradient from purple to red based on proximity to hard pity
    const progress = (pity - softPity) / (hardPity - softPity);
    const color1 = [168, 128, 207]; // #A880CF (purple)
    const color2 = [225, 87, 89]; // #E15759 (red)
    
    const r = Math.floor(color1[0] + progress * (color2[0] - color1[0]));
    const g = Math.floor(color1[1] + progress * (color2[1] - color1[1]));
    const b = Math.floor(color1[2] + progress * (color2[2] - color1[2]));
    
    barFill = `rgb(${r}, ${g}, ${b})`;
  }
  
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={barFill}
      radius={[4, 4, 0, 0]}
      opacity={0.85}
      stroke="#fff"
      strokeWidth={0.5}
      strokeOpacity={0.2}
    />
  );
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
  const hardPity = type === '5★' ? 90 : 10;
  
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }
  
  // Calculate the maximum count for proper Y-axis scaling
  const maxCount = Math.max(...processedData.map(d => d.count));
  
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
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Add background shading for different pity zones */}
          <defs>
            <linearGradient id="softPityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(168, 128, 207, 0.25)" />
              <stop offset="95%" stopColor="rgba(168, 128, 207, 0.1)" />
            </linearGradient>
          </defs>
          
          {/* Base Rate Zone */}
          <rect 
            x="0%" 
            width={`${(softPity - 1) / hardPity * 100}%`} 
            y="0" 
            height="100%" 
            fill="rgba(78, 121, 167, 0.1)" 
            fillOpacity={0.3}
          />
          
          {/* Soft Pity Zone */}
          <rect 
            x={`${(softPity - 1) / hardPity * 100}%`} 
            width={`${(hardPity - softPity) / hardPity * 100}%`} 
            y="0" 
            height="100%" 
            fill="url(#softPityGradient)" 
            fillOpacity={0.6}
          />
          
          {/* Reference lines for pity thresholds */}
          <ReferenceLine 
            x={softPity} 
            stroke="rgba(147, 51, 234, 0.7)" 
            label={{ 
              value: type === '5★' ? 'Soft Pity' : 'Guarantee', 
              position: 'insideTopRight',
              fill: '#a855f7',
              fontSize: 12
            }} 
            strokeDasharray="3 3" 
            strokeWidth={2}
          />
          
          {type === '5★' && (
            <ReferenceLine 
              x={hardPity} 
              stroke="rgba(225, 87, 89, 0.7)" 
              label={{ 
                value: 'Hard Pity', 
                position: 'insideTopRight',
                fill: '#ef4444',
                fontSize: 12
              }} 
              strokeDasharray="3 3" 
              strokeWidth={2}
            />
          )}
          
          <Bar 
            dataKey="count" 
            name={`${type} Count`} 
            fill={color}
            shape={(props) => (
              <CustomBar 
                {...props} 
                pity={props.payload.pity} 
                softPity={softPity} 
                hardPity={hardPity}
              />
            )}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;