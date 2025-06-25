// src/components/TradingJournal.tsx
'use client';

import React from 'react';

interface TradeEntry {
  id: number;
  time: string;
  action: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price: string;
  amount: string;
  total: string;
  status: string;
  capitalBefore: string;
  riskAmount: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  positionSize: string;
}

interface TradingJournalProps {
  theme: string;
  tradeJournal: TradeEntry[];
  panelBg: string;
  borderColor: string;
}

const TradingJournal: React.FC<TradingJournalProps> = ({
  theme,
  tradeJournal,
  panelBg,
  borderColor,
}) => {
  // Determine text color based on theme for general table content
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`${panelBg} p-4 rounded-xl shadow-lg border ${borderColor} flex flex-col`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Trading Journal</h2>
      <div className="overflow-auto max-h-[400px] flex-grow">
        {tradeJournal.length === 0 ? (
          <p className={`text-center opacity-70 ${textColor}`}>No trades recorded yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} sticky top-0`}>
                <th className={`px-2 py-2 text-left font-semibold rounded-tl-lg ${textColor}`}>Time</th>
                <th className={`px-2 py-2 text-left font-semibold ${textColor}`}>Action</th>
                <th className={`px-2 py-2 text-left font-semibold ${textColor}`}>Type</th>
                <th className={`px-2 py-2 text-left font-semibold ${textColor}`}>Price</th>
                <th className={`px-2 py-2 text-left font-semibold ${textColor}`}>Amount</th>
                <th className={`px-2 py-2 text-left font-semibold rounded-tr-lg ${textColor}`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {tradeJournal.map((trade) => (
                <tr key={trade.id} className="border-t border-gray-600 dark:border-gray-200">
                  {/* Apply textColor to each td */}
                  <td className={`px-2 py-2 whitespace-nowrap ${textColor}`}>{trade.time}</td>
                  <td className={`px-2 py-2 font-medium ${trade.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{trade.action.toUpperCase()}</td>
                  <td className={`px-2 py-2 ${textColor}`}>{trade.orderType.toUpperCase()}</td>
                  <td className={`px-2 py-2 ${textColor}`}>${trade.price}</td>
                  <td className={`px-2 py-2 ${textColor}`}>{trade.amount}</td>
                  <td className={`px-2 py-2 ${textColor}`}>${trade.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TradingJournal;
