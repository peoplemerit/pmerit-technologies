/**
 * File Reference Detection & Resolution (P0-3: File Bridge)
 *
 * NLP-based detection of file references in user messages.
 * When a user mentions a file (e.g., "look at src/index.ts" or "check the README"),
 * this module detects those references, resolves them against the linked workspace
 * folder, and formats the file contents for injection into the AI context.
 *
 * Constraints:
 * - Max 100KB per file (text content)
 * - Max 3 files per message
 * - Text files only (binary files get metadata-only stub)
 * - Graceful degradation: if workspace not bound or permission denied, skip silently
 */

import {
  fileSystemStorage,
  readFileContent,
  isTextFile,
  verifyPermission,
} from './fileSystem';

// ============================================================================
// Types
// ============================================================================

export interface DetectedFile {
  /** The raw reference string found in the message */
  raw: string;
  /** Normalized path (forward slashes, no leading ./) */
  path: string;
  /** Just the filename (last segment) */
  filename: string;
  /** File extension (lowercase, no dot) */
  extension: string;
  /** Confidence: how likely this is a real file reference */
  confidence: 'high' | 'medium' | 'low';
  /** Which pattern matched */
  matchType: 'explicit_path' | 'quoted_file' | 'backtick_file' | 'natural_reference' | 'bare_filename';
}

export interface ResolvedFile {
  detected: DetectedFile;
  found: boolean;
  content?: string;
  size?: number;
  lastModified?: number;
  /** If file was too large or binary, this explains why content is absent */
  skipReason?: 'too_large' | 'binary' | 'not_found' | 'permission_denied' | 'read_error';
}

export interface FileDetectionResult {
  /** Files detected in the message */
  detected: DetectedFile[];
  /** Files resolved from workspace (only if workspace bound) */
  resolved: ResolvedFile[];
  /** Formatted context string to append to the AI message */
  contextString: string;
  /** Number of files whose content was successfully injected */
  injectedCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_FILES_PER_MESSAGE = 3;

// Common non-file words that look like filenames but aren't
const FALSE_POSITIVES = new Set([
  'e.g.', 'i.e.', 'etc.', 'vs.', 'mr.', 'mrs.', 'dr.', 'st.',
  'a.m.', 'p.m.', 'u.s.', 'u.k.',
]);

// Common file extensions for detection
const KNOWN_EXTENSIONS = new Set([
  // Code
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'rs', 'go', 'java',
  'c', 'cpp', 'h', 'hpp', 'cs', 'rb', 'php', 'swift', 'kt',
  // Web
  'html', 'htm', 'css', 'scss', 'sass', 'less', 'vue', 'svelte',
  // Config
  'json', 'yaml', 'yml', 'toml', 'xml', 'ini', 'cfg', 'conf',
  'env', 'gitignore', 'dockerignore', 'editorconfig',
  // Docs
  'md', 'txt', 'rst', 'adoc',
  // Data
  'csv', 'sql', 'graphql', 'gql', 'prisma',
  // Shell
  'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd',
  // Build
  'dockerfile', 'makefile', 'cmake',
  // Other
  'log', 'lock', 'map',
]);

// ============================================================================
// Detection Patterns
// ============================================================================

/**
 * Detect file references in a user message.
 *
 * Pattern priority (highest confidence first):
 * 1. Explicit paths with directories: src/components/App.tsx
 * 2. Quoted filenames: "package.json" or 'tsconfig.json'
 * 3. Backtick filenames: `index.ts`
 * 4. Natural language file references: "the README file", "check config.yaml"
 * 5. Bare filenames with known extensions: package.json, index.ts
 */
export function detectFileReferences(message: string): DetectedFile[] {
  const detected: DetectedFile[] = [];
  const seenPaths = new Set<string>();

  // Pattern 1: Explicit paths (contain / or \ with file extension)
  // Matches: src/index.ts, ./lib/utils.ts, components/App.tsx, path\to\file.js
  const pathPattern = /(?:^|\s|[(,;:])([.\w-]+(?:[/\\][.\w-]+)+\.[a-zA-Z]{1,10})(?=[\s),;:.\]!?]|$)/g;
  let match;
  while ((match = pathPattern.exec(message)) !== null) {
    const raw = match[1];
    const normalized = normalizePath(raw);
    if (!seenPaths.has(normalized) && isValidFileRef(normalized)) {
      seenPaths.add(normalized);
      detected.push(makeDetected(raw, normalized, 'explicit_path', 'high'));
    }
  }

