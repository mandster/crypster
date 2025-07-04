'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import ChartContainer from '@/components/ChartContainer';
import OrderPanel from '@/components/OrderPanel';
import RiskManagement from '@/components/RiskManagement';
import TradingJournal from '@/components/TradingJournal';
import crypto from 'crypto';

interface Trade {
  id: number;
  time: string;
  action: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price: string;
  amount: string;
  total: string;
  status: string;
  capitalBefore: string;
  riskAmount: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  positionSize: string;
  symbol: string;
  orderId?: string; // Added for MEXC order tracking
}

const MemoizedOrderPanel = memo(OrderPanel);
const MemoizedRiskManagement = memo(RiskManagement);
const MemoizedTradingJournal = memo(TradingJournal);

const HomePage: React.FC = () => {
  const { session, isAuthLoading, theme } = useAuthAndTheme();

  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [priceInput, setPriceInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [capital, setCapital] = useState(10000);
  const [riskPerTradePct, setRiskPerTradePct] = useState(1);
  const [stopLossPct, setStopLossPct] = useState(2);
  const [takeProfitPct, setTakeProfitPct] = useState(4);
  const [riskAmount, setRiskAmount] = useState(0);
  const [stopLossPrice, setStopLossPrice] = useState(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState(0);
  const [positionSize, setPositionSize] = useState(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [signal, setSignal] = useState<{
    rsi: string;
    bbWidth: string;
    isActive: boolean;
    suggestedStopLoss: number;
    suggestedTakeProfit: number;
  }>({ rsi: 'N/A', bbWidth: 'N/A', isActive: false, suggestedStopLoss: 0, suggestedTakeProfit: 0 });
  const [tradeJournal, setTradeJournal] = useState<Trade[]>([]);

  useEffect(() => {
    const price = orderType === 'market' ? currentPrice : parseFloat(priceInput);
    const amount = parseFloat(amountInput);
    setTotalCost(!isNaN(price) && !isNaN(amount) ? price * amount : 0);
  }, [amountInput, priceInput, orderType, currentPrice]);

  useEffect(() => {
    const currentRiskAmount = (capital * riskPerTradePct) / 100;
    setRiskAmount(currentRiskAmount);

    const price = parseFloat(priceInput) || currentPrice;
    if (tradeAction === 'buy') {
      setStopLossPrice(price * (1 - stopLossPct / 100));
      setTakeProfitPrice(price * (1 + takeProfitPct / 100));
    } else {
      setStopLossPrice(price * (1 + stopLossPct / 100));
      setTakeProfitPrice(price * (1 - takeProfitPct / 100));
    }

    setPositionSize(stopLossPct > 0 ? currentRiskAmount / (price * (stopLossPct / 100)) : 0);
  }, [capital, riskPerTradePct, stopLossPct, takeProfitPct, priceInput, tradeAction, currentPrice]);

  useEffect(() => {
    if (signal.isActive) {
      setTradeAction('buy');
      setPriceInput(currentPrice.toString());
      setStopLossPrice(signal.suggestedStopLoss);
      setTakeProfitPrice(signal.suggestedTakeProfit);
      setAmountInput((capital * riskPerTradePct / 100 / (currentPrice * (stopLossPct / 100))).toFixed(4));
    }
  }, [signal, currentPrice, capital, riskPerTradePct, stopLossPct]);

  const handlePlaceTrade = useCallback(async () => {
    const price = parseFloat(priceInput) || currentPrice;
    const tradeDetails: Trade = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      action: tradeAction,
      orderType,
      price: price.toFixed(2),
      amount: parseFloat(amountInput).toFixed(4),
      total: totalCost.toFixed(2),
      status: 'Pending',
      capitalBefore: capital.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      stopLossPrice: stopLossPrice.toFixed(2),
      takeProfitPrice: takeProfitPrice.toFixed(2),
      positionSize: positionSize.toFixed(4),
      symbol: selectedSymbol,
    };

    try {
      const apiKey = process.env.MEXC_API_KEY;
      const apiSecret = process.env.MEXC_API_SECRET;
      if (!apiKey || !apiSecret) {
        throw new Error('MEXC API credentials not configured');
      }

      const timestamp = Date.now();
      const queryString = `symbol=${selectedSymbol}&side=${tradeAction.toUpperCase()}&type=${orderType.toUpperCase()}&quantity=${amountInput}${orderType === 'limit' ? `&price=${price}` : ''}&recvWindow=5000&timestamp=${timestamp}`;
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const response = await fetch(`https://api.mexc.com/api/v3/order?${queryString}&signature=${signature}`, {
        method: 'POST',
        headers: {
          'X-MEXC-APIKEY': apiKey,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.code !== 200) {
        throw new Error(result.msg || 'Failed to place order');
      }

      setTradeJournal((prev) => [{ ...tradeDetails, status: 'Executed', orderId: result.orderId }, ...prev]);
      // Update capital based on actual order (simplified for now)
      const simulatedPnL = (Math.random() - 0.5) * riskAmount * 2;
      setCapital((prev) => prev + simulatedPnL);
    } catch (err) {
      console.error('MEXC trade failed:', err);
      setTradeJournal((prev) => [{ ...tradeDetails, status: 'Failed' }, ...prev]);
    }
  }, [tradeAction, orderType, priceInput, amountInput, totalCost, capital, riskAmount, stopLossPrice, takeProfitPrice, positionSize, selectedSymbol, currentPrice]);

  const buyButtonBg = 'bg-green-500 hover:bg-green-600';
  const sellButtonBg = 'bg-red-500 hover:bg-red-600';

  if (isAuthLoading) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center text-gray-900 dark:text-gray-100">
        <p className="text-xl">Authenticating...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center text-gray-900 dark:text-gray-100">
        <p className="text-xl">Please sign in to access trading features.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Crypster Trading</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl min-h-[24rem]">
        <div className="lg:col-span-2">
          <ChartContainer
            theme={theme}
            initialSymbol={selectedSymbol}
            setCurrentPrice={setCurrentPrice}
            onSymbolChange={setSelectedSymbol}
            onSignalChange={setSignal}
          />
        </div>
        <div>
          <MemoizedOrderPanel
            theme={theme}
            orderType={orderType}
            setOrderType={setOrderType}
            tradeAction={tradeAction}
            setTradeAction={setTradeAction}
            priceInput={priceInput}
            setPriceInput={setPriceInput}
            amountInput={amountInput}
            setAmountInput={setAmountInput}
            totalCost={totalCost}
            setTotalCost={setTotalCost}
            handlePlaceTrade={handlePlaceTrade}
            currentPrice={currentPrice}
            buyButtonBg={buyButtonBg}
            sellButtonBg={sellButtonBg}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[24rem]">
          <MemoizedRiskManagement
            theme={theme}
            capital={capital}
            setCapital={setCapital}
            riskPerTradePct={riskPerTradePct}
            setRiskPerTradePct={setRiskPerTradePct}
            stopLossPct={stopLossPct}
            setStopLossPct={setStopLossPct}
            takeProfitPct={takeProfitPct}
            setTakeProfitPct={setTakeProfitPct}
            riskAmount={riskAmount}
            stopLossPrice={stopLossPrice}
            takeProfitPrice={takeProfitPrice}
            positionSize={positionSize}
          />
          <MemoizedTradingJournal theme={theme} tradeJournal={tradeJournal} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;