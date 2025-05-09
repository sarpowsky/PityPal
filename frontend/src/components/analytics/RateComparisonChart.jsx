// Path: frontend/src/components/analytics/RateComparisonChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Calculate the difference between actual and expected rates
    const actual = payload.find(p => p.name === "Your Rate");
    const expected = payload.find(p => p.name === "Expected Rate");
    
    let difference = 0;
    let percentDiff = 0;
    let isPositive = false;
    
    if (actual && expected) {
      difference = (actual.value - expected.value) * 100; // Convert to percentage
      percentDiff = Math.abs((actual.value / expected.value - 1) * 100);
      isPositive = actual.value > expected.value;
    }
    
    return (
      <div className="p-3 rounded-lg bg-black/90 border border-white/30 shadow-lg">
        <p className="text-sm font-semibold text-white mb-2">{`${label}`}</p>
        
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontWeight: entry.name === "Your Rate" ? "bold" : "normal" }}>
            {`${entry.name}: ${(entry.value * 100).toFixed(2)}%`}
          </p>
        ))}
        
        <div className={`mt-2 pt-2 border-t border-white/20 ${isPositive ? "text-green-400" : "text-red-400"}`}>
          <p className="text-xs font-medium">
            {isPositive 
              ? `${percentDiff.toFixed(1)}% better than expected` 
              : `${percentDiff.toFixed(1)}% worse than expected`}
          </p>
          <p className="text-xs text-white/70 mt-1">
            {`${Math.abs(difference).toFixed(2)}% ${isPositive ? "higher" : "lower"} than expected rate`}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom label for displaying percentage values on bars
const CustomizedLabel = (props) => {
  const { x, y, width, height, value } = props;
  const percentage = (value * 100).toFixed(1);
  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#fff" 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontWeight="bold"
      fontSize="12"
      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${percentage}%`}
    </text>
  );
};

// Custom bar that provides visual feedback on performance vs. expected rate
const CustomBar = (props) => {
  const { x, y, width, height, expectedRate, actualRate, isExpected } = props;
  
  // If this is an expected rate bar, just render normally
  if (isExpected) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#82ca9d"
        opacity={0.7}
        rx={4}
        ry={4}
      />
    );
  }
  
  // For actual rate, show visual indicator of performance
  const isPositive = actualRate > expectedRate;
  const performanceColor = isPositive ? "#4ADE80" : "#F87171"; // Green for better, red for worse
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={performanceColor}
      opacity={0.9}
      rx={4}
      ry={4}
      stroke="#fff"
      strokeWidth={0.5}
      strokeOpacity={0.2}
    />
  );
};

const RateComparisonChart = ({ data }) => {
  if (!data || !data.actual) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }
  
  // Create enhanced chart data with calculated differences
  const chartData = [
    {
      name: '5★ Rate',
      actual: data.actual.fiveStar,
      expected: data.expected.fiveStar,
      difference: data.actual.fiveStar - data.expected.fiveStar,
      percentDiff: (data.actual.fiveStar / data.expected.fiveStar - 1) * 100
    },
    {
      name: '4★ Rate',
      actual: data.actual.fourStar,
      expected: data.expected.fourStar,
      difference: data.actual.fourStar - data.expected.fourStar,
      percentDiff: (data.actual.fourStar / data.expected.fourStar - 1) * 100
    }
  ];
  
  // Calculate max value to set Y-axis domain properly
  const maxValue = Math.max(
    data.actual.fiveStar,
    data.expected.fiveStar,
    data.actual.fourStar,
    data.expected.fourStar
  ) * 1.2; // Add 20% margin
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barGap={4}
          barCategoryGap={40}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            domain={[0, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          
          {/* Expected Rate Bars */}
          <Bar 
            dataKey="expected" 
            name="Expected Rate" 
            radius={[4, 4, 0, 0]} 
            barSize={22}
            shape={(props) => (
              <CustomBar 
                {...props} 
                isExpected={true}
              />
            )}
          >
            <LabelList
              dataKey="expected"
              position="center"
              content={<CustomizedLabel />}
            />
          </Bar>
          
          {/* Actual Rate Bars */}
          <Bar 
            dataKey="actual" 
            name="Your Rate" 
            radius={[4, 4, 0, 0]} 
            barSize={22}
            shape={(props) => (
              <CustomBar 
                {...props} 
                expectedRate={props.payload.expected}
                actualRate={props.payload.actual}
                isExpected={false}
              />
            )}
          >
            <LabelList
              dataKey="actual"
              position="center"
              content={<CustomizedLabel />}
            />
            {/* Custom coloring based on comparison to expected rate */}
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.difference >= 0 ? "#4ADE80" : "#F87171"} 
              />
            ))}
          </Bar>

          {/* Add reference line at zero */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RateComparisonChart;