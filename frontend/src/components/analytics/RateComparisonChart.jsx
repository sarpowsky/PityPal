// Path: frontend/src/components/analytics/RateComparisonChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 rounded-lg bg-black/80 border border-white/20 text-xs">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${(entry.value * 100).toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RateComparisonChart = ({ data }) => {
  if (!data || !data.actual) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }
  
  const chartData = [
    {
      name: '5★ Rate',
      actual: data.actual.fiveStar,
      expected: data.expected.fiveStar,
      difference: data.actual.fiveStar - data.expected.fiveStar
    },
    {
      name: '4★ Rate',
      actual: data.actual.fourStar,
      expected: data.expected.fourStar,
      difference: data.actual.fourStar - data.expected.fourStar
    }
  ];
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="actual" name="Your Rate" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="expected" name="Expected Rate" fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={30} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RateComparisonChart;