// src/app/dashboard/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider';

interface SettingsPageProps {
  sessionFromLayout: any | null;
  isAuthLoadingFromLayout: boolean;
  themeFromLayout: string;
  toggleThemeFromLayout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ sessionFromLayout, isAuthLoadingFromLayout, themeFromLayout, toggleThemeFromLayout }) => {
  const router = useRouter();
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
      const { error } = await supabase.auth.deleteUser();

      if (error) throw error;

      setMessage('Account successfully deleted. Redirecting...');
      setTimeout(() => {
        router.push('/auth/signup');
      }, 2000);
    } catch (error: any) {
      setIsError(true);
      setMessage(`Error deleting account: ${error.message}. If using Google, try logging in with email/password first.`);
      console.error('Account deletion error:', error);
    } finally {
      setLoadingAction(false);
      setShowConfirmModal(false);
    }
  };

  const bgColor = currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const panelBg = currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const buttonBg = currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
  const dangerButtonBg = 'bg-red-600 hover:bg-red-700';


  if (isAuthLoading || !session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor}`}>
        <p className="text-xl">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-4 sm:p-6 md:p-8 flex flex-col items-center`}>
      <div className={`${panelBg} p-8 rounded-xl shadow-lg border ${borderColor} w-full max-w-2xl text-center`}>
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-lg text-gray-400 mb-6">Customize your application experience.</p>

        {message && (
          <p className={`text-sm mb-4 ${isError ? 'text-red-500' : 'text-green-500'} text-center`}>
            {message}
          </p>
        )}

        {/* Theme Settings */}
        <div className="mb-8 p-4 rounded-lg bg-gray-700/50">
          <h3 className={`text-xl font-semibold mb-3 ${textColor}`}>Display</h3>
          <div className="flex justify-between items-center mb-4">
            <span className={textColor}>Theme:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentTheme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className={`ml-3 text-sm font-medium ${textColor}`}>
                {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </label>
          </div>
          <p className={`text-sm text-gray-400 mt-2 ${textColor}`}>
            Switch between dark and light themes for the application.
          </p>
        </div>

        {/* Notification Settings (Placeholder) */}
        <div className="mb-8 p-4 rounded-lg bg-gray-700/50">
          <h3 className={`text-xl font-semibold mb-3 ${textColor}`}>Notifications</h3>
          <div className="flex justify-between items-center mb-2">
            <span className={textColor}>Email Notifications:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex justify-between items-center">
            <span className={textColor}>In-App Alerts:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked={false} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className={`text-sm text-gray-400 mt-2 ${textColor}`}>
            (These are placeholders. Functionality to send actual notifications would be built separately.)
          </p>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-4 rounded-lg border border-red-500 bg-red-900/20 text-red-300 mb-8">
          <h3 className={`text-xl font-semibold mb-3 ${textColor}`}>Danger Zone</h3>
          <p className={`mb-4 ${textColor}`}>
            Proceed with caution. Account deletion is permanent and cannot be undone.
          </p>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={loadingAction}
            className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${dangerButtonBg}
              ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Delete Account
          </button>
        </div>

        {/* Confirmation Modal for Delete Account */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className={`${panelBg} p-8 rounded-xl shadow-lg border ${borderColor} text-center max-w-sm`}>
              <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>Confirm Deletion</h3>
              <p className={`mb-6 ${textColor}`}>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loadingAction}
                  className={`py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 shadow-md ${dangerButtonBg}
                    ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingAction ? 'Deleting...' : 'Yes, Delete My Account'}
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
