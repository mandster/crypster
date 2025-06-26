// src/app/dashboard/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

// IMPORTANT: Removed the SettingsPageProps interface definition entirely.
// The page component should NOT expect props from the layout.

// Define the functional component with no props in its signature.
const SettingsPage: React.FC = () => { // <--- Changed from React.FC<SettingsPageProps>
  const router = useRouter();
  // Consume context for session, auth loading, theme, and toggleTheme
  const { session, isAuthLoading, theme: currentTheme, toggleTheme } = useAuthAndTheme();

  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteAccount = async () => {
    setLoadingAction(true);
    setMessage('');
    setIsError(false);

    try {
      // Direct client-side user deletion is often restricted by Supabase for security reasons
      // and typically requires re-authentication or a server-side service_role key.
      // For now, we'll inform the user how to proceed manually or through a future secure method.
      // const { error } = await supabase.auth.deleteUser(); // This line caused the TypeError

      // Simulate deletion success for UI feedback, or explicitly fail.
      // In a real app, you would make an API call to a backend route that uses the service_role key.
      if (session) {
        setMessage('Account deletion needs to be performed via the Supabase Dashboard for now, or will be enabled through a secure server-side method in the future.');
        setIsError(true); // Treat as an error because we can't complete it directly
      } else {
        setMessage('No active session found to delete an account.');
        setIsError(true);
      }

    } catch (error: any) {
      setIsError(true);
      setMessage(`Error during account deletion process: ${error.message}`);
      console.error('Account deletion error:', error);
    } finally {
      setLoadingAction(false);
      setShowConfirmModal(false);
    }
  };

  const panelBgClass = 'bg-white dark:bg-gray-800';
  const borderColorClass = 'border-gray-300 dark:border-gray-700';
  const buttonBg = 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
  const dangerButtonBg = 'bg-red-600 hover:bg-red-700';

  // The loading state based on `isAuthLoading` and `session` is now handled by the AuthContentWrapper in layout.tsx.
  // This page assumes it will only be rendered if authentication has been resolved.

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <div className={`${panelBgClass} p-8 rounded-xl shadow-lg border ${borderColorClass} w-full max-w-2xl text-center`}>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Customize your application experience.</p>

        {message && (
          <p className={`text-sm mb-4 ${isError ? 'text-red-500' : 'text-green-500'} text-center`}>
            {message}
          </p>
        )}

        {/* Theme Settings */}
        <div className="mb-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Display</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-900 dark:text-gray-100">Theme:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentTheme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </label>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Switch between dark and light themes for the application.
          </p>
        </div>

        {/* Notification Settings (Placeholder) */}
        <div className="mb-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Notifications</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-900 dark:text-gray-100">Email Notifications:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-900 dark:text-gray-100">In-App Alerts:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked={false} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            (These are placeholders. Functionality to send actual notifications would be built separately.)
          </p>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-4 rounded-lg border border-red-500 bg-red-900/20 text-red-300 mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Danger Zone</h3>
          <p className="mb-4 text-gray-900 dark:text-gray-100">
            Proceed with caution. Account deletion is permanent and cannot be undone.
            For security, account deletion must be handled via the Supabase Dashboard, or will be enabled via a dedicated server-side API route in the future.
          </p>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={loadingAction}
            className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${dangerButtonBg}
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Delete Account (Currently via Dashboard)
          </button>
        </div>

        {/* Confirmation Modal for Delete Account */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 text-center max-w-sm`}>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
              <p className="mb-6 text-gray-900 dark:text-gray-100">Are you sure you want to delete your account? This action cannot be undone. For security, deletion must be handled via the Supabase Dashboard or a server-side process.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteAccount} // This will now show the message, not delete
                  disabled={loadingAction}
                  className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${dangerButtonBg}
                    ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingAction ? 'Processing...' : 'Confirm (See Message Above)'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loadingAction}
                  className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${buttonBg}
                    ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <Link href="/" className="mt-8 inline-block text-blue-500 hover:underline">
          &larr; Back to Trading Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SettingsPage;
