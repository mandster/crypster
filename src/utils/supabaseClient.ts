// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// These checks will ensure that if the variables are NOT available at runtime,
// the app will explicitly throw an error rather than try to function without them.
// During the Next.js build process, these variables MUST be present in the build environment
// (via .env.local for local builds, and Vercel's Environment Variables for deployments).
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file and Vercel settings.');
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file and Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
