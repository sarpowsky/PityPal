// Path: frontend/src/components/analytics/BannerDistributionChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';

// Enhanced color palette with better visual distinction and more vibrant colors
const COLORS = [
  '#9c7cf4', // Vibrant Purple for Character
  '#5b9eff', // Bright Blue for Character-2
  '#50e3c2', // Teal for Weapon
  '#7cfc00', // Bright Green for Permanent
  '#ffcd3c', // Golden Yellow for Chronicled
];

// Define banner type display names
const BANNER_NAMES = {
  'character-1': 'Character Event',
  'character-2': 'Character Event 2',
  'character': 'Character Event',
  'weapon': 'Weapon Banner',
  'permanent': 'Standard Banner',
  'chronicled': 'Chronicled Wish'
};

// Custom tooltip with more detailed information
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayName = BANNER_NAMES[data.type] || data.type;
    
    return (
      <div className="p-3 rounded-lg bg-black/80 border border-white/30 shadow-lg">
        <p className="text-sm font-semibold text-white mb-1">{displayName}</p>
        <p className="text-base font-bold" style={{ color: payload[0].color }}>
          {`${data.count} wishes`}
        </p>
        <p className="text-sm text-white/80 mt-1">
          {`${(data.percentage * 100).toFixed(1)}% of total pulls`}
        </p>
      </div>
    );
  }
  return null;
};

// Custom active shape for enhanced visual feedback when hovering (without text)
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      {/* Enhanced inner sector with glow effect */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
        stroke={fill}
        strokeWidth={2}
      />
      {/* Outer ring for better highlighting */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.7}
      />
    </g>
  );
};

// Custom legend with more readable format
const CustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-col gap-1.5">
      {payload.map((entry, index) => {
        const displayName = BANNER_NAMES[entry.payload.type] || entry.payload.type;
        return (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: entry.color }}
              // Add subtle glow effect to legend dots
            />
            <span className="text-sm text-white/80">
              {`${displayName} (${(entry.payload.percentage * 100).toFixed(1)}%)`}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const BannerDistributionChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }
  
  // Process data to use proper display names
  const processedData = data.map(item => ({
    ...item,
    displayName: BANNER_NAMES[item.type] || item.type
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={45}  // Increased inner radius for more pronounced donut
            outerRadius={75}  // Increased outer radius for larger pie
            paddingAngle={4}  // Slightly increased padding angle for better segment separation
            dataKey="count"
            nameKey="type"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={800}  // Longer animation for smoother effect
            animationBegin={0}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="rgba(255,255,255,0.15)"  // Lighter stroke for better contrast
                strokeWidth={2}  // Thicker stroke for more defined segments
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BannerDistributionChart;