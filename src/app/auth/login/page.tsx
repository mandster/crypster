// src/app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage('Login successful!');
      router.push('/');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const theme = 'dark';
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const panelBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
  const googleButtonBg = theme === 'dark' ? 'bg-white text-black' : 'bg-white text-black';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} p-4`}>
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${panelBg}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${textColor}`}>Login to Your Account</h2>

        {message && (
          <p className={`mb-4 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${textColor}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded ${inputBg} ${textColor} focus:outline-none`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${textColor}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded ${inputBg} ${textColor} focus:outline-none`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg ${buttonBg} transition-all duration-200`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${borderColor}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`${panelBg} px-2 ${textColor}`}>Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-md border border-gray-300 ${loading ? 'opacity-50 cursor-not-allowed' : googleButtonBg}`}
        >
          <FcGoogle className="text-2xl" />
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
