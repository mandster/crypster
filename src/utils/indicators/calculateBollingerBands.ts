export type BollingerBand = {
    middle: number;
    upper: number;
    lower: number;
  };
  
  /**
   * Calculate Bollinger Bands (middle, upper, lower) based on a closing price array
   * @param closes - Array of closing prices
   * @param period - Number of periods for the moving average (commonly 20)
   * @param multiplier - Standard deviation multiplier (commonly 2)
   * @returns Array of BollingerBand objects aligned with the closes
   */
  export function calculateBollingerBands(
    closes: number[],
    period: number = 20,
    multiplier: number = 2
  ): BollingerBand[] {
    const result: BollingerBand[] = [];
  
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        result.push({ middle: NaN, upper: NaN, lower: NaN });
        continue;
      }
  
      const window = closes.slice(i - period + 1, i + 1);
      const avg = window.reduce((sum, v) => sum + v, 0) / period;
  
      const variance = window.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
  
      result.push({
        middle: avg,
        upper: avg + multiplier * stdDev,
        lower: avg - multiplier * stdDev,
      });
    }
  
    return result;
  }
  