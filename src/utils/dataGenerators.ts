export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBand {
  upper: number;
  middle: number;
  lower: number;
}

export const generateCandlestickData = (count: number = 100): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let price = 50000;
  const startTime = Math.floor(Date.now() / 1000) - count * 3600;

  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.5) * 1000;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    const volume = Math.random() * 10000 + 1000;
    const time = startTime + i * 3600;

    if (!Number.isFinite(time) || time <= 0) {
      console.warn(`Invalid time generated: ${time}`);
      continue;
    }

    data.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }
  return data;
};

export const calculateRSI = (closes: number[], period: number = 14): number[] => {
  if (closes.length < period) return [];
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    gains += change > 0 ? change : 0;
    losses += change < 0 ? -change : 0;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / (avgLoss || 1);
    rsi.push(100 - 100 / (1 + rs));
  }
  return rsi;
};

export const calculateBollingerBands = (closes: number[], period: number = 20, multiplier: number = 2): BollingerBand[] => {
  if (closes.length < period) return [];
  const bands: BollingerBand[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((sum, val) => sum + val, 0) / period;
    const stdDev = Math.sqrt(slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period);
    bands.push({
      upper: sma + multiplier * stdDev,
      middle: sma,
      lower: sma - multiplier * stdDev,
    });
  }
  return bands;
};