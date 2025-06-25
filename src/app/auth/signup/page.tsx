// src/app/auth/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setMessage('Sign up successful! Please check your email to confirm your account.');
        setEmail('');
        setPassword('');
      } else {
        setMessage('An unexpected error occurred during sign up.');
        setIsError(true);
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tailwind classes for themes (reusing from HomePage for consistency)
  const theme = 'dark'; // For auth pages, we can fix a theme or pass it down
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const panelBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';


  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} ${textColor} transition-colors duration-300 p-4`}>
      <div className={`${panelBg} p-8 rounded-xl shadow-lg border ${borderColor} w-full max-w-md`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="your@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="********"
            />
          </div>

          {message && (
            <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'} text-center`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all duration-200 shadow-md
              ${loading ? 'opacity-50 cursor-not-allowed' : buttonBg}`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
