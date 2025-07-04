'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

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

interface ChartProps {
  theme: string;
  currentPrice: number;
  candlestickData: CandlestickData[];
  selectedSymbol: string;
  rsiData: number[];
  bollingerBands: BollingerBand[];
}

const Chart: React.FC<ChartProps> = ({ theme, currentPrice, candlestickData, selectedSymbol, rsiData, bollingerBands }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const rsiSeriesRef = useRef<any>(null);
  const bbUpperSeriesRef = useRef<any>(null);
  const bbMiddleSeriesRef = useRef<any>(null);
  const bbLowerSeriesRef = useRef<any>(null);

  // Convert Unix timestamp (seconds) to yyyy-mm-dd, return null for invalid timestamps
  const formatTime = (timestamp: number): string | null => {
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      console.warn(`Invalid timestamp: ${timestamp}`);
      return null;
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date from timestamp: ${timestamp}`);
      return null;
    }
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1F2937' : '#FFFFFF' },
        textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
        horzLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    };

    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScale: { scaleMargins: { top: 0.7, bottom: 0 } },
    });

    rsiSeriesRef.current = chartRef.current.addLineSeries({
      color: '#8e44ad',
      lineWidth: 2,
      priceScale: { scaleMargins: { top: 0.8, bottom: 0.1 } },
    });

    bbUpperSeriesRef.current = chartRef.current.addLineSeries({ color: '#ff9800', lineWidth: 1 });
    bbMiddleSeriesRef.current = chartRef.current.addLineSeries({ color: '#2196f3', lineWidth: 1 });
    bbLowerSeriesRef.current = chartRef.current.addLineSeries({ color: '#ff9800', lineWidth: 1 });

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [theme]);

  useEffect(() => {
    // Filter out invalid candlestick data
    const validCandlestickData = candlestickData.filter((d) => formatTime(d.time) !== null);
    if (candlestickSeriesRef.current && validCandlestickData.length > 0) {
      candlestickSeriesRef.current.setData(
        validCandlestickData.map((d) => ({
          time: formatTime(d.time)!,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    }
    if (volumeSeriesRef.current && validCandlestickData.length > 0) {
      volumeSeriesRef.current.setData(
        validCandlestickData.map((d) => ({
          time: formatTime(d.time)!,
          value: d.volume,
          color: d.close >= d.open ? '#26a69a' : '#ef5350',
        }))
      );
    }
    if (rsiSeriesRef.current && rsiData.length > 0 && validCandlestickData.length >= rsiData.length) {
      rsiSeriesRef.current.setData(
        rsiData.map((value, index) => ({
          time: formatTime(validCandlestickData[index]?.time)!,
          value,
        }))
      );
    }
    if (
      bbUpperSeriesRef.current &&
      bbMiddleSeriesRef.current &&
      bbLowerSeriesRef.current &&
      bollingerBands.length > 0 &&
      validCandlestickData.length >= bollingerBands.length &&
      bollingerBands[bollingerBands.length - 1]?.lower !== undefined
    ) {
      const bbData = bollingerBands.map((bb, index) => ({
        time: formatTime(validCandlestickData[index]?.time),
        upper: bb.upper,
        middle: bb.middle,
        lower: bb.lower,
      })).filter((d) => d.time !== null);
      bbUpperSeriesRef.current.setData(bbData.map((d) => ({ time: d.time!, value: d.upper })));
      bbMiddleSeriesRef.current.setData(bbData.map((d) => ({ time: d.time!, value: d.middle })));
      bbLowerSeriesRef.current.setData(bbData.map((d) => ({ time: d.time!, value: d.lower })));
    }
  }, [candlestickData, rsiData, bollingerBands]);

  useEffect(() => {
    if (candlestickSeriesRef.current && currentPrice > 0) {
      const now = Math.floor(Date.now() / 1000);
      const formattedTime = formatTime(now);
      if (formattedTime) {
        candlestickSeriesRef.current.update({
          time: formattedTime,
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
        });
      }
    }
  }, [currentPrice]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      {candlestickData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for market data...</p>
        </div>
      )}
      {candlestickData.length > 0 && bollingerBands.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for Bollinger Bands data (requires 20 periods)...</p>
        </div>
      )}
    </div>
  );
};

export default Chart;