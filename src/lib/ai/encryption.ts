// ============================================================================
// AI API Key Encryption — AES-256-GCM
// ============================================================================
// Encrypts org API keys before storing in database.
// Requires AI_ENCRYPTION_KEY env var (32-byte hex string = 64 hex characters).
//
// Format: base64(iv:authTag:ciphertext)
// ============================================================================

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.AI_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'AI_ENCRYPTION_KEY environment variable is required. ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32) {
    throw new Error(
      'AI_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  return buf;
}

/**
 * Encrypt a plaintext API key for storage.
 * Returns a base64 string containing iv + authTag + ciphertext.
 */
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: iv (16) + authTag (16) + ciphertext (variable)
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypt a stored API key.
 * Expects the base64 format produced by encryptApiKey().
 */
export function decryptApiKey(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const packed = Buffer.from(encryptedBase64, 'base64');

  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid encrypted API key format');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