  // Pattern 2: Quoted filenames — "file.ext" or 'file.ext' (supports spaces in filenames)
  const quotedPattern = /["']([a-zA-Z0-9_ .\-/\\]+\.[a-zA-Z]{1,10})["']/g;
  while ((match = quotedPattern.exec(message)) !== null) {
    const raw = match[1];
    const normalized = normalizePath(raw);
    if (!seenPaths.has(normalized) && isValidFileRef(normalized, true)) {
      seenPaths.add(normalized);
      detected.push(makeDetected(raw, normalized, 'quoted_file', 'high'));
    }
  }

  // Pattern 3: Backtick filenames — `file.ext` or `path/to/file.ext`
  const backtickPattern = /`([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,10})`/g;
  while ((match = backtickPattern.exec(message)) !== null) {
    const raw = match[1];
    const normalized = normalizePath(raw);
    if (!seenPaths.has(normalized) && isValidFileRef(normalized)) {
      seenPaths.add(normalized);
      detected.push(makeDetected(raw, normalized, 'backtick_file', 'high'));
    }
  }

  // Pattern 4: Natural language references — "the X file", "check X", "look at X", "open X"
  const naturalPattern = /(?:the|check|look at|open|read|see|review|examine|inspect|update|edit|modify|fix|change)\s+([a-zA-Z0-9_.-]+\.[a-zA-Z]{1,10})(?:\s+file)?/gi;
  while ((match = naturalPattern.exec(message)) !== null) {
    const raw = match[1];
    const normalized = normalizePath(raw);
    if (!seenPaths.has(normalized) && isValidFileRef(normalized)) {
      seenPaths.add(normalized);
      detected.push(makeDetected(raw, normalized, 'natural_reference', 'medium'));
    }
  }

  // Pattern 5: Bare filenames with known extensions (lowest confidence)
  // Only if the extension is in our known set
  const barePattern = /(?:^|\s)([a-zA-Z0-9_-]+\.[a-zA-Z]{1,10})(?=[\s.,;:!?)}\]]|$)/g;
  while ((match = barePattern.exec(message)) !== null) {
    const raw = match[1].trim();
    const normalized = normalizePath(raw);
    const ext = getExtension(normalized);
    if (!seenPaths.has(normalized) && isValidFileRef(normalized) && KNOWN_EXTENSIONS.has(ext)) {
      seenPaths.add(normalized);
      detected.push(makeDetected(raw, normalized, 'bare_filename', 'low'));
    }
  }

  // Sort by confidence (high first) and limit
  return detected
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    })
    .slice(0, MAX_FILES_PER_MESSAGE);
}

// ============================================================================
// Resolution
// ============================================================================

/**
 * Resolve detected file references against the workspace folder.
 *
 * Walks the directory handle to find matching files.
 * Returns resolved files with content (for text) or metadata (for binary/large).
 */
export async function resolveFiles(
  detected: DetectedFile[],
  folderHandle: FileSystemDirectoryHandle
): Promise<ResolvedFile[]> {
  const resolved: ResolvedFile[] = [];

  for (const det of detected) {
    try {
      const result = await resolveOneFile(det, folderHandle);
      resolved.push(result);
    } catch {
      resolved.push({
        detected: det,
        found: false,
        skipReason: 'read_error',
      });
    }
  }

  return resolved;
}

/**
 * Resolve a single file reference against the folder handle.
 */
