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
  orderId?: string;
  outcome?: 'hit_stop_loss' | 'hit_take_profit' | 'open' | 'closed';
  profitLoss?: string;
}

interface TradingJournalProps {
  theme: string;
  tradeJournal: TradeEntry[];
}

const TradingJournal: React.FC<TradingJournalProps> = React.memo(({ theme, tradeJournal }) => {
  console.log('TradingJournal re-rendered. Props:', {
    theme,
    tradeJournalLength: Array.isArray(tradeJournal) ? tradeJournal.length : 'Not an array',
    tradeJournalType: typeof tradeJournal,
  });

  const panelClasses = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col`;

  const exportToCSV = () => {
    const headers = [
      'Time',
      'Symbol',
      'Action',
      'Type',
      'Price',
      'Amount',
      'Total',
      'Status',
      'Order ID',
      'Outcome',
      'Profit/Loss',
      'Capital Before',
      'Risk Amount',
      'Stop-Loss Price',
      'Take-Profit Price',
      'Position Size',
    ];
    const rows = tradeJournal.map((trade) => [
      `"${trade.time}"`,
      trade.symbol,
      trade.action.toUpperCase(),
      trade.orderType.toUpperCase(),
      trade.price,
      trade.amount,
      trade.total,
      trade.status,
      trade.orderId || 'N/A',
      trade.outcome || 'Open',
      trade.profitLoss || '0.00',
      trade.capitalBefore,
      trade.riskAmount,
      trade.stopLossPrice,
      trade.takeProfitPrice,
      trade.positionSize,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Trading Journal</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          onClick={exportToCSV}
          disabled={!Array.isArray(tradeJournal) || tradeJournal.length === 0}
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-auto max-h-[400px] flex-grow">
        {!Array.isArray(tradeJournal) ? (
          <p className="text-center opacity-70 text-gray-900 dark:text-gray-100">
            Error: Trade journal data is invalid. Please try again.
          </p>
        ) : tradeJournal.length === 0 ? (
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
                <th className="px-2 py-2 text-left font-semibold">Total</th>
                <th className="px-2 py-2 text-left font-semibold">Status</th>
                <th className="px-2 py-2 text-left font-semibold">Order ID</th>
                <th className="px-2 py-2 text-left font-semibold">Outcome</th>
                <th className="px-2 py-2 text-left font-semibold rounded-tr-lg">P/L ($)</th>
              </tr>
            </thead>
            <tbody>
              {tradeJournal.map((trade) => (
                <tr key={trade.id} className="border-t border-gray-600 dark:border-gray-200">
                  <td className="px-2 py-2 whitespace-nowrap">{trade.time}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{trade.symbol}</td>
                  <td className={`px-2 py-2 font-medium ${trade.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.action.toUpperCase()}
                  </td>
                  <td className="px-2 py-2">{trade.orderType.toUpperCase()}</td>
                  <td className="px-2 py-2">${trade.price}</td>
                  <td className="px-2 py-2">{trade.amount}</td>
                  <td className="px-2 py-2">${trade.total}</td>
                  <td className="px-2 py-2">{trade.status}</td>
                  <td className="px-2 py-2">{trade.orderId || 'N/A'}</td>
                  <td className="px-2 py-2">{trade.outcome || 'Open'}</td>
                  <td className="px-2 py-2">{trade.profitLoss || '0.00'}</td>
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