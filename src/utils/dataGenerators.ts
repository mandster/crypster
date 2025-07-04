// src/utils/dataGenerators.ts

// Interface for the candlestick data structure
export interface CandlestickData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }


// ✅ Add this:
export function calculateRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }

  gains /= period;
  losses /= period;

  rsi[period] = 100 - 100 / (1 + gains / losses);

  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta >= 0) {
      gains = (gains * (period - 1) + delta) / period;
      losses = (losses * (period - 1)) / period;
    } else {
      gains = (gains * (period - 1)) / period;
      losses = (losses * (period - 1) - delta) / period;
    }

    rsi[i] = 100 - 100 / (1 + gains / losses);
  }

  return rsi;
}

export function calculateBollingerBands(closes: number[], period = 20) {
  const bands: { upper: number; lower: number }[] = [];

  for (let i = 0; i <= closes.length - period; i++) {
    const slice = closes.slice(i, i + period);
    const avg = slice.reduce((sum, val) => sum + val, 0) / period;
    const stdDev = Math.sqrt(slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period);

    bands.push({
      upper: avg + 2 * stdDev,
      lower: avg - 2 * stdDev,
    });
  }

  return bands;
}

  /**
   * Generates dummy candlestick data for demonstration purposes.
   * @param count The number of candlestick data points to generate.
   * @returns An array of CandlestickData objects.
   */
  export const generateCandlestickData = (count: number = 50): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let lastClose = 50000; // Starting price for the simulation
  
    for (let i = 0; i < count; i++) {
      // Simulate price movements based on the last close
      const open = lastClose + (Math.random() - 0.5) * 1000; // Open price near previous close
      const high = open + Math.random() * 2000; // High price above open
      const low = open - Math.random() * 2000; // Low price below open
      const close = low + Math.random() * (high - low); // Close price within high-low range
  
      lastClose = close; // Update last close for the next candle
  
      // Generate a timestamp for 1-minute intervals
      const timestamp = Date.now() - (count - 1 - i) * 60 * 1000;
      const timeString = new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
      // Simulate volume
      const volume = Math.floor(Math.random() * 1000000) + 100000;
  
      data.push({
        time: timeString,
        open,
        high,
        low,
        close,
        volume,
      });
    }
    return data;
  };
  