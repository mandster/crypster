// src/app/api/user-api-keys/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { encrypt, decrypt } from '@/utils/encryption'; // <-- This line needs 'decrypt' to be properly exported
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createServerComponentClient({ cookies });

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Your logic to fetch user-specific API keys here
    return new Response(JSON.stringify({ apiKey: 'example' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error fetching API keys:', err);
    return new Response(JSON.stringify({ message: 'Server Error' }), {
      status: 500,
    });
  }
}

/**
 * Handles POST requests to store encrypted user API keys in Supabase.
 * This route requires authentication.
 */
export async function POST(request: Request) {
  try {
    // 1. Get the authenticated user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Authentication error:', sessionError?.message || 'No active session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey, secretKey, exchange } = await request.json();

    if (!apiKey || !secretKey || !exchange) {
      return NextResponse.json({ error: 'Missing API key, secret key, or exchange' }, { status: 400 });
    }

    // 2. Encrypt the API Key and Secret Key
    const encryptedApiKey = encrypt(apiKey);
    const encryptedSecretKey = encrypt(secretKey);

    // 3. Store the encrypted keys (and their IVs) in Supabase
    // We'll update an existing entry if it exists for the user/exchange, otherwise insert
    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert(
        {
          user_id: session.user.id,
          exchange: exchange,
          encrypted_api_key: encryptedApiKey.encryptedData,
          api_key_iv: encryptedApiKey.iv, // Store IV to decrypt later
          encrypted_secret_key: encryptedSecretKey.encryptedData,
          secret_key_iv: encryptedSecretKey.iv, // Store IV to decrypt later
        },
        {
          onConflict: 'user_id, exchange', // Update if user_id and exchange already exist
          ignoreDuplicates: false
        }
      )
      .select(); // Select the data after upsert to confirm

    if (error) {
      console.error('Supabase error storing API keys:', error);
      return NextResponse.json({ error: 'Failed to store API keys', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'API keys stored successfully', data: data[0] }, { status: 200 });

  } catch (error) {
    console.error('Error in API key storage route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

