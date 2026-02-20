/**
 * File Detection Tests — S2-T6
 *
 * Tests the file reference detection pipeline (fileDetection.ts).
 * These tests verify NLP-based detection patterns and the full
 * detectAndResolveFiles pipeline.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectFileReferences, detectAndResolveFiles } from '../src/lib/fileDetection';
import { fileSystemStorage, readFileContent } from '../src/lib/fileSystem';

// Mock fileSystem module (FSAPI is not available in test env)
vi.mock('../src/lib/fileSystem', () => ({
  fileSystemStorage: {
    getHandle: vi.fn(),
  },
  readFileContent: vi.fn(),
  isTextFile: vi.fn().mockReturnValue(true),
  verifyPermission: vi.fn().mockResolvedValue(true),
}));

describe('detectFileReferences', () => {
  it('detects "read README.md" → high confidence natural_reference', () => {
    const result = detectFileReferences('please read README.md and tell me about it');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const readmeRef = result.find(r => r.filename === 'README.md');
    expect(readmeRef).toBeDefined();
    expect(readmeRef!.path).toBe('README.md');
    expect(readmeRef!.extension).toBe('md');
    // Natural language "read" prefix should yield high or medium confidence
    expect(['high', 'medium']).toContain(readmeRef!.confidence);
  });

  it('detects explicit path "check src/index.ts" → explicit_path', () => {
    const result = detectFileReferences('can you check src/index.ts for errors');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const indexRef = result.find(r => r.path === 'src/index.ts');
    expect(indexRef).toBeDefined();
    expect(indexRef!.filename).toBe('index.ts');
    expect(indexRef!.extension).toBe('ts');
    expect(indexRef!.matchType).toBe('explicit_path');
    expect(indexRef!.confidence).toBe('high');
  });

  it('detects quoted filenames like "package.json"', () => {
    const result = detectFileReferences('look at "package.json" for dependencies');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const pkgRef = result.find(r => r.filename === 'package.json');
    expect(pkgRef).toBeDefined();
    expect(pkgRef!.extension).toBe('json');
  });

  it('detects quoted filenames with spaces like "Pantry Restock App v2.md"', () => {
    const result = detectFileReferences('Verify "Pantry Restock App v2.md"');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const pantryRef = result.find(r => r.filename === 'Pantry Restock App v2.md');
    expect(pantryRef).toBeDefined();
    expect(pantryRef!.extension).toBe('md');
    expect(pantryRef!.matchType).toBe('quoted_file');
    expect(pantryRef!.confidence).toBe('high');
  });

  it('detects backtick filenames like `utils.ts`', () => {
    const result = detectFileReferences('open the file `utils.ts` and review it');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const utilsRef = result.find(r => r.filename === 'utils.ts');
    expect(utilsRef).toBeDefined();
    expect(utilsRef!.extension).toBe('ts');
  });

  it('returns empty array for messages with no file references', () => {
    const result = detectFileReferences('help me brainstorm ideas for a pantry app');
    expect(result).toEqual([]);
  });

  it('deduplicates repeated references to the same file', () => {
    const result = detectFileReferences('compare src/index.ts with src/index.ts changes');
    const indexRefs = result.filter(r => r.path === 'src/index.ts');
    expect(indexRefs.length).toBe(1);
  });

  it('filters false positives like "e.g." and "i.e."', () => {
    const result = detectFileReferences('For example e.g. something, i.e. another thing');
    const falsePositives = result.filter(r => ['e.g.', 'i.e.'].includes(r.raw));
    expect(falsePositives.length).toBe(0);
  });

  it('detects long filenames with underscores', () => {
    const result = detectFileReferences('review AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md');
    expect(result.length).toBeGreaterThanOrEqual(1);
    const ref = result.find(r => r.filename === 'AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md');
    expect(ref).toBeDefined();
    expect(ref!.extension).toBe('md');
  });
});

describe('detectAndResolveFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty result when no file references detected', async () => {
    const result = await detectAndResolveFiles('hello world', 'project-1');
    expect(result.detected).toEqual([]);
    expect(result.resolved).toEqual([]);
    expect(result.contextString).toBe('');
    expect(result.injectedCount).toBe(0);
  });

  it('returns empty resolved when workspace is not bound', async () => {
    (fileSystemStorage.getHandle as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await detectAndResolveFiles('read README.md', 'project-1');
    expect(result.detected.length).toBeGreaterThanOrEqual(1);
    expect(result.resolved).toEqual([]);
    expect(result.injectedCount).toBe(0);
  });

  it('returns contextString with file content when workspace bound', async () => {
    // Mock workspace handle
    const mockDirHandle = {
      kind: 'directory',
      name: 'project',
      getFileHandle: vi.fn().mockResolvedValue({
        kind: 'file',
        name: 'README.md',
        getFile: vi.fn().mockResolvedValue({
          text: vi.fn().mockResolvedValue('# My Project\n\nHello world'),
          size: 28,
          lastModified: Date.now(),
        }),
      }),
    };
    (fileSystemStorage.getHandle as ReturnType<typeof vi.fn>).mockResolvedValue({
      handle: mockDirHandle,
    });

    // Mock readFileContent to return file content
    (readFileContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: '# My Project\n\nHello world',
      name: 'README.md',
      size: 28,
      lastModified: Date.now(),
      type: 'text/markdown',
    });

    const result = await detectAndResolveFiles('read README.md', 'project-1');
    expect(result.detected.length).toBeGreaterThanOrEqual(1);
    expect(result.injectedCount).toBeGreaterThanOrEqual(1);
    expect(result.contextString).toContain('WORKSPACE FILES');
    expect(result.contextString).toContain('README.md');
  });

  it('detects quoted filenames with spaces when workspace bound', async () => {
    // Mock workspace handle that has the file in root
    const mockDirHandle = {
      kind: 'directory',
      name: 'project',
      getFileHandle: vi.fn().mockResolvedValue({
        kind: 'file',
        name: 'Pantry Restock App v2.md',
        getFile: vi.fn().mockResolvedValue({
          text: vi.fn().mockResolvedValue('# Pantry Restock App v2'),
          size: 24,
          lastModified: Date.now(),
        }),
      }),
    };
    (fileSystemStorage.getHandle as ReturnType<typeof vi.fn>).mockResolvedValue({
      handle: mockDirHandle,
    });

    (readFileContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: '# Pantry Restock App v2',
      name: 'Pantry Restock App v2.md',
      size: 24,
      lastModified: Date.now(),
      type: 'text/markdown',
    });

    const result = await detectAndResolveFiles(
      'Verify "Pantry Restock App v2.md"',
      'project-1'
    );
    expect(result.detected.length).toBeGreaterThanOrEqual(1);
    expect(result.injectedCount).toBeGreaterThanOrEqual(1);
    expect(result.contextString).toContain('Pantry Restock App v2.md');
  });

  it('resolves bare filename from subdirectory via Fallback B', async () => {
    // File is NOT in root, but IS in a "docs" subdirectory
    // This tests the exact bug where segments.length===1 skipped Fallback B
    const mockDocsDir = {
      kind: 'directory' as const,
      name: 'docs',
      getFileHandle: vi.fn().mockResolvedValue({
        kind: 'file',
        name: 'AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md',
        getFile: vi.fn().mockResolvedValue({
          text: vi.fn().mockResolvedValue('# AIXORD Baseline v4.6'),
          size: 25,
          lastModified: Date.now(),
        }),
      }),
    };

    // Root dir: getFileHandle throws (file not in root), but getDirectoryHandle returns docs/
    const mockDirHandle = {
      kind: 'directory' as const,
      name: 'project',
      getFileHandle: vi.fn().mockRejectedValue(new DOMException('NotFoundError')),
      getDirectoryHandle: vi.fn().mockResolvedValue(mockDocsDir),
      // The async iterator for rootHandle.values() yields subdirectories
      values: vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: () => {
          let done = false;
          return {
            next: async () => {
              if (!done) {
                done = true;
                return { value: { kind: 'directory' as const, name: 'docs' }, done: false };
              }
              return { value: undefined, done: true };
            },
          };
        },
      }),
    };

    (fileSystemStorage.getHandle as ReturnType<typeof vi.fn>).mockResolvedValue({
      handle: mockDirHandle,
    });

    (readFileContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: '# AIXORD Baseline v4.6',
      name: 'AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md',
      size: 25,
      lastModified: Date.now(),
      type: 'text/markdown',
    });

    const result = await detectAndResolveFiles(
      'review AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md',
      'project-1'
    );
    expect(result.detected.length).toBeGreaterThanOrEqual(1);
    // This was the bug: previously returned injectedCount=0 because Fallback B was unreachable
    expect(result.injectedCount).toBeGreaterThanOrEqual(1);
    expect(result.contextString).toContain('AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md');
  });
});
