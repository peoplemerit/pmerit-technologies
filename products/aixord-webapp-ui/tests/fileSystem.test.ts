/**
 * Tests for fileSystem.ts — verifyPermission and isHandleUsable hardening
 *
 * These tests verify that FSAPI handle operations never crash the browser,
 * even when handles are stale after OAuth redirects.
 */
import { describe, it, expect, vi } from 'vitest';
import { verifyPermission, isHandleUsable } from '../src/lib/fileSystem';

// Helper to create a mock FileSystemDirectoryHandle
function createMockHandle(overrides: {
  queryPermission?: () => Promise<PermissionState>;
  requestPermission?: () => Promise<PermissionState>;
} = {}): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    name: 'test-folder',
    isSameEntry: vi.fn(),
    queryPermission: overrides.queryPermission ?? vi.fn().mockResolvedValue('granted'),
    requestPermission: overrides.requestPermission ?? vi.fn().mockResolvedValue('granted'),
    getDirectoryHandle: vi.fn(),
    getFileHandle: vi.fn(),
    removeEntry: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    resolve: vi.fn(),
  } as unknown as FileSystemDirectoryHandle;
}

describe('verifyPermission', () => {
  it('returns true when queryPermission returns granted', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('granted'),
    });
    expect(await verifyPermission(handle, true)).toBe(true);
  });

  it('returns true when requestPermission returns granted after query returns prompt', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('prompt'),
      requestPermission: vi.fn().mockResolvedValue('granted'),
    });
    expect(await verifyPermission(handle, true)).toBe(true);
  });

  it('returns false when both query and request return denied', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('denied'),
      requestPermission: vi.fn().mockResolvedValue('denied'),
    });
    expect(await verifyPermission(handle, false)).toBe(false);
  });

  it('returns false (not crash) when queryPermission throws (stale handle)', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockRejectedValue(new DOMException('Handle is stale')),
    });
    // This must NOT throw — it must return false
    expect(await verifyPermission(handle, true)).toBe(false);
  });

  it('returns false (not crash) when requestPermission throws', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('prompt'),
      requestPermission: vi.fn().mockRejectedValue(new Error('Browser crashed')),
    });
    expect(await verifyPermission(handle, true)).toBe(false);
  });

  it('returns false (not crash) when both throw', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockRejectedValue(new Error('Stale')),
      requestPermission: vi.fn().mockRejectedValue(new Error('Stale')),
    });
    expect(await verifyPermission(handle, true)).toBe(false);
  });
});

describe('isHandleUsable', () => {
  it('returns true when queryPermission returns granted', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('granted'),
    });
    expect(await isHandleUsable(handle)).toBe(true);
  });

  it('returns true when queryPermission returns prompt', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('prompt'),
    });
    expect(await isHandleUsable(handle)).toBe(true);
  });

  it('returns false when queryPermission returns denied', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockResolvedValue('denied'),
    });
    expect(await isHandleUsable(handle)).toBe(false);
  });

  it('returns false (not crash) when queryPermission throws (stale handle)', async () => {
    const handle = createMockHandle({
      queryPermission: vi.fn().mockRejectedValue(new DOMException('Stale handle')),
    });
    expect(await isHandleUsable(handle)).toBe(false);
  });
});
