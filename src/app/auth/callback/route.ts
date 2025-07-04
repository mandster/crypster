import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('Callback params:', { code, next });

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Supabase auth error:', error);
        return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url));
      }

      // Validate next path
      if (!next.startsWith('/') || next.includes('..')) {
        console.warn('Invalid next path:', next);
        return NextResponse.redirect(new URL('/error?message=Invalid redirect path', request.url));
      }

      return NextResponse.redirect(new URL(next, request.url));
    } catch (err) {
      console.error('Callback error:', err);
      return NextResponse.redirect(new URL('/error?message=Unexpected error during authentication', request.url));
    }
  }

  return NextResponse.redirect(new URL('/error?message=Invalid auth callback', request.url));
}