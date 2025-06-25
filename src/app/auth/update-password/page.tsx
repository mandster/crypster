// src/app/auth/update-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider'; // Import useAuthAndTheme hook

const UpdatePasswordPage: React.FC = () => { // No longer accepts props
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const { session, isAuthLoading, theme } = useAuthAndTheme(); // Consume context

  // Basic check for session to ensure user is in a valid state to update password
  useEffect(() => {
    // This page specifically relies on a session being present from a password reset email link
    // or a recent re-authentication. The context `session` helps confirm overall login status.
    if (!isAuthLoading && !session) {
      setMessage("Please use the password reset link from your email.");
      setIsError(true);
      // Optionally redirect after a delay if no valid session is found
      // setTimeout(() => router.push('/auth/login'), 3000);
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
      // This function works only if the user is currently authenticated via the password reset flow
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000); // Redirect to login after successful update
    } catch (error: any) {
      setIsError(true);
      setMessage(`Error updating password: ${error.message}`);
      console.error('Password update error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Tailwind classes based on theme from context
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const panelBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';

  // If auth is loading, render a loading state
  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor}`}>
        <p>Loading page...</p>
      </div>
    );
  }

  // If auth loading is complete and no session, we show error message or redirect (handled by useEffect)
  if (!session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor} transition-colors duration-300 p-4`}>
        <div className={`${panelBg} p-8 rounded-xl shadow-lg border ${borderColor} w-full max-w-md text-center`}>
          <h2 className="text-2xl font-bold mb-4 text-red-500">Authentication Required</h2>
          <p className="mb-6">Please log in to update your password, or use the link from your password reset email.</p>
          <Link href="/auth/login" className={`${buttonBg} text-white font-bold py-3 px-6 rounded-lg shadow-md text-center inline-block`}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor} transition-colors duration-300 p-4`}>
      <div className={`${panelBg} p-8 rounded-xl shadow-lg border ${borderColor} w-full max-w-md`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Update Password</h2>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

        <p className="text-center text-sm mt-6">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
