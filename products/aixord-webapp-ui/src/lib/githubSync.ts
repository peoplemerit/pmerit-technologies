/**
 * GITHUB-SYNC-01: Smart Sync from GitHub to Local Workspace
 *
 * Downloads source files from a connected GitHub repository to the user's
 * local workspace folder via the File System Access API. Once files are local,
 * the existing context pipeline (Project.tsx -> useChat.ts -> workspace_context)
 * automatically scans them and sends them to the AI.
 *
 * Algorithm:
 * 1. Fetch recursive tree via GET /github/tree/:projectId
 * 2. Filter out junk dirs, binary extensions, oversized files
 * 3. Download each file via GET /github/file/:projectId and write locally
 * 4. Report progress throughout
 */

import { githubApi } from './api/evidence-knowledge';
import { fileSystemStorage, createFile, createDirectory } from './fileSystem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubSyncProgress {
  phase: 'fetching_tree' | 'downloading' | 'complete' | 'error';
  current: number;
  total: number;
  currentFile?: string;
  message: string;
}

export interface GitHubSyncResult {
  synced: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
  durationMs: number;
}

export interface GitHubSyncOptions {
  maxFiles?: number;
  overwrite?: boolean;
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// Filter Configuration
// ---------------------------------------------------------------------------

/** Directories to always exclude (case-insensitive match on any path segment) */
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  '.cache',
  'coverage',
  'vendor',
  'target',
  '.gradle',
  '.idea',
  '.vscode',
  'venv',
  '.env',
  '.wrangler',
  'bower_components',
  '.turbo',
  '.parcel-cache',
  '.svelte-kit',
  '.nuxt',
  '.output',
  '.vercel',
  '.angular',
  'tmp',
  '.tmp',
  'logs',
  '.sass-cache',
  '.pytest_cache',
  '.mypy_cache',
  '.tox',
  'eggs',
  '*.egg-info',
  '__snapshots__',
]);

/** File extensions to exclude (binary / non-source) */
const EXCLUDED_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', '.tiff', '.tif', '.avif',
  // Fonts
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  // Audio / Video
  '.mp3', '.mp4', '.wav', '.ogg', '.webm', '.avi', '.mov', '.flac', '.aac',
  // Archives
  '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar', '.tgz',
  // Compiled / Binary
  '.exe', '.dll', '.so', '.dylib', '.o', '.obj', '.class', '.pyc', '.pyo', '.wasm',
  // Databases
  '.db', '.sqlite', '.sqlite3', '.mdb',
  // Documents (usually large)
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // Maps & Locks
  '.map', '.lock',
  // Misc binary
  '.bin', '.dat', '.pkl', '.pb', '.onnx', '.pt', '.pth', '.h5', '.hdf5',
  // DS_Store
  '.DS_Store',
]);

/** Max individual file size to download (bytes) */
const MAX_FILE_SIZE = 50_000; // 50 KB

/** Default cap on total files to sync */
const DEFAULT_MAX_FILES = 100;

// ---------------------------------------------------------------------------
// Filtering Logic
// ---------------------------------------------------------------------------

function shouldExcludeDir(pathSegment: string): boolean {
  const lower = pathSegment.toLowerCase();
  return EXCLUDED_DIRS.has(lower) || lower.startsWith('.');
}

function shouldExcludeFile(path: string, size?: number): boolean {
  // Check extension
  const lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) {
    const ext = path.slice(lastDot).toLowerCase();
    if (EXCLUDED_EXTENSIONS.has(ext)) return true;
  }

  // Check size
  if (size !== undefined && size > MAX_FILE_SIZE) return true;

  // Check if any path segment is an excluded dir
  const segments = path.split('/');
  for (let i = 0; i < segments.length - 1; i++) {
    if (shouldExcludeDir(segments[i])) return true;
  }

  return false;
}

/**
 * Priority sort: root-level files first, then by depth ascending, then alphabetical.
 */
function prioritySort(
  a: { path: string; type: string },
  b: { path: string; type: string }
): number {
  const depthA = a.path.split('/').length;
  const depthB = b.path.split('/').length;
  if (depthA !== depthB) return depthA - depthB;
  return a.path.localeCompare(b.path);
}

// ---------------------------------------------------------------------------
// Check if file exists locally (non-destructive default)
// ---------------------------------------------------------------------------

