// src/utils/encryption.ts
import crypto from 'crypto';

// Ensure the encryption key is set as a server-side environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) { // 32 bytes for AES-256
  // In a real application, you might want to throw an error and prevent server start
  console.error('CRITICAL ERROR: ENCRYPTION_KEY is missing or not 32 characters long. API key encryption/decryption will fail.');
  // Using a dummy key for local dev if not set, but this is NOT secure for production
  // DO NOT USE THIS IN PRODUCTION IF THE KEY ISN'T PROPERLY SET
  // This is just to prevent immediate crashes if the user forgets the env var
  process.env.ENCRYPTION_KEY = ENCRYPTION_KEY || 'a'.repeat(32); // Fallback for dev, DO NOT USE IN PROD
}

const ALGORITHM = 'aes-256-cbc'; // AES 256-bit with CBC mode

/**
 * Encrypts a given text string.
 * @param text The string to encrypt.
 * @returns An object containing the encrypted content and the initialization vector (IV).
 */
export function encrypt(text: string) {
  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV for CBC mode
  // Ensure ENCRYPTION_KEY is treated as a Buffer
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'utf8'), iv);
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
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  // Ensure ENCRYPTION_KEY is treated as a Buffer
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'utf8'), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

