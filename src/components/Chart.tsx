// src/components/Chart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomTooltip from '@/components/ui/CustomTooltip';
import { CandlestickData } from '@/utils/dataGenerators';

interface ChartProps {
  theme: string;
  currentPrice: number;
  candlestickData: CandlestickData[];
  selectedSymbol: string; // New prop for selected symbol
}

const ChartComponent: React.FC<ChartProps> = ({
  theme,
  currentPrice,
  candlestickData,
  selectedSymbol, // Destructure new prop
}) => {
  return (
    <div className={`lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        {/* Use selectedSymbol in the chart title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{selectedSymbol} Chart</h2>
        <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          ${currentPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex-grow h-80 sm:h-96 md:h-[500px] lg:h-[600px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'} />
            <XAxis dataKey="time" stroke={theme === 'dark' ? '#CBD5E0' : '#4A5568'} />
            <YAxis
              domain={['auto', 'auto']}
              orientation="right"
              stroke={theme === 'dark' ? '#CBD5E0' : '#4A5568'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartComponent;
