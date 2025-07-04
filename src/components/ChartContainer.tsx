'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import { generateCandlestickData, calculateRSI, calculateBollingerBands } from '@/utils/dataGenerators';
import ChartComponent from '@/components/Chart';

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BollingerBand {
  upper: number;
  middle: number;
  lower: number;
}

interface ChartContainerProps {
  theme: string;
  initialSymbol: string;
  setCurrentPrice: React.Dispatch<React.SetStateAction<number>>;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ theme, initialSymbol, setCurrentPrice }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [bollingerBands, setBollingerBands] = useState<BollingerBand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/market-data?symbol=${symbol}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCandlestickData(data.candlestickData);
      setCurrentPrice(data.currentPrice);

      const closes = data.candlestickData.map((d: CandlestickData) => d.close);
      setRsiData(calculateRSI(closes, 14));
      setBollingerBands(calculateBollingerBands(closes, 20));
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      setError('Failed to load market data. Please try again later.');
      const dummyData = generateCandlestickData();
      setCandlestickData(dummyData);
      setCurrentPrice(dummyData[dummyData.length - 1].close);

      const closes = dummyData.map((d: CandlestickData) => d.close);
      setRsiData(calculateRSI(closes, 14));
      setBollingerBands(calculateBollingerBands(closes, 20));
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentPrice]);

  useEffect(() => {
    fetchMarketData(selectedSymbol);
    const intervalId = setInterval(() => fetchMarketData(selectedSymbol), 15000);
    return () => clearInterval(intervalId);
  }, [selectedSymbol, fetchMarketData]);

  const latestRSI = rsiData.length > 0 ? rsiData[rsiData.length - 1].toFixed(2) : 'N/A';
  const latestBB = bollingerBands.length > 0 ? bollingerBands[bollingerBands.length - 1] : null;
  const bbWidth = latestBB ? ((latestBB.upper - latestBB.lower) / latestBB.middle * 100).toFixed(2) : 'N/A';
  const signalHighlight = parseFloat(latestRSI) < 30 || parseFloat(bbWidth) < 5;

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 mb-3 flex items-center justify-center space-x-2 text-xs">
        <label htmlFor="symbol-select" className="font-medium text-gray-900 dark:text-gray-100">
          Pair:
        </label>
        <select
          id="symbol-select"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="XRP/USDT">XRP/USDT</option>
        </select>
      </div>

      <div className="w-full h-96">
        {isLoading && (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-blue-400">Loading market data...</p>
          </div>
        )}
        {error && (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {!isLoading && candlestickData.length > 0 && (
          <ChartComponent
            theme={theme}
            initialSymbol={selectedSymbol}
            setCurrentPrice={setCurrentPrice}
            candlestickData={candlestickData}
            selectedSymbol={selectedSymbol}
            rsiData={rsiData}
            bollingerBands={bollingerBands}
          />
        )}
      </div>

      <div className={`mt-4 p-3 rounded-lg border ${signalHighlight ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900 dark:border-yellow-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
        <p className="text-sm text-gray-800 dark:text-gray-200">
          <strong>RSI:</strong> {latestRSI} | <strong>BB Width:</strong> {bbWidth}%
        </p>
        {signalHighlight && (
          <p className="text-xs mt-1 text-orange-500 font-semibold">📈 Signal: RSI &lt; 30 or BB Squeeze</p>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
