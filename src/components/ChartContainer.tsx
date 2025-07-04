'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import { generateCandlestickData, calculateRSI, calculateBollingerBands } from '@/utils/dataGenerators';
import ChartComponent from '@/components/Chart';
import DOMPurify from 'dompurify';

interface CandlestickData {
  time: number;
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
  onSymbolChange?: (symbol: string) => void;
  onSignalChange?: (signal: { rsi: string; bbWidth: string; isActive: boolean; suggestedStopLoss: number; suggestedTakeProfit: number }) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ theme, initialSymbol, setCurrentPrice, onSymbolChange, onSignalChange }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol.replace('/', ''));
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setLocalCurrentPrice] = useState(0);
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [bollingerBands, setBollingerBands] = useState<BollingerBand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsiThreshold, setRsiThreshold] = useState(30);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const websocket = new WebSocket('wss://wbs.mexc.com/ws');
    setWs(websocket);

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`spot@public.kline@${selectedSymbol}@1h`, `spot@public.ticker@${selectedSymbol}`],
          id: 1,
        })
      );
      const pingInterval = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ method: 'PING', id: 2 }));
        }
      }, 30000);
      websocket.onclose = () => {
        clearInterval(pingInterval);
        setTimeout(connectWebSocket, 5000);
      };
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s === selectedSymbol && data.c === 'kline_1h') {
        const candle = data.d;
        if (!Number.isFinite(candle.t) || candle.t <= 0) {
          console.warn(`Invalid timestamp from WebSocket: ${candle.t}`);
          return;
        }
        setCandlestickData((prev) => {
          const newCandle = {
            time: candle.t,
            open: +candle.o,
            high: +candle.h,
            low: +candle.l,
            close: +candle.c,
            volume: +candle.v,
          };
          if (isNaN(newCandle.open) || isNaN(newCandle.high) || isNaN(newCandle.low) || isNaN(newCandle.close) || isNaN(newCandle.volume)) {
            console.warn(`Invalid candle data: ${JSON.stringify(newCandle)}`);
            return prev;
          }
          const newData = [...prev.slice(-99), newCandle];
          const closes = newData.map((d) => d.close);
          setRsiData(closes.length >= 14 ? calculateRSI(closes, 14) : []);
          setBollingerBands(closes.length >= 20 ? calculateBollingerBands(closes, 20) : []);
          return newData;
        });
      } else if (data.s === selectedSymbol && data.c === 'ticker') {
        const price = +data.d.price;
        if (Number.isFinite(price) && price > 0) {
          setLocalCurrentPrice(price);
          setCurrentPrice(price);
        }
      }
    };

    websocket.onerror = () => {
      setError('WebSocket connection failed. Falling back to dummy data.');
      const dummyData = generateCandlestickData();
      const validDummyData = dummyData.filter((d) => Number.isFinite(d.time) && d.time > 0);
      setCandlestickData(validDummyData);
      const lastPrice = validDummyData[validDummyData.length - 1]?.close || 0;
      setLocalCurrentPrice(lastPrice);
      setCurrentPrice(lastPrice);
      const closes = validDummyData.map((d) => d.close);
      setRsiData(closes.length >= 14 ? calculateRSI(closes, 14) : []);
      setBollingerBands(closes.length >= 20 ? calculateBollingerBands(closes, 20) : []);
      setIsLoading(false);
    };

    return () => {
      websocket.close();
    };
  }, [selectedSymbol, setCurrentPrice]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  const latestRSI = rsiData.length > 0 ? rsiData[rsiData.length - 1].toFixed(2) : 'N/A';
  const latestBB = bollingerBands.length > 0 ? bollingerBands[bollingerBands.length - 1] : null;
  const bbWidth = latestBB ? ((latestBB.upper - latestBB.lower) / latestBB.middle * 100).toFixed(2) : 'N/A';
  const signalHighlight =
  latestBB !== null &&
  parseFloat(latestRSI) < rsiThreshold &&
  currentPrice <= latestBB.lower;
  const suggestedStopLoss = currentPrice * 0.98;
  const suggestedTakeProfit = latestBB?.middle || currentPrice * 1.04;

  useEffect(() => {
    if (onSignalChange) {
      onSignalChange({ rsi: latestRSI, bbWidth, isActive: signalHighlight, suggestedStopLoss, suggestedTakeProfit });
    }
  }, [latestRSI, bbWidth, signalHighlight, suggestedStopLoss, suggestedTakeProfit, onSignalChange]);

  const handleTradeNow = () => {
    onSymbolChange?.(selectedSymbol);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 mb-3 flex items-center justify-center space-x-2 text-xs">
        <label htmlFor="symbol-select" className="font-medium text-gray-900 dark:text-gray-100">
          Pair:
        </label>
        <select
          id="symbol-select"
          value={selectedSymbol}
          onChange={(e) => {
            const newSymbol = DOMPurify.sanitize(e.target.value).replace('/', '');
            setSelectedSymbol(newSymbol);
            onSymbolChange?.(newSymbol);
          }}
          className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="BTCUSDT">BTCUSDT</option>
          <option value="ETHUSDT">ETHUSDT</option>
          <option value="XRPUSDT">XRPUSDT</option>
        </select>
        <input
          type="number"
          value={rsiThreshold}
          onChange={(e) => setRsiThreshold(Number(e.target.value))}
          className="w-16 p-1 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="RSI Threshold"
        />
      </div>

      <div className="w-full h-96">
        {isLoading && (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-blue-400">Connecting to MEXC WebSocket...</p>
          </div>
        )}
        {error && (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {!isLoading && currentPrice > 0 && (
          <ChartComponent
            theme={theme}
            currentPrice={currentPrice}
            candlestickData={candlestickData}
            selectedSymbol={selectedSymbol}
            rsiData={rsiData}
            bollingerBands={bollingerBands}
          />
        )}
      </div>

      <div className={`mt-4 p-3 rounded-lg border ${signalHighlight ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900 dark:border-yellow-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
        <p className="text-sm text-gray-800 dark:text-gray-200">
          <strong>RSI:</strong> {latestRSI} | <strong>BB Width:</strong> {bbWidth}% | <strong>Price:</strong> {currentPrice.toFixed(2)}
        </p>
        {signalHighlight && (
          <>
            <p className="text-xs mt-1 text-orange-500 font-semibold">📈 Buy Signal: RSI &lt; {rsiThreshold} and Price Near Lower Bollinger Band</p>
            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              Suggested Stop-Loss: {suggestedStopLoss.toFixed(2)} | Suggested Take-Profit: {suggestedTakeProfit.toFixed(2)}
            </p>
            <button
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleTradeNow}
            >
              Trade Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
