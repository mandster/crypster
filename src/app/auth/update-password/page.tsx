// src/app/auth/update-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

// Removed interface UpdatePasswordPageProps as props are no longer passed directly

const UpdatePasswordPage: React.FC = () => { // Changed from React.FC<UpdatePasswordPageProps>
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const { session, isAuthLoading, theme } = useAuthAndTheme();

  useEffect(() => {
    // This effect ensures that if a user directly navigates here without a session (e.g., not from a reset email link)
    // they get a message. The primary redirect logic is in AuthAndThemeProvider.
    if (!isAuthLoading && !session) {
      setMessage("Please use the password reset link from your email or log in first.");
      setIsError(true);
    }
  }, [session, isAuthLoading]);


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setMessage('');
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      setLoadingAction(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setIsError(true);
      setMessage(`Error updating password: ${error.message}`);
      console.error('Password update error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const panelBgClass = 'bg-white dark:bg-gray-800';
  const borderColorClass = 'border-gray-300 dark:border-gray-700';
  const inputBgClass = 'bg-gray-100 dark:bg-gray-700';
  const buttonBg = 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';

  // Show a loading state if authentication is still in progress
  if (isAuthLoading) {
    return (
        <div className={`min-h-screen flex items-center justify-center p-4`}>
            <p className="text-xl">Loading authentication state...</p>
        </div>
    );
  }

  // If not loading and no session, display a message and link to login
  if (!session) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4`}>
        <div className={`${panelBgClass} p-8 rounded-xl shadow-lg border ${borderColorClass} w-full max-w-md text-center`}>
          <h2 className="text-2xl font-bold mb-4 text-red-500">Authentication Required</h2>
          <p className="mb-6 text-gray-900 dark:text-gray-100">Please log in to update your password, or use the link from your password reset email.</p>
          <Link href="/auth/login" className={`${buttonBg} text-white font-bold py-3 px-6 rounded-lg shadow-md text-center inline-block`}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // If loading is complete and session exists, render the update password form
  return (
    <div className={`min-h-screen flex items-center justify-center p-4`}>
      <div className={`${panelBgClass} p-8 rounded-xl shadow-lg border ${borderColorClass} w-full max-w-md`}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Update Password</h2>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBgClass} text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBgClass} text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Confirm new password"
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
            {loadingAction ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-900 dark:text-gray-100">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
