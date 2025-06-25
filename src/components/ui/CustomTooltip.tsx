// src/components/CustomTooltip.tsx
import React from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

/**
 * Custom Tooltip component for Recharts.
 * Displays time and price information.
 */
const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Extracting the value from the first payload item, assuming it's the price
    const priceValue = payload[0].value as number;
    return (
      <div className="p-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-md shadow-lg text-xs">
        <p className="font-bold">{`Time: ${label}`}</p>
        <p>{`Price: $${priceValue.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
