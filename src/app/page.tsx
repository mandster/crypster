'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import { generateCandlestickData, CandlestickData } from '@/utils/dataGenerators';
import ChartComponent from '@/components/Chart';
import OrderPanel from '@/components/OrderPanel';
import RiskManagement from '@/components/RiskManagement';
import TradingJournal from '@/components/TradingJournal';

const ChartContainer = memo(({ theme, initialSymbol }: { theme: string; initialSymbol: string }) => {
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);

  const fetchMarketData = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/market-data?symbol=${symbol}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCandlestickData(data.candlestickData);
      setCurrentPrice(data.currentPrice);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      setError('Failed to load market data. Please try again later.');
      const dummyData = generateCandlestickData();
      setCandlestickData(dummyData);
      setCurrentPrice(dummyData[dummyData.length - 1].close);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData(selectedSymbol);
    const intervalId = setInterval(() => fetchMarketData(selectedSymbol), 15000);
    return () => clearInterval(intervalId);
  }, [selectedSymbol, fetchMarketData]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 mb-2 flex items-center justify-center space-x-1 text-xs">
        <label htmlFor="symbol-select" className="font-medium text-gray-900 dark:text-gray-100">
          Pair:
        </label>
        <select
          id="symbol-select"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 py-1 px-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="XRP/USDT">XRP/USDT</option>
        </select>
      </div>

      <div className="w-full flex-1 min-h-[24rem]">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-blue-400">Loading market data...</p>
          </div>
        )}
        {error && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {!isLoading && currentPrice > 0 && (
          <ChartComponent
            theme={theme}
            currentPrice={currentPrice}
            candlestickData={candlestickData}
            selectedSymbol={selectedSymbol}
          />
        )}
      </div>
    </div>
  );
});

const MemoizedOrderPanel = memo(OrderPanel);
const MemoizedRiskManagement = memo(RiskManagement);
const MemoizedTradingJournal = memo(TradingJournal);

const HomePage: React.FC = () => {
  const { session, isAuthLoading, theme } = useAuthAndTheme();

  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [priceInput, setPriceInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  const [capital, setCapital] = useState(10000);
  const [riskPerTradePct, setRiskPerTradePct] = useState(1);
  const [stopLossPct, setStopLossPct] = useState(2);
  const [takeProfitPct, setTakeProfitPct] = useState(4);
  const [riskAmount, setRiskAmount] = useState(0);
  const [stopLossPrice, setStopLossPrice] = useState(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState(0);
  const [positionSize, setPositionSize] = useState(0);

  const [tradeJournal, setTradeJournal] = useState<any[]>([]);

  useEffect(() => {
    const price = orderType === 'market' ? 0 : parseFloat(priceInput);
    const amount = parseFloat(amountInput);
    setTotalCost(!isNaN(price) && !isNaN(amount) ? price * amount : 0);
  }, [amountInput, priceInput, orderType]);

  useEffect(() => {
    const currentRiskAmount = (capital * riskPerTradePct) / 100;
    setRiskAmount(currentRiskAmount);

    const price = parseFloat(priceInput);
    if (tradeAction === 'buy') {
      setStopLossPrice(price * (1 - stopLossPct / 100));
      setTakeProfitPrice(price * (1 + takeProfitPct / 100));
    } else {
      setStopLossPrice(price * (1 + stopLossPct / 100));
      setTakeProfitPrice(price * (1 - takeProfitPct / 100));
    }

    setPositionSize(stopLossPct > 0 ? currentRiskAmount / (price * (stopLossPct / 100)) : 0);
  }, [capital, riskPerTradePct, stopLossPct, takeProfitPct, priceInput, tradeAction]);

  const handlePlaceTrade = useCallback(() => {
    const tradeDetails = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      action: tradeAction,
      orderType,
      price: parseFloat(priceInput).toFixed(2),
      amount: parseFloat(amountInput).toFixed(4),
      total: totalCost.toFixed(2),
      status: 'Simulated Executed',
      capitalBefore: capital.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      stopLossPrice: stopLossPrice.toFixed(2),
      takeProfitPrice: takeProfitPrice.toFixed(2),
      positionSize: positionSize.toFixed(4),
      symbol: 'BTC/USDT',
    };

    setTradeJournal((prev) => [tradeDetails, ...prev]);
    const simulatedPnL = (Math.random() - 0.5) * riskAmount * 2;
    setCapital((prev) => prev + simulatedPnL);
  }, [tradeAction, orderType, priceInput, amountInput, totalCost, capital, riskAmount, stopLossPrice, takeProfitPrice, positionSize]);

  const buyButtonBg = 'bg-green-500 hover:bg-green-600';
  const sellButtonBg = 'bg-red-500 hover:bg-red-600';

  if (isAuthLoading) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center text-gray-900 dark:text-gray-100">
        <p className="text-xl">Authenticating...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center text-gray-900 dark:text-gray-100">
        <p className="text-xl">Please sign in to access trading features.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Crypster Trading</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl min-h-[24rem]">
        <div className="lg:col-span-2">
          <ChartContainer theme={theme} initialSymbol="BTC/USDT" />
        </div>
        <div>
          <MemoizedOrderPanel
            theme={theme}
            orderType={orderType}
            setOrderType={setOrderType}
            tradeAction={tradeAction}
            setTradeAction={setTradeAction}
            priceInput={priceInput}
            setPriceInput={setPriceInput}
            amountInput={amountInput}
            setAmountInput={setAmountInput}
            totalCost={totalCost}
            handlePlaceTrade={handlePlaceTrade}
            currentPrice={0}
            buyButtonBg={buyButtonBg}
            sellButtonBg={sellButtonBg}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[24rem]">
          <MemoizedRiskManagement
            theme={theme}
            capital={capital}
            setCapital={setCapital}
            riskPerTradePct={riskPerTradePct}
            setRiskPerTradePct={setRiskPerTradePct}
            stopLossPct={stopLossPct}
            setStopLossPct={setStopLossPct}
            takeProfitPct={takeProfitPct}
            setTakeProfitPct={setTakeProfitPct}
            riskAmount={riskAmount}
            stopLossPrice={stopLossPrice}
            takeProfitPrice={takeProfitPrice}
            positionSize={positionSize}
          />
          <MemoizedTradingJournal theme={theme} tradeJournal={tradeJournal} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;