async function resolveOneFile(
  det: DetectedFile,
  rootHandle: FileSystemDirectoryHandle
): Promise<ResolvedFile> {
  // Split path into segments
  const segments = det.path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { detected: det, found: false, skipReason: 'not_found' };
  }

  try {
    let currentDir = rootHandle;

    // Navigate to the directory containing the file
    for (let i = 0; i < segments.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(segments[i]);
    }

    // Get the file handle
    const fileName = segments[segments.length - 1];
    const fileHandle = await currentDir.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      return {
        detected: det,
        found: true,
        size: file.size,
        lastModified: file.lastModified,
        skipReason: 'too_large',
      };
    }

    // Check if it's a text file
    if (!isTextFile(det.extension)) {
      return {
        detected: det,
        found: true,
        size: file.size,
        lastModified: file.lastModified,
        skipReason: 'binary',
      };
    }

    // Read the file content
    const fileContent = await readFileContent(fileHandle);

    return {
      detected: det,
      found: true,
      content: fileContent.content,
      size: file.size,
      lastModified: file.lastModified,
    };
  } catch (err) {
    // File not found at the exact path — try searching by filename only
    if (segments.length === 1) {
      // Already was a bare filename, no deeper search
      return { detected: det, found: false, skipReason: 'not_found' };
    }

    // Fallback A: Try just the filename in root
    const fileName = segments[segments.length - 1];
    try {
      const fileHandle = await rootHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();

      if (file.size > MAX_FILE_SIZE) {
        return { detected: det, found: true, size: file.size, lastModified: file.lastModified, skipReason: 'too_large' };
      }
      if (!isTextFile(det.extension)) {
        return { detected: det, found: true, size: file.size, lastModified: file.lastModified, skipReason: 'binary' };
      }

      const fileContent = await readFileContent(fileHandle);
      return { detected: det, found: true, content: fileContent.content, size: file.size, lastModified: file.lastModified };
    } catch {
      // Fallback A failed — filename not in root
    }

    // Fallback B: Search depth-1 subdirectories for the filename
    // Handles cases like "AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md" living in "docs/"
    try {
      const result = await searchSubdirectories(rootHandle, fileName, det);
      if (result) return result;
    } catch {
      // Search failed — non-fatal
    }

    return { detected: det, found: false, skipReason: 'not_found' };
  }
}

// ============================================================================
// Context Formatting
// ============================================================================

/**
 * Format resolved files into a context string for the AI message.
 *
 * Output format:
 * ```
 * === WORKSPACE FILES (auto-attached) ===
 *
 * --- src/index.ts (2.1 KB) ---
 * [file content here]
 * --- END src/index.ts ---
 *
 * --- image.png (45.2 KB, binary) ---
 * [Binary file — metadata only]
 * --- END image.png ---
 * ```
 */
