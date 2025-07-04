// src/components/RiskManagement.tsx
'use client';

import React from 'react'; // Ensure React is imported

interface RiskManagementProps {
  theme: string;
  capital: number;
  setCapital: (capital: number) => void;
  riskPerTradePct: number;
  setRiskPerTradePct: (pct: number) => void;
  stopLossPct: number;
  setStopLossPct: (pct: number) => void;
  takeProfitPct: number;
  setTakeProfitPct: (pct: number) => void;
  riskAmount: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSize: number;
}

const RiskManagement: React.FC<RiskManagementProps> = React.memo(({ // Wrapped in React.memo
  theme,
  capital,
  setCapital,
  riskPerTradePct,
  setRiskPerTradePct,
  stopLossPct,
  setStopLossPct,
  takeProfitPct,
  setTakeProfitPct,
  riskAmount,
  stopLossPrice,
  takeProfitPrice,
  positionSize,
}) => {
  console.log('RiskManagement re-rendered'); // Diagnostic Log
  const panelClasses = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col`;
  const inputClasses = `w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className={panelClasses}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="capital" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Simulated Capital ($)
          </label>
          <input
            type="number"
            id="capital"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="riskPct" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Risk per Trade (%)
          </label>
          <input
            type="number"
            id="riskPct"
            value={riskPerTradePct}
            onChange={(e) => setRiskPerTradePct(parseFloat(e.target.value) || 0)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="stopLossPct" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Stop Loss (%)
          </label>
          <input
            type="number"
            id="stopLossPct"
            value={stopLossPct}
            onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 0)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="takeProfitPct" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Take Profit (%)
          </label>
          <input
            type="number"
            id="takeProfitPct"
            value={takeProfitPct}
            onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 0)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="space-y-3 mt-auto text-gray-900 dark:text-gray-100">
        <p className="flex justify-between">
          <span className="font-medium">Risk Amount:</span>
          <span className="font-semibold text-red-400">${riskAmount.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Stop Loss Price:</span>
          <span className="font-semibold text-orange-400">${stopLossPrice.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Take Profit Price:</span>
          <span className="font-semibold text-green-400">${takeProfitPrice.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Calculated Position Size (BTC):</span>
          <span className="font-semibold text-blue-400">{positionSize.toFixed(4)}</span>
        </p>
      </div>
    </div>
  );
});

export default RiskManagement;
