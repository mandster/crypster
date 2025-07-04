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
  symbol: string;
}

interface TradingJournalProps {
  theme: string;
  tradeJournal: TradeEntry[];
}

const TradingJournal: React.FC<TradingJournalProps> = React.memo(({
  theme,
  tradeJournal,
}) => {
  // Detailed diagnostic log:
  console.log('TradingJournal re-rendered. Props:', {
    theme: theme,
    tradeJournalLength: tradeJournal.length, // Log length to see if array content changes
    // Add these if you suspect issues with object identity for the array itself:
    // tradeJournalReference: tradeJournal,
  });

  const panelClasses = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col`;

  return (
    <div className={panelClasses}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Trading Journal</h2>
      <div className="overflow-auto max-h-[400px] flex-grow">
        {tradeJournal.length === 0 ? (
          <p className="text-center opacity-70 text-gray-900 dark:text-gray-100">No trades recorded yet.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-900 dark:text-gray-100">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} sticky top-0`}>
                <th className="px-2 py-2 text-left font-semibold rounded-tl-lg">Time</th>
                <th className="px-2 py-2 text-left font-semibold">Symbol</th>
                <th className="px-2 py-2 text-left font-semibold">Action</th>
                <th className="px-2 py-2 text-left font-semibold">Type</th>
                <th className="px-2 py-2 text-left font-semibold">Price</th>
                <th className="px-2 py-2 text-left font-semibold">Amount</th>
                <th className="px-2 py-2 text-left font-semibold rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {tradeJournal.map((trade) => (
                <tr key={trade.id} className="border-t border-gray-600 dark:border-gray-200">
                  <td className="px-2 py-2 whitespace-nowrap">{trade.time}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{trade.symbol}</td>
                  <td className={`px-2 py-2 font-medium ${trade.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{trade.action.toUpperCase()}</td>
                  <td className="px-2 py-2">{trade.orderType.toUpperCase()}</td>
                  <td className="px-2 py-2">${trade.price}</td>
                  <td className="px-2 py-2">{trade.amount}</td>
                  <td className="px-2 py-2">${trade.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

export default TradingJournal;
