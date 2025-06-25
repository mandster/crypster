// src/components/RiskManagement.tsx
'use client';

import React from 'react';

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
  panelBg: string;
  borderColor: string;
  inputBg: string;
  textColor: string;
}

const RiskManagement: React.FC<RiskManagementProps> = ({
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
  panelBg,
  borderColor,
  inputBg,
  textColor,
}) => {
  return (
    <div className={`${panelBg} p-4 rounded-xl shadow-lg border ${borderColor} flex flex-col`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Risk Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="capital" className="block text-sm font-medium mb-1">
            Simulated Capital ($)
          </label>
          <input
            type="number"
            id="capital"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
            className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="riskPct" className="block text-sm font-medium mb-1">
            Risk per Trade (%)
          </label>
          <input
            type="number"
            id="riskPct"
            value={riskPerTradePct}
            onChange={(e) => setRiskPerTradePct(parseFloat(e.target.value) || 0)}
            className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="stopLossPct" className="block text-sm font-medium mb-1">
            Stop Loss (%)
          </label>
          <input
            type="number"
            id="stopLossPct"
            value={stopLossPct}
            onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 0)}
            className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="takeProfitPct" className="block text-sm font-medium mb-1">
            Take Profit (%)
          </label>
          <input
            type="number"
            id="takeProfitPct"
            value={takeProfitPct}
            onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 0)}
            className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="space-y-3 mt-auto">
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
};

export default RiskManagement;
