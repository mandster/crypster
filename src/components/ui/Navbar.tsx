// src/components/Navbar.tsx (Example - ensure yours looks like this)
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuthAndTheme } from '@/context/AuthAndThemeProvider'; // This is crucial


const Navbar: React.FC = () => { // NO PROPS HERE
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, isAuthLoading, toggleTheme, theme: currentTheme } = useAuthAndTheme(); // <<-- Gets everything from context

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show a message to the user
    } finally {
      setIsMobileMenuOpen(false); // Close menu on logout
    }
  };

  // Tailwind classes based on theme
  const bgColor = currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const hoverColor = currentTheme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-700';
  const toggleButtonBg = currentTheme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900';

  return (
    <nav className={`p-4 shadow-md ${bgColor} ${textColor} sticky top-0 z-50`}>
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        {/* Logo/Home Link */}
        <Link href="/" className="text-2xl font-bold rounded-md px-2 py-1 transition-colors duration-200 hover:bg-gray-700 hover:text-white">
          Crypster
        </Link>

        {/* Mobile menu button (Hamburger icon) */}
        <div className="flex items-center lg:hidden">
            {/* Theme Toggle for Mobile (always visible, aligned right) */}
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-full shadow-sm transition-all duration-300 focus:outline-none ${toggleButtonBg} mr-3`}
                title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2 rounded-md"
                aria-label="Toggle navigation menu"
            >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                    // X icon when menu is open
                    <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414L12 13.414l-4.864 4.864a1 1 0 =0 1-1.414-1.414L10.586 12 5.722 7.136a1 1 0 0 1 1.414-1.414L12 10.586l4.864-4.864a1 1 0 0 1 1.414 1.414L13.414 12l4.864 4.864z"
                    />
                ) : (
                    // Hamburger icon when menu is closed
                    <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 0 0 1 0 2H4a1 1 0 1 1 0-2z"
                    />
                )}
                </svg>
            </button>
        </div>

        {/* Navigation Links (Desktop and Mobile expanded) */}
        <div
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } w-full lg:flex lg:items-center lg:w-auto mt-4 lg:mt-0`}
        >
          <ul className="lg:flex items-center justify-between text-base pt-4 lg:pt-0">
            {/* Conditional rendering based on authentication status */}
            {!isAuthLoading && session ? (
              <>
                <li>
                  <Link href="/dashboard/api-keys" className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 py-2 px-3 rounded-md ${hoverColor} transition-colors duration-200`} onClick={() => setIsMobileMenuOpen(false)}>
                    API Keys
                  </Link>
                </li>
                <li>
                  {/* Corrected href for Account page */}
                  <Link href="/dashboard/account" className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 py-2 px-3 rounded-md ${hoverColor} transition-colors duration-200`} onClick={() => setIsMobileMenuOpen(false)}>
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 py-2 px-3 rounded-md ${hoverColor} transition-colors duration-200`} onClick={() => setIsMobileMenuOpen(false)}>
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 text-red-400 hover:text-red-300 transition-colors duration-200 text-sm py-1 px-2 rounded-md`}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/login" className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 py-2 px-3 rounded-md ${hoverColor} transition-colors duration-200`} onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 py-2 px-3 rounded-md ${hoverColor} transition-colors duration-200`} onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            {/* Theme Toggle Button (hidden on desktop, always visible for mobile next to hamburger) */}
            <li className="hidden lg:block"> {/* Hide this li on desktop, as it's next to the hamburger for mobile */}
                <button
                onClick={toggleTheme}
                className={`block lg:inline-block mt-4 lg:mt-0 lg:ml-6 p-2 rounded-full shadow-sm transition-all duration-300 focus:outline-none ${toggleButtonBg}`}
                title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                {currentTheme === 'dark' ? '☀️' : '🌙'}
                </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
