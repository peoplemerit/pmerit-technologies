/**
 * Shared Cryptographic Utilities — HANDOFF-COPILOT-AUDIT-01
 *
 * Centralized crypto functions for the AIXORD Router Worker.
 * Extracted from github.ts (AES-GCM) and extended with PBKDF2.
 *
 * Exports:
 * - encryptAESGCM / decryptAESGCM — AES-256-GCM encryption at rest
 * - hashSHA256                     — One-way SHA-256 hash (hex)
 * - hashPasswordPBKDF2             — PBKDF2 password hashing (100k iterations)
 * - verifyPasswordPBKDF2           — PBKDF2 password verification
 *
 * All functions use the Web Crypto API (available in Cloudflare Workers).
 */

// =============================================================================
// AES-256-GCM ENCRYPTION
// =============================================================================

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt
 * @param key       - Encryption key (will be padded/trimmed to 32 bytes)
 * @returns Base64-encoded ciphertext (12-byte IV prepended)
 */
export async function encryptAESGCM(plaintext: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(plaintext)
  );

  // Combine IV + ciphertext and base64 encode
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt AES-256-GCM ciphertext.
 *
 * @param ciphertext - Base64-encoded ciphertext (12-byte IV prepended)
 * @param key        - Encryption key (same key used for encryption)
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong key, corrupted data, or not encrypted)
 */
export async function decryptAESGCM(ciphertext: string, key: string): Promise<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  // Decode base64
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );

  return decoder.decode(decrypted);
}

// =============================================================================
// SHA-256 HASHING
// =============================================================================

/**
 * Hash a string using SHA-256.
 *
 * @param input - String to hash
 * @returns Hex-encoded SHA-256 digest
 */
export async function hashSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================================================
// PBKDF2 PASSWORD HASHING
// =============================================================================

/** PBKDF2 hash result */
export interface PBKDF2Result {
  hash: string;  // Hex-encoded derived key
  salt: string;  // Hex-encoded salt
}

/**
 * Hash a password using PBKDF2 with SHA-256.
 *
 * @param password   - The password to hash
 * @param salt       - Hex-encoded salt (or undefined to generate a new one)
 * @param iterations - Number of PBKDF2 iterations (default: 100,000)
 * @returns Hash and salt as hex strings
 */
export async function hashPasswordPBKDF2(
  password: string,
  salt?: string,
  iterations: number = 100_000
): Promise<PBKDF2Result> {
  const encoder = new TextEncoder();

  // Generate or decode salt
  let saltBytes: Uint8Array;
  if (salt) {
    // Decode hex salt
    saltBytes = new Uint8Array(
      salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
  } else {
    // Generate 16-byte random salt
    saltBytes = crypto.getRandomValues(new Uint8Array(16));
  }

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive 256-bit key
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 32 bytes
  );

  // Convert to hex
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const saltArray = Array.from(saltBytes);
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { hash: hashHex, salt: saltHex };
}

/**
 * Verify a password against a stored PBKDF2 hash.
 *
 * @param password   - The password to verify
 * @param salt       - Hex-encoded salt from storage
 * @param storedHash - Hex-encoded hash from storage
 * @param iterations - Number of PBKDF2 iterations (must match original)
 * @returns true if password matches
 */
export async function verifyPasswordPBKDF2(
  password: string,
  salt: string,
  storedHash: string,
  iterations: number = 100_000
): Promise<boolean> {
  const result = await hashPasswordPBKDF2(password, salt, iterations);
  return result.hash === storedHash;
}
