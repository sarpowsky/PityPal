// Path: frontend/src/components/analytics/BannerDistributionChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';

// Enhanced color palette with better visual distinction
const COLORS = [
  '#8884d8', // Purple for Character
  '#83a6ed', // Blue for Character-2
  '#8dd1e1', // Teal for Weapon
  '#a4de6c', // Green for Permanent
  '#ffc658', // Yellow/Gold for Chronicled
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

// Custom active shape for enhanced visual feedback when hovering
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const displayName = BANNER_NAMES[payload.type] || payload.type;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text 
        x={cx} 
        y={cy - 5} 
        dy={8} 
        textAnchor="middle" 
        fill="#fff"
        style={{ fontWeight: 'bold', fontSize: '14px' }}
      >
        {displayName}
      </text>
      <text 
        x={cx} 
        y={cy + 15} 
        dy={8} 
        textAnchor="middle" 
        fill="#fff"
        style={{ fontSize: '12px' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
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
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
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
            innerRadius={40}
            outerRadius={70}
            paddingAngle={3}
            dataKey="count"
            nameKey="type"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={500}
            animationBegin={0}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
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