// src/app/api/market-data/route.ts
import { NextResponse } from 'next/server';
import ccxt from 'ccxt';

// Default symbol if none is provided
const DEFAULT_SYMBOL = 'BTC/USDT';

// Set a revalidate value of 0 to disable caching for this route.
export const revalidate = 0;

/**
 * Function to generate dummy candlestick data for demonstration.
 * Adapted for backend use.
 */
const generateDummyCandlestickData = (symbol: string = DEFAULT_SYMBOL, count: number = 50) => {
  const data = [];
  let lastClose = (symbol === 'BTC/USDT') ? 60000 : (symbol === 'ETH/USDT' ? 3000 : (symbol === 'XRP/USDT' ? 0.5 : 100)); // Base price for dummy data
  
  for (let i = 0; i < count; i++) {
    // Small random fluctuation around the last close
    const fluctuation = (Math.random() - 0.5) * (lastClose * 0.005); // +/- 0.5% fluctuation
    const open = lastClose + fluctuation;
    const high = open + Math.random() * (lastClose * 0.002);
    const low = open - Math.random() * (lastClose * 0.002);
    const close = low + Math.random() * (high - low);
    
    lastClose = close; // Update lastClose for the next candle

    const timestamp = Date.now() - (count - 1 - i) * 60 * 1000; // 1-minute intervals
    data.push({
      time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }
  return data;
};

// Initialize MEXC exchange client (only if not using mock data)
const mexc = process.env.USE_MOCK_DATA !== 'true' ? new ccxt.mexc({
  apiKey: process.env.MEXC_API_KEY,
  secret: process.env.MEXC_SECRET_KEY,
  timeout: 15000,
  options: {
    recvWindow: 30000,
  },
}) : null; // Initialize only if not using mock data

/**
 * Handles GET requests to fetch market data (current price and candlestick data).
 * Accepts 'symbol' as a query parameter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || DEFAULT_SYMBOL;

  // Check if mock data should be used
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  if (useMockData) {
    console.log(`[Market Data API] Serving MOCK data for ${symbol}`);
    const mockCandlestickData = generateDummyCandlestickData(symbol, 50);
    const mockCurrentPrice = mockCandlestickData[mockCandlestickData.length - 1].close;

    return NextResponse.json({
      currentPrice: mockCurrentPrice,
      candlestickData: mockCandlestickData,
      symbol: symbol,
    });
  }

  // --- Live Data Fetching (only if not using mock data) ---
  if (!mexc) {
    // This case should ideally not happen if mexc is initialized conditionally
    return NextResponse.json(
      { error: "MEXC exchange client not initialized for live data." },
      { status: 500 }
    );
  }

  try {
    const ticker = await mexc.fetchTicker(symbol);
    const ohlcv = await mexc.fetchOHLCV(symbol, '1m', undefined, 50);

    const candlestickData = ohlcv.map((candle: number[]) => ({
      time: new Date(candle[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));

    return NextResponse.json({
      currentPrice: ticker.last,
      candlestickData: candlestickData,
      symbol: symbol,
    });
  } catch (error) {
    console.error(`Error fetching market data for ${symbol} from MEXC:`, error);
    return NextResponse.json(
      { error: `Failed to fetch market data for ${symbol}`, details: (error as Error).message },
      { status: 500 }
    );
  }
}
