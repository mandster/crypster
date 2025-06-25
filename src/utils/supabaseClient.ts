// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your .env.local file.");
  // Handle this error appropriately in a production environment (e.g., crash the app or show a prominent error)
  // For development, we'll allow it to proceed but log the error.
}

// Create and export the Supabase client instance
// This client can be used for both authentication and database interactions
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

