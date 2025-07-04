'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChartContainer from '@/components/ChartContainer';
import TradingJournal from '@/components/TradingJournal';
import OrderPanel from '@/components/OrderPanel';
import { supabase } from '@/utils/supabaseClient';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

interface Trade {
  id: number;
  time: string;
  symbol: string;
  action: string;
  price: number;
  orderId: string;
  status: string;
  outcome: string;
  profitLoss: number;
}

const HomePage: React.FC = () => {
  const { user } = useAuthAndTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(searchParams.get('message') || null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase.from('trades').select('*').order('time', { ascending: false });
        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
        setTrades(data || []);
      } catch (err) {
        console.error('Failed to fetch trades:', err);
        setSupabaseError('Failed to load trade journal. Please check Supabase configuration.');
      }
    };
    fetchTrades();

    const subscription = supabase
      .channel('trades-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, (payload) => {
        setTrades((prev) => {
          if (payload.eventType === 'INSERT') {
            return [payload.new, ...prev];
          } else if (payload.eventType === 'UPDATE') {
            return prev.map((trade) => (trade.id === payload.new.id ? payload.new : trade));
          } else if (payload.eventType === 'DELETE') {
            return prev.filter((trade) => trade.id !== payload.old.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, router]);

  const handleTradePlaced = async (trade: Omit<Trade, 'id' | 'time'>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([{ ...trade, time: new Date().toISOString() }])
        .select();
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      setTrades((prev) => [data[0], ...prev]);
    } catch (err) {
      console.error('Failed to log trade:', err);
      setSupabaseError('Failed to log trade to Supabase.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {authError && (
        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg mb-4 text-sm text-red-700 dark:text-red-300">
          {authError}
        </div>
      )}
      {supabaseError && (
        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg mb-4 text-sm text-red-700 dark:text-red-300">
          {supabaseError}
        </div>
      )}
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Crypster Trading Dashboard</h1>
          <ChartContainer
            theme="dark"
            initialSymbol={selectedSymbol}
            setCurrentPrice={setCurrentPrice}
            onSymbolChange={setSelectedSymbol}
            onSignalChange={(signal) => console.log('Signal:', signal)}
          />
          <OrderPanel
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            onTradePlaced={handleTradePlaced}
          />
          <TradingJournal trades={trades} />
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to login...</p>
      )}
    </div>
  );
};

export default HomePage;