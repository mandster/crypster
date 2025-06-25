// src/app/layout.tsx
'use client'; // This is a client component to use the context provider
// src/app/layout.tsx
'use client'; // This is a client component to use the context provider

import React, { ReactNode } from 'react';
import './globals.css';
import { AuthAndThemeProvider, useAuthAndTheme } from '@/context/AuthAndThemeProvider'; // Import the provider and hook
import Navbar from '@/components/ui/Navbar'; // Navbar will consume context directly


// RootLayout component defines the overall HTML structure
// RootLayout component defines the overall HTML structure
export default function RootLayout({
  children,
}: {
}: {
  children: React.ReactNode;
}) {
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/*
          Wrap the entire application content (Navbar + children pages)
          with the AuthAndThemeProvider.
          This ensures that any component within the AuthAndThemeProvider's tree
          can use the useAuthAndTheme hook.
        */}
        <AuthAndThemeProvider>
          {/*
            AuthContentWrapper is a helper component needed because Navbar itself
            also needs to consume the context. If Navbar were outside AuthAndThemeProvider,
            it would throw the same error.
          */}
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
 * This is nested inside AuthAndThemeProvider in RootLayout.
 * It also applies the base background and text colors for the entire content area.
 */
function AuthContentWrapper({ children }: { children: React.ReactNode }) {
  // Consume the context values needed by Navbar and potentially for styling the main content area
  const { session, isAuthLoading, toggleTheme, theme: currentTheme } = useAuthAndTheme();

  // Determine background and text color based on the current theme
  const bgColor = currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <>
      <Navbar
        // Navbar now receives props from AuthContentWrapper, which got them from context.
        // This is optional; Navbar could also use `useAuthAndTheme()` internally.
        // For clarity and to demonstrate passing, we'll keep it this way here.
        session={session}
        isAuthLoading={isAuthLoading}
        toggleTheme={toggleTheme}
        currentTheme={currentTheme}
      />
      {/* Apply base theme classes to the main content wrapper */}
      <main className={`min-h-screen ${bgColor} ${textColor} font-inter transition-colors duration-300`}>
        {children}
      </main>
    </>
  );
}
