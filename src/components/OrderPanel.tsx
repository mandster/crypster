// src/components/OrderPanel.tsx
'use client';

import React from 'react';

interface OrderPanelProps {
  theme: string;
  orderType: 'market' | 'limit';
  setOrderType: (type: 'market' | 'limit') => void;
  tradeAction: 'buy' | 'sell';
  setTradeAction: (action: 'buy' | 'sell') => void;
  priceInput: string;
  setPriceInput: (price: string) => void;
  amountInput: string;
  setAmountInput: (amount: string) => void;
  totalCost: number;
  handlePlaceTrade: () => void;
  currentPrice: number;
  buyButtonBg: string;
  sellButtonBg: string;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  theme,
  orderType,
  setOrderType,
  tradeAction,
  setTradeAction,
  priceInput,
  setPriceInput,
  amountInput,
  setAmountInput,
  totalCost,
  handlePlaceTrade,
  currentPrice,
  buyButtonBg,
  sellButtonBg,
}) => {
  const panelClasses = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col`;
  const inputClasses = `w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const defaultButtonBg = 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
  const inactiveButtonClasses = `bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 opacity-70`;

  return (
    <div className={panelClasses}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Place Order</h2>

      <div className="flex mb-4 space-x-2">
        {['buy', 'sell'].map((action) => (
          <button
            key={action}
            onClick={() => setTradeAction(action as 'buy' | 'sell')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200
              ${tradeAction === action ? (action === 'buy' ? buyButtonBg : sellButtonBg) : inactiveButtonClasses}
              ${tradeAction === action ? 'text-white' : ''}`}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex mb-4 space-x-2">
        {['market', 'limit'].map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type as 'market' | 'limit')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200
              ${orderType === type ? defaultButtonBg : inactiveButtonClasses}
              ${orderType === type ? 'text-white' : ''}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {orderType === 'limit' && (
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Limit Price (USDT)
          </label>
          <input
            type="number"
            id="price"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="Enter price"
            className={inputClasses}
          />
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          Amount (BTC)
        </label>
        <input
          type="number"
          id="amount"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="Enter amount"
          className={inputClasses}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="total" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          Total (USDT)
        </label>
        <input
          type="text"
          id="total"
          value={totalCost.toFixed(2)}
          readOnly
          className={inputClasses}
        />
      </div>

      <button
        onClick={handlePlaceTrade}
        className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all duration-200 shadow-md
          ${tradeAction === 'buy' ? buyButtonBg : sellButtonBg}`}
      >
        {tradeAction === 'buy' ? 'Buy BTC' : 'Sell BTC'}
      </button>
    </div>
  );
};

export default OrderPanel;
