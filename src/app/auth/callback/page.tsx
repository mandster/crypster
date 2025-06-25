// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect runs when the page loads, specifically after Supabase redirects here
    // with the session information in the URL hash or query parameters.
    const handleAuthCallback = async () => {
      // Supabase's onAuthStateChange listener in layout/page.tsx will handle the session
      // For OAuth, Supabase client automatically processes the URL hash.
      // We just need to ensure the session is handled and then redirect.

      // You can explicitly check for a session here if needed,
      // but often, simply redirecting after the client has had a chance
      // to process the URL is sufficient.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // If a session is found, authentication was successful.
        // Redirect to the home page or dashboard.
        router.push('/');
      } else {
        // If no session after callback, there might have been an error or
        // the user closed the OAuth window. Redirect to login.
        console.error("No session found after OAuth callback. Redirecting to login.");
        router.push('/auth/login');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]); // Dependencies ensure effect re-runs if params change

  // Optional: Display a loading message while processing the callback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Processing authentication...</p>
    </div>
  );
};

export default AuthCallbackPage;
