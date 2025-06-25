// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider'; // Import useAuthAndTheme hook

// Import local components and utilities
import { generateCandlestickData, CandlestickData } from '@/utils/dataGenerators';
import ChartComponent from '@/components/Chart'; // Note: ChartComponent is in src/components/ not components/ui/
import OrderPanel from '@/components/OrderPanel'; // Note: OrderPanel is in src/components/ not components/ui/
import RiskManagement from '@/components/RiskManagement'; // Note: RiskManagement is in src/components/ not components/ui/
import TradingJournal from '@/components/TradingJournal'; // Note: TradingJournal is in src/components/ not components/ui/


const HomePage: React.FC = () => {
  const { session, isAuthLoading, theme } = useAuthAndTheme(); // Consume context directly

  // Local states for market data and trading simulation
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Market data loading
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT'); // State for selected symbol

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


  // Function to fetch market data from our API route for a given symbol
  const fetchMarketData = useCallback(async (symbol: string) => { // Now accepts symbol
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/market-data?symbol=${symbol}`); // Pass symbol as query param
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCandlestickData(data.candlestickData);
      setCurrentPrice(data.currentPrice);
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      setError("Failed to load market data. Please try again later.");
      const dummyData = generateCandlestickData(); // Fallback to dummy data
      setCandlestickData(dummyData);
      setCurrentPrice(dummyData[dummyData.length -1].close);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Data fetching interval: only run if auth is loaded AND session is present
  useEffect(() => {
    // This check ensures we only fetch data if the user is authenticated
    if (!isAuthLoading && session) {
      fetchMarketData(selectedSymbol); // Fetch initial data for the selected symbol
      const intervalId = setInterval(() => fetchMarketData(selectedSymbol), 15000); // Fetch every 15 seconds
      return () => clearInterval(intervalId);
    }
  }, [isAuthLoading, session, selectedSymbol, fetchMarketData]); // Re-run effect when selectedSymbol changes


  // Calculate total cost when amount or price changes
  useEffect(() => {
    const price = orderType === 'market' ? currentPrice : parseFloat(priceInput);
    const amount = parseFloat(amountInput);
    if (!isNaN(price) && !isNaN(amount)) {
      setTotalCost(price * amount);
    } else {
      setTotalCost(0);
    }
  }, [amountInput, priceInput, orderType, currentPrice]);

  // Calculate risk management values
  useEffect(() => {
    const currentRiskAmount = (capital * riskPerTradePct) / 100;
    setRiskAmount(currentRiskAmount);

    if (currentPrice > 0) {
      if (tradeAction === 'buy') {
        const calculatedStopLossPrice = currentPrice * (1 - stopLossPct / 100);
        setStopLossPrice(calculatedStopLossPrice);
        const calculatedTakeProfitPrice = currentPrice * (1 + takeProfitPct / 100);
        setTakeProfitPrice(calculatedTakeProfitPrice);
        if (stopLossPct > 0) {
          setPositionSize(currentRiskAmount / (currentPrice * (stopLossPct / 100)));
        } else {
          setPositionSize(0);
        }
      } else { // Sell (short)
        const calculatedStopLossPrice = currentPrice * (1 + stopLossPct / 100);
        setStopLossPrice(calculatedStopLossPrice);
        const calculatedTakeProfitPrice = currentPrice * (1 - takeProfitPct / 100);
        setTakeProfitPrice(calculatedTakeProfitPrice);
        if (stopLossPct > 0) {
          setPositionSize(currentRiskAmount / (currentPrice * (stopLossPct / 100)));
        } else {
          setPositionSize(0);
        }
      }
    }
  }, [capital, riskPerTradePct, stopLossPct, takeProfitPct, currentPrice, tradeAction]);

  // Handle placing a simulated trade
  const handlePlaceTrade = () => {
    const tradeDetails = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      action: tradeAction,
      orderType: orderType,
      price: orderType === 'market' ? currentPrice.toFixed(2) : parseFloat(priceInput).toFixed(2),
      amount: parseFloat(amountInput).toFixed(4),
      total: totalCost.toFixed(2),
      status: 'Simulated Executed',
      capitalBefore: capital.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      stopLossPrice: stopLossPrice.toFixed(2),
      takeProfitPrice: takeProfitPrice.toFixed(2),
      positionSize: positionSize.toFixed(4),
      symbol: selectedSymbol, // Include the selected symbol in the trade journal entry
    };

    setTradeJournal((prevJournal) => [tradeDetails, ...prevJournal]);

    const simulatedPnL = (Math.random() - 0.5) * riskAmount * 2;
    setCapital(prevCapital => prevCapital + simulatedPnL);

    setPriceInput('');
    setAmountInput('');
  };

  // Common Tailwind classes for elements that need specific overrides
  const buyButtonBg = 'bg-green-500 hover:bg-green-600';
  const sellButtonBg = 'bg-red-500 hover:bg-red-600';

  // Render a loading state if authentication is still in progress OR if there's no session
  if (isAuthLoading || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Crypster Trading</h1>
    <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Crypster Trading</h1>

      {/* Symbol Selection Dropdown - REFINED STYLING */}
      <div className={`bg-white dark:bg-gray-800 p-2 sm:px-3 sm:py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 mb-6 flex items-center justify-center max-w-[250px] sm:max-w-[300px]`}>
        <label htmlFor="symbol-select" className="text-sm sm:text-base font-medium mr-2 sm:mr-3 text-gray-900 dark:text-gray-100">
          Pair:
        </label>
        <select
          id="symbol-select"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className={`appearance-none bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
        >
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="XRP/USDT">XRP/USDT</option>
          {/* Add more pairs as needed and supported by your API */}
        </select>
      </div>

      {isLoading && (
        <p className="text-lg text-blue-400 mb-4">Loading market data...</p>
      )}
      {error && (
        <p className="text-lg text-red-500 mb-4">{error}</p>
      )}

      {/* Only render if market data is loaded and currentPrice is valid */}
      {!isLoading && currentPrice > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          <ChartComponent
            theme={theme}
            currentPrice={currentPrice}
            candlestickData={candlestickData}
            selectedSymbol={selectedSymbol} // Pass selected symbol to ChartComponent
          />

          <OrderPanel
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
            currentPrice={currentPrice}
            buyButtonBg={buyButtonBg}
            sellButtonBg={sellButtonBg}

          <OrderPanel
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
            currentPrice={currentPrice}
            buyButtonBg={buyButtonBg}
            sellButtonBg={sellButtonBg}
          />

          <div className={`lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6`}>
            <RiskManagement
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

            <TradingJournal
              theme={theme}
              tradeJournal={tradeJournal}
            />
          </div>
        </div>
      ) : (
        // This message will show only if market data is loading/error, but auth is resolved.
        <div className={`min-h-[calc(100vh-150px)] flex items-center justify-center`}>
            <p className="text-xl">
                {error ? `Error: ${error}` : "Fetching real-time market data..."}
            </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
};

export default HomePage;
