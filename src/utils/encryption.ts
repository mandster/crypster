// src/utils/encryption.ts
import crypto from 'crypto';

// Ensure the encryption key is set as a server-side environment variable
// It MUST be exactly 32 characters long for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Fallback for development if ENCRYPTION_KEY is not set or not 32 chars.
// This is for local development convenience ONLY and is NOT secure for production.
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error('CRITICAL WARNING: ENCRYPTION_KEY is missing or not 32 characters long. Using an insecure fallback for development. DO NOT DEPLOY TO PRODUCTION WITHOUT A PROPER KEY.');
  // Using a dummy key for local dev if not set, but this is NOT secure for production
  process.env.ENCRYPTION_KEY = ENCRYPTION_KEY || 'a'.repeat(32); // Fallback for dev
}

const ALGORITHM = 'aes-256-cbc'; // AES 256-bit with CBC mode

/**
 * Encrypts a given text string.
 * @param text The string to encrypt.
 * @returns An object containing the encrypted content and the initialization vector (IV).
 */
export function encrypt(text: string) {
  // Ensure the ENCRYPTION_KEY is used as a Buffer and is valid
  const key = Buffer.from(process.env.ENCRYPTION_KEY as string, 'utf8');
  if (key.length !== 32) {
      throw new Error("Encryption key must be 32 bytes for AES-256.");
  }
  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV for CBC mode
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

/**
 * Decrypts an encrypted text string.
 * @param encryptedData The encrypted content in hexadecimal format.
 * @param iv Hexadecimal representation of the Initialization Vector.
 * @returns The decrypted string.
 */
export function decrypt(encryptedData: string, iv: string) {
  // Ensure the ENCRYPTION_KEY is used as a Buffer and is valid
  const key = Buffer.from(process.env.ENCRYPTION_KEY as string, 'utf8');
  if (key.length !== 32) {
      throw new Error("Decryption key must be 32 bytes for AES-256.");
  }
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
