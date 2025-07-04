'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  Time,
  LineStyle,
  type IChartApi,
} from 'lightweight-charts';

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

interface Props {
  theme: string;
  candlestickData: CandlestickData[];
  currentPrice: number;
  setCurrentPrice: (price: number) => void;
  selectedSymbol: string;
  rsiData?: number[];
  bollingerBands?: BollingerBand[];
}


const Chart: React.FC<Props> = ({
  theme,
  candlestickData,
  currentPrice,
  selectedSymbol,
  rsiData = [],
  bollingerBands = [],
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, {
      layout: {
        background: { color: theme === 'dark' ? '#1E293B' : '#FFFFFF' },
        textColor: theme === 'dark' ? '#E2E8F0' : '#1E293B',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#334155' : '#CBD5E1' },
        horzLines: { color: theme === 'dark' ? '#334155' : '#CBD5E1' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#71649C' },
      timeScale: { borderColor: '#71649C', timeVisible: true },
    });

    chartRef.current = chart;

    // -------------------- CANDLESTICK --------------------
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candleSeries.setData(
      candlestickData.map((d, i) => ({
        time: (Math.floor(Date.now() / 1000) - (candlestickData.length - 1 - i) * 60) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // -------------------- VOLUME --------------------
    const volumeSeries = chart.addHistogramSeries({
      color: '#999',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.setData(
      candlestickData.map((d, i) => ({
        time: (Math.floor(Date.now() / 1000) - (candlestickData.length - 1 - i) * 60) as Time,
        value: d.volume,
        color: d.close > d.open ? '#26a69a' : '#ef5350',
      }))
    );

    // -------------------- BOLLINGER BANDS --------------------
    if (bollingerBands.length > 0) {
      const upper = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
      const middle = chart.addLineSeries({ color: '#0ea5e9', lineWidth: 1, lineStyle: LineStyle.Dotted });
      const lower = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });

      upper.setData(
        bollingerBands.map((bb, i) => ({
          time: (Math.floor(Date.now() / 1000) - (bollingerBands.length - 1 - i) * 60) as Time,
          value: bb.upper,
        }))
      );
      middle.setData(
        bollingerBands.map((bb, i) => ({
          time: (Math.floor(Date.now() / 1000) - (bollingerBands.length - 1 - i) * 60) as Time,
          value: bb.middle,
        }))
      );
      lower.setData(
        bollingerBands.map((bb, i) => ({
          time: (Math.floor(Date.now() / 1000) - (bollingerBands.length - 1 - i) * 60) as Time,
          value: bb.lower,
        }))
      );
    }

    // -------------------- RSI --------------------
    if (rsiData.length > 0) {
      const rsiSeries = chart.addLineSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'rsi',
        color: '#f44336',
        lineWidth: 1,
      });

      chart.priceScale('rsi').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      

      rsiSeries.setData(
        rsiData.map((rsi, i) => ({
          time: (Math.floor(Date.now() / 1000) - (rsiData.length - 1 - i) * 60) as Time,
          value: rsi,
        }))
      );
    }

    const resizeObserver = new ResizeObserver(() => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [theme, candlestickData, rsiData, bollingerBands]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default Chart;
