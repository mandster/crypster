// src/utils/indicators/calculateRSI.ts

export function calculateRSI(closes: number[], period: number = 14): number[] {
    if (closes.length < period + 1) return [];
  
    const gains: number[] = [];
    const losses: number[] = [];
  
    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) {
        gains.push(diff);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(diff));
      }
    }
  
    let avgGain = gains.reduce((a, b) => a + b) / period;
    let avgLoss = losses.reduce((a, b) => a + b) / period;
  
    const rsi: number[] = [];
  
    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;
  
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
  
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  
    return rsi;
  }
  