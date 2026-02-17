/**
 * ExecutionEngine Tests — D80 EXE-GAP-001/002/003
 *
 * Tests file deliverable parsing and writing:
 *   1. parseResponse extracts file specs from ```lang:path code fences
 *   2. parseResponse handles multiple files in one response
 *   3. parseResponse ignores regular code fences without path separator
 *   4. processFilesOnly returns filesCreated when workspace exists
 *   5. processFilesOnly returns errors when no workspace linked
 *   6. processFilesOnly returns empty result when no file fences found
 *   7. File path parsing handles nested directories
 *   8. Mixed content: file fences + structured blocks — processFilesOnly only processes files
 *   9. parseResponse extracts structured blocks alongside file specs
 *  10. processFilesOnly does not call assignment/submission APIs (no double-processing)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionEngine } from '../src/lib/executionEngine';

// ============================================================================
// Mock fileSystem module
// ============================================================================

const mockGetHandle = vi.fn();
const mockCreateDirectory = vi.fn();
const mockCreateFile = vi.fn();

vi.mock('../src/lib/fileSystem', () => ({
  fileSystemStorage: {
    getHandle: (...args: unknown[]) => mockGetHandle(...args),
  },
  createDirectory: (...args: unknown[]) => mockCreateDirectory(...args),
  createFile: (...args: unknown[]) => mockCreateFile(...args),
}));

// Mock api module (to verify no API calls from processFilesOnly)
const mockProgress = vi.fn();
const mockSubmit = vi.fn();

vi.mock('../src/lib/api', () => ({
  api: {
    assignments: {
      progress: (...args: unknown[]) => mockProgress(...args),
      submit: (...args: unknown[]) => mockSubmit(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// 1. parseResponse — Code Fence Extraction
// ============================================================================

describe('ExecutionEngine.parseResponse', () => {
  it('extracts file specs from ```lang:path code fences', () => {
    const content = `Here is the file:

\`\`\`tsx:src/App.tsx
import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
\`\`\`

That's the main component.`;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(1);
    expect(parsed.fileSpecs[0].path).toBe('src/App.tsx');
    expect(parsed.fileSpecs[0].language).toBe('tsx');
    expect(parsed.fileSpecs[0].content).toContain("import React from 'react'");
    expect(parsed.fileSpecs[0].action).toBe('create');
  });

  it('handles multiple files in one response', () => {
    const content = `\`\`\`json:package.json
{
  "name": "my-app"
}
\`\`\`

Now the config:

\`\`\`ts:vite.config.ts
import { defineConfig } from 'vite';
export default defineConfig({});
\`\`\`

And the entry:

\`\`\`html:index.html
<!DOCTYPE html>
<html></html>
\`\`\``;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(3);
    expect(parsed.fileSpecs[0].path).toBe('package.json');
    expect(parsed.fileSpecs[0].language).toBe('json');
    expect(parsed.fileSpecs[1].path).toBe('vite.config.ts');
    expect(parsed.fileSpecs[1].language).toBe('ts');
    expect(parsed.fileSpecs[2].path).toBe('index.html');
    expect(parsed.fileSpecs[2].language).toBe('html');
  });

  it('ignores regular code fences without path separator', () => {
    const content = `Here is some code:

\`\`\`typescript
const x = 42;
\`\`\`

And more:

\`\`\`javascript
console.log('hello');
\`\`\``;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(0);
  });

  it('handles nested directory paths', () => {
    const content = `\`\`\`tsx:src/components/layout/Header.tsx
export function Header() { return <header />; }
\`\`\``;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(1);
    expect(parsed.fileSpecs[0].path).toBe('src/components/layout/Header.tsx');
  });

  it('extracts structured blocks alongside file specs', () => {
    const content = `\`\`\`tsx:src/App.tsx
export default function App() { return <div />; }
\`\`\`

=== PROGRESS UPDATE ===
assignment_id: a-001
percent: 50
completed: Created App component
next: Create routing
=== END PROGRESS UPDATE ===

=== SUBMISSION ===
assignment_id: a-001
summary: App component created
evidence: src/App.tsx
=== END SUBMISSION ===`;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(1);
    expect(parsed.progressUpdates).toHaveLength(1);
    expect(parsed.submissions).toHaveLength(1);
    expect(parsed.progressUpdates[0].assignmentId).toBe('a-001');
    expect(parsed.progressUpdates[0].percent).toBe(50);
    expect(parsed.submissions[0].assignmentId).toBe('a-001');
  });

  it('trims whitespace from paths and content', () => {
    const content = `\`\`\`css: src/styles/main.css
body { margin: 0; }
\`\`\``;

    const parsed = ExecutionEngine.parseResponse(content);

    expect(parsed.fileSpecs).toHaveLength(1);
    expect(parsed.fileSpecs[0].path).toBe('src/styles/main.css');
    expect(parsed.fileSpecs[0].content).toBe('body { margin: 0; }');
  });
});

// ============================================================================
// 2. processFilesOnly — File Writing (No TDL Side Effects)
// ============================================================================

describe('ExecutionEngine.processFilesOnly', () => {
  it('returns filesCreated when workspace exists', async () => {
    const mockHandle = { name: 'project-root' };
    mockGetHandle.mockResolvedValue({ handle: mockHandle });
    mockCreateDirectory.mockResolvedValue(mockHandle);
    mockCreateFile.mockResolvedValue(undefined);

    const content = `\`\`\`tsx:src/App.tsx
export default function App() { return <div />; }
\`\`\``;

    const result = await ExecutionEngine.processFilesOnly(content, 'proj-123');

    expect(result.filesCreated).toEqual(['src/App.tsx']);
    expect(result.filesUpdated).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(mockGetHandle).toHaveBeenCalledWith('proj-123');
  });

  it('returns errors when no workspace linked', async () => {
    mockGetHandle.mockResolvedValue(null);

    const content = `\`\`\`tsx:src/App.tsx
export default function App() { return <div />; }
\`\`\``;

    const result = await ExecutionEngine.processFilesOnly(content, 'proj-456');

    expect(result.filesCreated).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('No workspace folder linked');
  });

  it('returns empty result when no file fences found', async () => {
    const content = `Here is some explanation without any code fences.

Just text.`;

    const result = await ExecutionEngine.processFilesOnly(content, 'proj-789');

    expect(result.filesCreated).toEqual([]);
    expect(result.filesUpdated).toEqual([]);
    expect(result.errors).toEqual([]);
    // Should not even attempt to get workspace handle
    expect(mockGetHandle).not.toHaveBeenCalled();
  });

  it('processes multiple files and reports all results', async () => {
    const mockHandle = { name: 'project-root' };
    mockGetHandle.mockResolvedValue({ handle: mockHandle });
    mockCreateDirectory.mockResolvedValue(mockHandle);
    mockCreateFile.mockResolvedValue(undefined);

    const content = `\`\`\`json:package.json
{ "name": "test" }
\`\`\`

\`\`\`tsx:src/index.tsx
import App from './App';
\`\`\``;

    const result = await ExecutionEngine.processFilesOnly(content, 'proj-123');

    expect(result.filesCreated).toEqual(['package.json', 'src/index.tsx']);
    expect(result.errors).toEqual([]);
  });

  it('does NOT call assignment/submission APIs (no double-processing)', async () => {
    const mockHandle = { name: 'project-root' };
    mockGetHandle.mockResolvedValue({ handle: mockHandle });
    mockCreateDirectory.mockResolvedValue(mockHandle);
    mockCreateFile.mockResolvedValue(undefined);

    const content = `\`\`\`tsx:src/App.tsx
export default function App() { return <div />; }
\`\`\`

=== SUBMISSION ===
assignment_id: a-001
summary: App component created
evidence: src/App.tsx
=== END SUBMISSION ===

=== PROGRESS UPDATE ===
assignment_id: a-001
percent: 100
completed: Done
next: Nothing
=== END PROGRESS UPDATE ===`;

    await ExecutionEngine.processFilesOnly(content, 'proj-123');

    // processFilesOnly should NOT call backend APIs for structured blocks
    expect(mockProgress).not.toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('handles file write errors gracefully', async () => {
    const mockHandle = { name: 'project-root' };
    mockGetHandle.mockResolvedValue({ handle: mockHandle });
    mockCreateDirectory.mockResolvedValue(mockHandle);
    mockCreateFile.mockRejectedValue(new Error('Permission denied'));

    const content = `\`\`\`tsx:src/App.tsx
export default function App() { return <div />; }
\`\`\``;

    const result = await ExecutionEngine.processFilesOnly(content, 'proj-123');

    expect(result.filesCreated).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Permission denied');
  });
});
