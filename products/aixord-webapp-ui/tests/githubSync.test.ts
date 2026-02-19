/**
 * Tests for githubSync.ts — hardened permission checks in push/sync
 *
 * Verifies that pushLocalToGitHub and syncGitHubToWorkspace throw
 * descriptive errors (not browser crashes) when FSAPI handles are stale.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fileSystem module
vi.mock('../src/lib/fileSystem', () => ({
  fileSystemStorage: {
    getHandle: vi.fn(),
  },
  createFile: vi.fn(),
  createDirectory: vi.fn(),
  verifyPermission: vi.fn(),
}));

// Mock API module
vi.mock('../src/lib/api/evidence-knowledge', () => ({
  githubApi: {
    getTree: vi.fn(),
    getFile: vi.fn(),
    commitFiles: vi.fn(),
  },
}));

import { pushLocalToGitHub, syncGitHubToWorkspace } from '../src/lib/githubSync';
import { fileSystemStorage, verifyPermission } from '../src/lib/fileSystem';

const mockGetHandle = vi.mocked(fileSystemStorage.getHandle);
const mockVerifyPermission = vi.mocked(verifyPermission);

const mockHandle = {
  kind: 'directory',
  name: 'test-folder',
  entries: vi.fn(),
  queryPermission: vi.fn(),
  requestPermission: vi.fn(),
} as unknown as FileSystemDirectoryHandle;

const mockLinkedFolder = {
  id: 'folder_test-project',
  projectId: 'test-project',
  name: 'test-folder',
  linkedAt: new Date().toISOString(),
  handle: mockHandle,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('pushLocalToGitHub', () => {
  it('returns error result when no folder is linked', async () => {
    mockGetHandle.mockResolvedValue(null);

    const result = await pushLocalToGitHub('test-project', 'token-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No workspace folder linked');
  });

  it('returns descriptive error (not crash) when permission denied on stale handle', async () => {
    mockGetHandle.mockResolvedValue(mockLinkedFolder);
    mockVerifyPermission.mockResolvedValue(false);

    const result = await pushLocalToGitHub('test-project', 'token-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('permission lost');
    expect(result.error).toContain('re-link');
  });

  it('proceeds when permission is granted', async () => {
    mockGetHandle.mockResolvedValue(mockLinkedFolder);
    mockVerifyPermission.mockResolvedValue(true);
    // entries() returns empty iterator — no files to push
    mockHandle.entries = vi.fn().mockReturnValue({
      [Symbol.asyncIterator]: () => ({
        next: vi.fn().mockResolvedValue({ done: true }),
      }),
    }) as unknown as () => AsyncIterableIterator<[string, FileSystemHandle]>;

    const result = await pushLocalToGitHub('test-project', 'token-123');
    expect(result.success).toBe(true);
    expect(result.filesCommitted).toBe(0);
  });
});

describe('syncGitHubToWorkspace', () => {
  it('returns error result when no folder is linked', async () => {
    mockGetHandle.mockResolvedValue(null);
    const onProgress = vi.fn();

    const result = await syncGitHubToWorkspace('test-project', 'token-123', onProgress);
    expect(result.errors).toBeGreaterThan(0);
    expect(result.errorDetails).toEqual(
      expect.arrayContaining([expect.stringContaining('No workspace folder linked')])
    );
  });

  it('returns descriptive error (not crash) when permission denied on stale handle', async () => {
    mockGetHandle.mockResolvedValue(mockLinkedFolder);
    mockVerifyPermission.mockResolvedValue(false);
    const onProgress = vi.fn();

    const result = await syncGitHubToWorkspace('test-project', 'token-123', onProgress);
    expect(result.errors).toBeGreaterThan(0);
    expect(result.errorDetails).toEqual(
      expect.arrayContaining([expect.stringContaining('permission lost')])
    );
  });
});
