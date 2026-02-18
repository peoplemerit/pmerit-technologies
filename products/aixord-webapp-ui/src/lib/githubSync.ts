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

export interface GitHubPushResult {
  success: boolean;
  filesCommitted: number;
  filesSkipped: number;
  commitSha?: string;
  treeSha?: string;
  branch?: string;
  commitUrl?: string;
  prNumber?: number;
  prUrl?: string;
  error?: string;
  durationMs: number;
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

// ---------------------------------------------------------------------------
// Push Local → GitHub (ENV-SYNC-01 Phase 1)
// ---------------------------------------------------------------------------

/** Max files to push in one commit */
const DEFAULT_MAX_PUSH_FILES = 150;

/**
 * Recursively read all text files from a local workspace directory.
 * Reuses the same EXCLUDED_DIRS, EXCLUDED_EXTENSIONS, and MAX_FILE_SIZE
 * filters used by syncGitHubToWorkspace to keep consistency.
 */
async function readLocalFiles(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = '',
  signal?: AbortSignal
): Promise<Array<{ path: string; content: string }>> {
  const files: Array<{ path: string; content: string }> = [];

  for await (const [name, entryHandle] of dirHandle.entries()) {
    if (signal?.aborted) break;

    if (entryHandle.kind === 'directory') {
      // Skip excluded directories
      if (shouldExcludeDir(name)) continue;

      const subDir = entryHandle as FileSystemDirectoryHandle;
      const subPath = basePath ? `${basePath}/${name}` : name;
      const subFiles = await readLocalFiles(subDir, subPath, signal);
      files.push(...subFiles);
    } else if (entryHandle.kind === 'file') {
      const filePath = basePath ? `${basePath}/${name}` : name;

      // Skip excluded files by extension
      if (shouldExcludeFile(filePath)) continue;

      try {
        const fileHandle = entryHandle as FileSystemFileHandle;
        const file = await fileHandle.getFile();

        // Skip files that exceed size limit
        if (file.size > MAX_FILE_SIZE) continue;

        const content = await file.text();
        files.push({ path: filePath, content });
      } catch {
        // Skip files we can't read (permission errors, etc.)
      }
    }
  }

  return files;
}

/**
 * Push local workspace files to GitHub.
 *
 * Reads all source files from the local workspace (File System Access API),
 * filters out junk/binary/oversized files, and commits them to GitHub
 * via POST /github/commit/:projectId.
 *
 * This is the REVERSE of syncGitHubToWorkspace — it pushes LOCAL → GITHUB
 * for Greenfield projects where the scaffold exists locally first.
 */
export async function pushLocalToGitHub(
  projectId: string,
  token: string,
  onProgress?: (p: GitHubSyncProgress) => void,
  options?: { signal?: AbortSignal; commitMessage?: string; maxFiles?: number }
): Promise<GitHubPushResult> {
  const startTime = Date.now();
  const maxFiles = options?.maxFiles ?? DEFAULT_MAX_PUSH_FILES;
  const signal = options?.signal;
  const commitMessage = options?.commitMessage ?? '[AIXORD] Initial scaffold — push local workspace to GitHub';

  const report = (p: Partial<GitHubSyncProgress>) => {
    onProgress?.({
      phase: 'downloading', // reuse phase type
      current: 0,
      total: 0,
      message: '',
      ...p,
    } as GitHubSyncProgress);
  };

  try {
    // -----------------------------------------------------------------
    // 1. Get workspace handle
    // -----------------------------------------------------------------
    const linkedFolder = await fileSystemStorage.getHandle(projectId);
    if (!linkedFolder) {
      throw new Error('No workspace folder linked. Please link a folder in Step 1 first.');
    }

    // Verify permission
    const permStatus = await linkedFolder.handle.queryPermission({ mode: 'readwrite' });
    if (permStatus !== 'granted') {
      const reqStatus = await linkedFolder.handle.requestPermission({ mode: 'readwrite' });
      if (reqStatus !== 'granted') {
        throw new Error('Workspace folder permission denied. Please re-link the folder.');
      }
    }

    // -----------------------------------------------------------------
    // 2. Read all local files
    // -----------------------------------------------------------------
    if (signal?.aborted) throw new Error('Push cancelled');

    report({
      phase: 'fetching_tree',
      message: 'Reading local workspace files...',
    });

    const allFiles = await readLocalFiles(linkedFolder.handle, '', signal);

    if (signal?.aborted) throw new Error('Push cancelled');

    // Priority sort: root-level files first, shallow depth first
    allFiles.sort((a, b) => {
      const depthA = a.path.split('/').length;
      const depthB = b.path.split('/').length;
      if (depthA !== depthB) return depthA - depthB;
      return a.path.localeCompare(b.path);
    });

    // Cap at maxFiles
    const filesToPush = allFiles.slice(0, maxFiles);
    const skipped = allFiles.length - filesToPush.length;

    if (filesToPush.length === 0) {
      report({
        phase: 'complete',
        message: 'No source files found in local workspace to push.',
      });
      return {
        success: true,
        filesCommitted: 0,
        filesSkipped: skipped,
        durationMs: Date.now() - startTime,
      };
    }

    report({
      phase: 'downloading',
      current: 0,
      total: filesToPush.length,
      message: `Pushing ${filesToPush.length} files to GitHub...`,
    });

    // -----------------------------------------------------------------
    // 3. Commit to GitHub via backend endpoint
    // -----------------------------------------------------------------
    const result = await githubApi.commitFiles(
      projectId,
      filesToPush,
      commitMessage,
      token
    );

    report({
      phase: 'complete',
      current: filesToPush.length,
      total: filesToPush.length,
      message: `Pushed ${result.files_committed} files to ${result.branch} (${result.commit_sha.slice(0, 7)})`,
    });

    return {
      success: true,
      filesCommitted: result.files_committed,
      filesSkipped: skipped,
      commitSha: result.commit_sha,
      treeSha: result.tree_sha,
      branch: result.branch,
      commitUrl: result.commit_url,
      prNumber: result.pr_number,
      prUrl: result.pr_url,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown push error';

    report({
      phase: 'error',
      message: msg,
    });

    return {
      success: false,
      filesCommitted: 0,
      filesSkipped: 0,
      error: msg,
      durationMs: Date.now() - startTime,
    };
  }
}
