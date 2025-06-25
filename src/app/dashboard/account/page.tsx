// src/app/dashboard/account/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

const AccountPage: React.FC = () => {
  const router = useRouter();
  // Consume context for session and auth loading
  const { session, isAuthLoading, theme } = useAuthAndTheme();

  // Local states for page-specific actions/UI
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log('AccountPage Mount/Update - isAuthLoading:', isAuthLoading, 'Session:', session);
    if (isAuthLoading) {
      console.log('AccountPage: Still authenticating...');
    } else if (!session) {
      console.log('AccountPage: Authentication complete, NO session. Redirecting to login (handled by layout)...');
      // No explicit router.push here, relying on AuthAndThemeProvider's redirect logic
    } else {
      console.log('AccountPage: Authentication complete, session EXISTS. User Email:', session.user?.email);
    }
  }, [isAuthLoading, session]);
  // --- END DEBUGGING LOGS ---


  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!session?.user?.email) {
      setMessage('Error: User email not found for password reset.');
      setIsError(true);
      return;
    }

    setLoadingAction(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setIsError(true);
      setMessage(`Error sending password reset: ${error.message}`);
      console.error('Password reset error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Tailwind classes based on theme from context
  const panelBgClass = 'bg-white dark:bg-gray-800';
  const borderColorClass = 'border-gray-300 dark:border-gray-700';
  const buttonBg = 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';


  if (isAuthLoading || !session) {
    console.log('AccountPage: Rendering loading state...');
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading account data...</p>
      </div>
    );
  }

  // If we reach here, it means isAuthLoading is false AND session is not null
  console.log('AccountPage: Rendering actual content...');
  return (
    <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <div className={`${panelBgClass} p-8 rounded-xl shadow-lg border ${borderColorClass} w-full max-w-2xl text-center`}>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your Account</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Manage your profile and security settings.</p>

        {message && (
          <p className={`text-sm mb-4 ${isError ? 'text-red-500' : 'text-green-500'} text-center`}>
            {message}
          </p>
        )}

        <div className={`space-y-4 text-left mx-auto max-w-sm mb-8 text-gray-900 dark:text-gray-100`}>
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="font-medium">Email:</span>
            <span className="break-all">{session.user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="font-medium">User ID:</span>
            <span className="text-sm break-all">{session.user?.id || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="font-medium">Last Sign In:</span>
            <span>{new Date(session.user?.last_sign_in_at).toLocaleString() || 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePasswordReset}
            disabled={loadingAction}
            className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${buttonBg}
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loadingAction ? 'Sending Email...' : 'Change Password'}
          </button>
          <Link
            href="/dashboard/api-keys"
            className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md bg-purple-600 hover:bg-purple-700 text-center block
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Manage API Keys
          </Link>
        </div>

        <Link href="/" className="mt-8 inline-block text-blue-500 hover:underline">
          &larr; Back to Trading Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
