// utils/indicators.ts

import { CandlestickData } from './dataGenerators';

// RSI Calculation
export function calculateRSI(data: CandlestickData[], period = 14): number | null {
  if (data.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period - 1; i < data.length - 1; i++) {
    const delta = data[i + 1].close - data[i].close;
    if (delta >= 0) gains += delta;
    else losses -= delta; // losses are positive
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

// Bollinger Bands Calculation
export function calculateBollingerBands(
  data: CandlestickData[],
  period = 20,
  stdDevMultiplier = 2
): { middle: number; upper: number; lower: number } | null {
  if (data.length < period) return null;

  const slice = data.slice(-period);
  const closes = slice.map((d) => d.close);
  const avg = closes.reduce((sum, val) => sum + val, 0) / period;
  const variance = closes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    middle: avg,
    upper: avg + stdDevMultiplier * stdDev,
    lower: avg - stdDevMultiplier * stdDev,
  };
}
