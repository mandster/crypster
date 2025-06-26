// src/app/layout.tsx
'use client';

import React, { ReactNode } from 'react';
import './globals.css';
import { AuthAndThemeProvider, useAuthAndTheme } from '@/context/AuthAndThemeProvider';
import Navbar from '@/components/ui/Navbar';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthAndThemeProvider>
          <AuthContentWrapper>
            {children}
          </AuthContentWrapper>
        </AuthAndThemeProvider>
      </body>
    </html>
  );
}

function AuthContentWrapper({ children }: { children: ReactNode }) {
  const { session, isAuthLoading, toggleTheme, theme: currentTheme } = useAuthAndTheme();

  const bgColor = currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <>
      <Navbar
        session={session}
        isAuthLoading={isAuthLoading}
        toggleTheme={toggleTheme}
        currentTheme={currentTheme}
      />
      <main className={`min-h-screen ${bgColor} ${textColor} font-inter transition-colors duration-300`}>
        {children}
      </main>
    </>
  );
}
