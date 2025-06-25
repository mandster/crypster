// src/app/dashboard/api-keys/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

// Removed interface ApiKeysPageProps as props are no longer passed directly

const ApiKeysPage: React.FC = () => { // Changed from React.FC<ApiKeysPageProps>
  const router = useRouter();
  const { session, isAuthLoading, theme } = useAuthAndTheme();
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      if (!isAuthLoading && session) {
        setLoadingAction(true);
        setMessage('');
        setIsError(false);
        try {
          const response = await fetch('/api/user-api-keys');
          if (response.status === 404) {
            setMessage('No API keys found for your account. Please add them below.');
            setIsError(false);
            setStoredApiKey(null);
            return;
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setStoredApiKey(`API Key: ${data.apiKey} (Secret Key is hidden for security in UI)`);
          setMessage('Your API keys are securely stored.');
          setIsError(false);
        } catch (err: any) {
          console.error("Failed to fetch stored API keys:", err);
          setIsError(true);
          setMessage(`Error fetching stored API keys: ${err.message}`);
          setStoredApiKey(null);
        } finally {
          setLoadingAction(false);
        }
      }
    };
    fetchKeys();
  }, [isAuthLoading, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setMessage('');
    setIsError(false);

    if (!session) {
      setMessage('You must be logged in to save API keys.');
      setIsError(true);
      setLoadingAction(false);
      return;
    }

    try {
      const response = await fetch('/api/user-api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, secretKey, exchange: 'MEXC' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save API keys');
      }

      const data = await response.json();
      setMessage('API keys saved successfully!');
      setStoredApiKey(`API Key: ${apiKey} (Secret Key is hidden for security in UI)`);
      setApiKey('');
      setSecretKey('');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
      console.error('Error saving API keys:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = async () => {
    setLoadingAction(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
      console.error('Logout error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const panelBgClass = 'bg-white dark:bg-gray-800';
  const borderColorClass = 'border-gray-300 dark:border-gray-700';
  const inputBgClass = 'bg-gray-100 dark:bg-gray-700';
  const buttonBg = 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';


  if (isAuthLoading || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <div className={`${panelBgClass} p-8 rounded-xl shadow-lg border ${borderColorClass} w-full max-w-lg`}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Manage Your MEXC API Keys</h2>
        <p className="text-center text-sm mb-4 text-gray-600 dark:text-gray-400">
          Securely store your API keys for automated trading features.
          Your secret key is encrypted and never exposed on the frontend.
        </p>

        {storedApiKey && (
          <div className="bg-green-600/20 text-green-300 p-3 rounded-lg mb-4 text-sm break-all">
            <p className="font-semibold">Currently Stored API Keys:</p>
            <p>{storedApiKey}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              MEXC API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBgClass} text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Paste your MEXC API Key here"
            />
          </div>
          <div>
            <label htmlFor="secretKey" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              MEXC Secret Key
            </label>
            <input
              type="password"
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBgClass} text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Paste your MEXC Secret Key here"
            />
          </div>

          {message && (
            <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'} text-center`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingAction}
            className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all duration-200 shadow-md
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : buttonBg}`}
          >
            {loadingAction ? 'Saving...' : 'Save API Keys'}
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <Link href="/" className={`${buttonBg} text-white font-bold py-3 px-6 rounded-lg shadow-md text-center transition-all duration-200 flex-1`}>
            Back to Trading Dashboard
          </Link>
          <button
            onClick={handleLogout}
            disabled={loadingAction}
            className={`bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex-1
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysPage;
