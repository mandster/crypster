    // src/utils/supabaseClient.ts
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // These checks are good, but if env vars are truly missing on Vercel,
    // the build will error before this code even fully executes in the way you expect.
    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
    }
    if (!supabaseAnonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    