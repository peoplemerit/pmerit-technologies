/**
 * Cryptographic Utilities Tests
 *
 * Tests for AES-256-GCM encryption, SHA-256 hashing, and PBKDF2 password hashing.
 * Validates roundtrip integrity and expected output formats.
 */

import { describe, it, expect } from 'vitest';
import {
  encryptAESGCM,
  decryptAESGCM,
  hashSHA256,
  hashPasswordPBKDF2,
  verifyPasswordPBKDF2,
} from '../src/utils/crypto';

describe('hashSHA256', () => {
  it('should produce a 64-character hex string', async () => {
    const hash = await hashSHA256('test-input');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should produce consistent output for the same input', async () => {
    const hash1 = await hashSHA256('hello-world');
    const hash2 = await hashSHA256('hello-world');
    expect(hash1).toBe(hash2);
  });

  it('should produce different output for different inputs', async () => {
    const hash1 = await hashSHA256('input-a');
    const hash2 = await hashSHA256('input-b');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', async () => {
    const hash = await hashSHA256('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('AES-256-GCM encryption', () => {
  const testKey = 'my-secret-encryption-key-32bytes';

  it('should encrypt and decrypt back to original plaintext', async () => {
    const plaintext = 'sk-ant-api03-secret-key-value';
    const encrypted = await encryptAESGCM(plaintext, testKey);
    const decrypted = await decryptAESGCM(encrypted, testKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce base64-encoded output', async () => {
    const encrypted = await encryptAESGCM('test', testKey);
    // Base64 characters only
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('should produce different ciphertext for the same plaintext (random IV)', async () => {
    const plaintext = 'same-input';
    const enc1 = await encryptAESGCM(plaintext, testKey);
    const enc2 = await encryptAESGCM(plaintext, testKey);
    expect(enc1).not.toBe(enc2);
  });

  it('should fail to decrypt with wrong key', async () => {
    const encrypted = await encryptAESGCM('secret-data', testKey);
    await expect(decryptAESGCM(encrypted, 'wrong-key-value')).rejects.toThrow();
  });

  it('should handle empty string plaintext', async () => {
    const encrypted = await encryptAESGCM('', testKey);
    const decrypted = await decryptAESGCM(encrypted, testKey);
    expect(decrypted).toBe('');
  });

  it('should handle long plaintext', async () => {
    const longText = 'a'.repeat(10000);
    const encrypted = await encryptAESGCM(longText, testKey);
    const decrypted = await decryptAESGCM(encrypted, testKey);
    expect(decrypted).toBe(longText);
  });

  it('should pad short keys to 32 bytes', async () => {
    const shortKey = 'short';
    const plaintext = 'test-value';
    const encrypted = await encryptAESGCM(plaintext, shortKey);
    const decrypted = await decryptAESGCM(encrypted, shortKey);
    expect(decrypted).toBe(plaintext);
  });
});

describe('PBKDF2 password hashing', () => {
  it('should return hash and salt as hex strings', async () => {
    const result = await hashPasswordPBKDF2('my-password');
    expect(result.hash).toMatch(/^[0-9a-f]{64}$/); // 256 bits = 64 hex chars
    expect(result.salt).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
  });

  it('should produce different salts for the same password', async () => {
    const result1 = await hashPasswordPBKDF2('same-password');
    const result2 = await hashPasswordPBKDF2('same-password');
    expect(result1.salt).not.toBe(result2.salt);
    expect(result1.hash).not.toBe(result2.hash);
  });

  it('should produce same hash with same password and salt', async () => {
    const result1 = await hashPasswordPBKDF2('my-password');
    const result2 = await hashPasswordPBKDF2('my-password', result1.salt);
    expect(result2.hash).toBe(result1.hash);
  });

  it('should verify correct password', async () => {
    const result = await hashPasswordPBKDF2('correct-password');
    const isValid = await verifyPasswordPBKDF2('correct-password', result.salt, result.hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const result = await hashPasswordPBKDF2('correct-password');
    const isValid = await verifyPasswordPBKDF2('wrong-password', result.salt, result.hash);
    expect(isValid).toBe(false);
  });

  it('should work with custom iteration count', async () => {
    const result = await hashPasswordPBKDF2('test-password', undefined, 1000);
    const isValid = await verifyPasswordPBKDF2('test-password', result.salt, result.hash, 1000);
    expect(isValid).toBe(true);
  });

  it('should fail verification with wrong iteration count', async () => {
    const result = await hashPasswordPBKDF2('test-password', undefined, 1000);
    const isValid = await verifyPasswordPBKDF2('test-password', result.salt, result.hash, 2000);
    expect(isValid).toBe(false);
  });
});
