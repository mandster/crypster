// src/app/layout.tsx
'use client'; // This is a client component to use the context provider

import React, { ReactNode } from 'react';
import './globals.css';
import { AuthAndThemeProvider, useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import Navbar from '@/components/ui/Navbar';


// RootLayout component defines the overall HTML structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Wrap the entire application content with the AuthAndThemeProvider */}
        <AuthAndThemeProvider>
          {/* AuthContentWrapper ensures Navbar and children are within the context */}
          <AuthContentWrapper>
            {children}
          </AuthContentWrapper>
        </AuthAndThemeProvider>
      </body>
    </html>
  );
}

/**
 * Helper component to render Navbar and children, consuming the AuthAndThemeContext.
 * This component will manage the display of a loading screen for the main content
 * until the authentication state is resolved.
 */
function AuthContentWrapper({ children }: { children: React.ReactNode }) {
  // We still need to get context values here if they are used by the <main> element's styling
  const { session, isAuthLoading, toggleTheme, theme: currentTheme } = useAuthAndTheme();

  // Base background and text colors for the entire content area, using Tailwind's dark variants
  const baseBgClass = 'bg-gray-50 dark:bg-gray-900';
  const baseTextColorClass = 'text-gray-900 dark:text-gray-100';

  return (
    <>
      <Navbar
        // IMPORTANT: Removed explicit prop passing.
        // Navbar should now get session, isAuthLoading, toggleTheme, currentTheme
        // directly from `useAuthAndTheme()` hook within its own component.
      />
      <main className={`min-h-[calc(100vh-64px)] ${baseBgClass} ${baseTextColorClass} font-inter transition-colors duration-300`}>
        {/* Conditional rendering of children based on auth loading state */}
        {isAuthLoading ? (
          // Show a full-screen loading indicator while authentication state is resolving
          <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
            <p className="text-xl">Initializing application...</p>
          </div>
        ) : (
          // Once authentication loading is complete, render the actual page content
          children
        )}
      </main>
    </>
  );
}