async function fileExistsLocally(
  dirHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<boolean> {
  try {
    const segments = filePath.split('/');
    const filename = segments.pop()!;
    let current = dirHandle;
    for (const seg of segments) {
      if (seg && seg !== '.') {
        current = await current.getDirectoryHandle(seg);
      }
    }
    await current.getFileHandle(filename);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Write file to workspace (mirrors ExecutionEngine.writeFileToWorkspace)
// ---------------------------------------------------------------------------

async function writeFileToWorkspace(
  rootHandle: FileSystemDirectoryHandle,
  filePath: string,
  content: string
): Promise<void> {
  const pathParts = filePath.split('/');
  const filename = pathParts.pop();
  if (!filename) throw new Error(`Invalid file path: ${filePath}`);

  let currentHandle = rootHandle;
  for (const part of pathParts) {
    if (part && part !== '.') {
      currentHandle = await createDirectory(currentHandle, part);
    }
  }

  await createFile(currentHandle, filename, content);
}

// ---------------------------------------------------------------------------
// Main Sync Function
// ---------------------------------------------------------------------------

export async function syncGitHubToWorkspace(
  projectId: string,
  token: string,
  onProgress: (progress: GitHubSyncProgress) => void,
  options?: GitHubSyncOptions
): Promise<GitHubSyncResult> {
  const startTime = Date.now();
  const maxFiles = options?.maxFiles ?? DEFAULT_MAX_FILES;
  const overwrite = options?.overwrite ?? false;
  const signal = options?.signal;

  let synced = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  try {
    // -----------------------------------------------------------------------
    // Phase 1: Get workspace handle
    // -----------------------------------------------------------------------
    const linkedFolder = await fileSystemStorage.getHandle(projectId);
    if (!linkedFolder) {
      throw new Error('No workspace folder linked. Please link a folder in Step 1 first.');
    }

    // Verify permission is still granted
    const permStatus = await linkedFolder.handle.queryPermission({ mode: 'readwrite' });
    if (permStatus !== 'granted') {
      const reqStatus = await linkedFolder.handle.requestPermission({ mode: 'readwrite' });
      if (reqStatus !== 'granted') {
        throw new Error('Workspace folder permission denied. Please re-link the folder.');
      }
    }

    // -----------------------------------------------------------------------
    // Phase 2: Fetch repository tree
    // -----------------------------------------------------------------------
    if (signal?.aborted) throw new Error('Sync cancelled');

    onProgress({
      phase: 'fetching_tree',
      current: 0,
      total: 0,
      message: 'Fetching repository file tree...',
    });

    const tree = await githubApi.getTree(projectId, token, 6);

    // Filter to source files only
    const sourceFiles = tree.entries
      .filter(e => e.type === 'file' && !shouldExcludeFile(e.path, e.size))
      .sort(prioritySort)
      .slice(0, maxFiles);

    const totalFiles = sourceFiles.length;

    onProgress({
      phase: 'downloading',
      current: 0,
      total: totalFiles,
      message: `Found ${totalFiles} source files to sync (${tree.total} total in repo)`,
    });

    // -----------------------------------------------------------------------
    // Phase 3: Download and write files sequentially
    // -----------------------------------------------------------------------
    for (let i = 0; i < sourceFiles.length; i++) {
      if (signal?.aborted) throw new Error('Sync cancelled');

      const entry = sourceFiles[i];

      onProgress({
        phase: 'downloading',
        current: i + 1,
        total: totalFiles,
        currentFile: entry.path,
        message: `Syncing ${entry.path}`,
      });

      try {
        // Check if file already exists locally (non-destructive by default)
        if (!overwrite) {
          const exists = await fileExistsLocally(linkedFolder.handle, entry.path);
          if (exists) {
            skipped++;
            continue;
          }
        }

        // Download file content from GitHub
        const fileData = await githubApi.getFile(projectId, entry.path, token);

        // Write to local workspace
        await writeFileToWorkspace(linkedFolder.handle, entry.path, fileData.content);

        synced++;
      } catch (fileError) {
        errors++;
        const msg = fileError instanceof Error ? fileError.message : 'Unknown error';
        errorDetails.push(`${entry.path}: ${msg}`);
        // Continue syncing other files — don't fail the whole operation
      }

      // Small delay to avoid overwhelming the API and allow UI updates
      if (i % 5 === 4) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // -----------------------------------------------------------------------
    // Phase 4: Complete
    // -----------------------------------------------------------------------
    const result: GitHubSyncResult = {
      synced,
      skipped,
      errors,
      errorDetails,
      durationMs: Date.now() - startTime,
    };

    onProgress({
      phase: 'complete',
      current: totalFiles,
      total: totalFiles,
      message: `Sync complete: ${synced} files synced, ${skipped} skipped, ${errors} errors`,
    });

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown sync error';

    onProgress({
      phase: 'error',
      current: synced,
      total: 0,
      message: msg,
    });

    return {
      synced,
      skipped,
      errors: errors + 1,
      errorDetails: [...errorDetails, msg],
      durationMs: Date.now() - startTime,
    };
  }
}