export function formatResolvedFilesForContext(resolved: ResolvedFile[]): string {
  const includedFiles = resolved.filter(r => r.found);

  if (includedFiles.length === 0) return '';

  const parts: string[] = [
    '\n\n=== WORKSPACE FILES (auto-attached) ===\n',
  ];

  for (const file of includedFiles) {
    const path = file.detected.path;
    const sizeStr = file.size ? formatSize(file.size) : 'unknown size';

    if (file.content) {
      // Full content injection
      parts.push(`\n--- ${path} (${sizeStr}) ---`);
      parts.push(file.content);
      parts.push(`--- END ${path} ---\n`);
    } else if (file.skipReason === 'too_large') {
      parts.push(`\n--- ${path} (${sizeStr}, TRUNCATED — exceeds 100KB limit) ---`);
      parts.push(`[File too large to include. Size: ${sizeStr}]`);
      parts.push(`--- END ${path} ---\n`);
    } else if (file.skipReason === 'binary') {
      parts.push(`\n--- ${path} (${sizeStr}, binary) ---`);
      parts.push(`[Binary file — content not displayed. Extension: .${file.detected.extension}]`);
      parts.push(`--- END ${path} ---\n`);
    }
  }

  parts.push('=== END WORKSPACE FILES ===');
  return parts.join('\n');
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Full file detection pipeline:
 * 1. Detect file references in the message
 * 2. If workspace is bound, resolve files from the folder handle
 * 3. Format resolved files as context
 *
 * Returns the detection result with context string ready to append.
 * Designed to be called from Project.tsx handleSendMessage.
 */
export async function detectAndResolveFiles(
  message: string,
  projectId: string
): Promise<FileDetectionResult> {
  // Step 1: Detect file references
  const detected = detectFileReferences(message);

  if (detected.length === 0) {
    return { detected: [], resolved: [], contextString: '', injectedCount: 0 };
  }

  // Step 2: Get workspace folder handle
  try {
    const linkedFolder = await fileSystemStorage.getHandle(projectId);

    if (!linkedFolder) {
      // No workspace bound — return detection only, no resolution
      return { detected, resolved: [], contextString: '', injectedCount: 0 };
    }

    // Verify permission (read-only is sufficient)
    const hasPermission = await verifyPermission(linkedFolder.handle, false);
    if (!hasPermission) {
      return { detected, resolved: [], contextString: '', injectedCount: 0 };
    }

    // Step 3: Resolve files
    const resolved = await resolveFiles(detected, linkedFolder.handle);

    // Step 4: Format context
    const contextString = formatResolvedFilesForContext(resolved);
    const injectedCount = resolved.filter(r => r.found && r.content).length;

    return { detected, resolved, contextString, injectedCount };
  } catch (err) {
    console.warn('[FileDetection] Failed to resolve files:', err);
    return { detected, resolved: [], contextString: '', injectedCount: 0 };
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Search depth-1 subdirectories for a file by name.
 * Returns the first match found, or null if not found.
 * Limits to 20 directories to avoid scanning huge trees.
 */
async function searchSubdirectories(
  rootHandle: FileSystemDirectoryHandle,
  fileName: string,
  det: DetectedFile
): Promise<ResolvedFile | null> {
  const MAX_DIRS_TO_SCAN = 20;
  let scanned = 0;

  for await (const entry of rootHandle.values()) {
    if (scanned >= MAX_DIRS_TO_SCAN) break;
    if (entry.kind !== 'directory') continue;
    scanned++;

    try {
      const subDir = await rootHandle.getDirectoryHandle(entry.name);
      const fileHandle = await subDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();

      if (file.size > MAX_FILE_SIZE) {
        return { detected: det, found: true, size: file.size, lastModified: file.lastModified, skipReason: 'too_large' };
      }
      if (!isTextFile(det.extension)) {
        return { detected: det, found: true, size: file.size, lastModified: file.lastModified, skipReason: 'binary' };
      }

      const fileContent = await readFileContent(fileHandle);
      return { detected: det, found: true, content: fileContent.content, size: file.size, lastModified: file.lastModified };
    } catch {
      // File not in this subdirectory — continue
    }
  }

  return null;
}

function normalizePath(raw: string): string {
  return raw
    .replace(/\\/g, '/') // Backslash to forward slash
    .replace(/^\.\//, '') // Remove leading ./
    .replace(/^\//, ''); // Remove leading /
}

function getExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  return lastDot > 0 ? path.slice(lastDot + 1).toLowerCase() : '';
}

function makeDetected(
  raw: string,
  normalized: string,
  matchType: DetectedFile['matchType'],
  confidence: DetectedFile['confidence']
): DetectedFile {
  const segments = normalized.split('/');
  const filename = segments[segments.length - 1];
  const extension = getExtension(filename);

  return { raw, path: normalized, filename, extension, confidence, matchType };
}

function isValidFileRef(path: string, allowSpaces = false): boolean {
  const lower = path.toLowerCase();

  // Filter false positives
  if (FALSE_POSITIVES.has(lower)) return false;

  // Must have a valid-looking extension
  const ext = getExtension(path);
  if (!ext || ext.length > 10) return false;

  // No spaces in path segments (unless quoted — allowSpaces=true)
  if (!allowSpaces && path.includes(' ')) return false;

  // Must have at least one character before the extension
  const filename = path.split('/').pop() || '';
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
  if (!nameWithoutExt) return false;

  return true;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
