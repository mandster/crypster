// src/context/AuthAndThemeProvider.tsx
'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

// Define the shape of our context data
interface AuthAndThemeContextType {
  session: any | null;
  isAuthLoading: boolean;
  theme: string;
  toggleTheme: () => void;
}

// Create the context
const AuthAndThemeContext = createContext<AuthAndThemeContextType | undefined>(undefined);

// Props for the provider component
interface AuthAndThemeProviderProps {
  children: ReactNode;
}

/**
 * Provides global authentication and theme state to the application.
 * Manages Supabase session and theme persistence.
 * Handles redirection for unauthenticated users.
 */
export const AuthAndThemeProvider: React.FC<AuthAndThemeProviderProps> = ({ children }) => {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Tracks if initial auth check is complete
  const [theme, setTheme] = useState('dark'); // Default theme

  // Auth Listener
  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(currentSession);
      } catch (err) {
        console.error("AuthAndThemeProvider - Error getting session:", err);
        setSession(null);
      } finally {
        setIsAuthLoading(false); // Auth check completed
      }
    };

    checkSession();

    // Listen for auth state changes (e.g., login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthLoading(false); // Auth state changed, so loading is complete
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []); // Run only once on mount

  // Redirect Logic: Redirect to login if not authenticated after auth loading is complete
  useEffect(() => {
    if (!isAuthLoading && !session && window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/signup' && window.location.pathname !== '/auth/callback' && window.location.pathname !== '/auth/update-password') {
      router.push('/auth/login');
    }
  }, [isAuthLoading, session, router]);

  // Theme Toggle function
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  // Apply theme class to <html> element
  useEffect(() => {
    if (typeof document !== 'undefined') { // Ensure document is defined (client-side)
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]); // Rerun when theme changes

  // The value provided to components consuming this context
  const contextValue: AuthAndThemeContextType = {
    session,
    isAuthLoading,
    theme,
    toggleTheme,
  };

  return (
    <AuthAndThemeContext.Provider value={contextValue}>
      {children}
    </AuthAndThemeContext.Provider>
  );
};

/**
 * Custom hook to consume the authentication and theme context.
 * Throws an error if used outside of AuthAndThemeProvider.
 */
export const useAuthAndTheme = () => {
  const context = useContext(AuthAndThemeContext);
  if (context === undefined) {
    throw new Error('useAuthAndTheme must be used within an AuthAndThemeProvider');
  }
  return context;
};
