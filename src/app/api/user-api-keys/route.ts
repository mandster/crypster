// src/app/api/user-api-keys/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { encrypt, decrypt } from '@/utils/encryption'; // <-- This line needs 'decrypt' to be properly exported

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

/**
 * Handles GET requests to retrieve encrypted user API keys from Supabase.
 * This route requires authentication.
 */
export async function GET(request: Request) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Authentication error:', sessionError?.message || 'No active session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('encrypted_api_key, api_key_iv, encrypted_secret_key, secret_key_iv, exchange')
      .eq('user_id', session.user.id)
      .limit(1); // Assuming one key per user per exchange for now

    if (error) {
      console.error('Supabase error retrieving API keys:', error);
      return NextResponse.json({ error: 'Failed to retrieve API keys', details: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No API keys found for this user.' }, { status: 404 });
    }

    const decryptedApiKey = decrypt(data[0].encrypted_api_key, data[0].api_key_iv);
    const decryptedSecretKey = decrypt(data[0].encrypted_secret_key, data[0].secret_key_iv);

    return NextResponse.json({
      exchange: data[0].exchange,
      apiKey: decryptedApiKey,
      secretKey: decryptedSecretKey,
      message: "Decrypted keys sent. WARNING: Decrypting and sending secretKey to frontend is INSECURE for production apps."
    }, { status: 200 });

  } catch (error) {
    console.error('Error in API key retrieval route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
