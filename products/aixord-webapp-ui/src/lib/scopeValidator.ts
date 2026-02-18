/**
 * ENV-SYNC-01 Phase 4: Cross-File Import Validation
 *
 * After each scope commit, validates that imports between files resolve
 * to files that actually exist in the workspace. This catches the most
 * common category of cross-scope errors without needing a full tsc check.
 *
 * Checks:
 * 1. Relative imports (./foo, ../bar) resolve to existing files
 * 2. Missing file extensions are resolved with common extensions
 * 3. Index file resolution (./components → ./components/index.tsx)
 */

import { fileSystemStorage } from './fileSystem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImportValidationResult {
  valid: boolean;
  totalImports: number;
  resolvedImports: number;
  unresolvedImports: ImportError[];
  checkedFiles: number;
  durationMs: number;
}

export interface ImportError {
  sourceFile: string;
  importPath: string;
  line: number;
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Extensions to try when resolving bare imports (no extension specified) */
const RESOLVE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '/index.ts', '/index.tsx', '/index.js', '/index.jsx',
];

/** Regex to match import/export from statements */
const IMPORT_REGEX = /(?:import|export)\s+(?:(?:type\s+)?(?:\{[^}]*\}|[\w*]+(?:\s+as\s+\w+)?|\*)(?:\s*,\s*(?:\{[^}]*\}|[\w*]+(?:\s+as\s+\w+)?))*\s+from\s+)?['"]([^'"]+)['"]/gm;

/** Only validate relative imports (starts with . or ..) */
function isRelativeImport(importPath: string): boolean {
  return importPath.startsWith('./') || importPath.startsWith('../');
}

// ---------------------------------------------------------------------------
// File Collection (reads workspace files into a Set for fast lookup)
// ---------------------------------------------------------------------------

async function collectWorkspaceFiles(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<Set<string>> {
  const files = new Set<string>();

  const SKIP_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next',
    'coverage', '.cache', '.wrangler',
  ]);

  try {
    for await (const [name, entryHandle] of dirHandle.entries()) {
      if (entryHandle.kind === 'directory') {
        if (SKIP_DIRS.has(name.toLowerCase())) continue;
        const subDir = entryHandle as FileSystemDirectoryHandle;
        const subPath = basePath ? `${basePath}/${name}` : name;
        const subFiles = await collectWorkspaceFiles(subDir, subPath);
        for (const f of subFiles) files.add(f);
      } else {
        const filePath = basePath ? `${basePath}/${name}` : name;
        files.add(filePath);
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

// ---------------------------------------------------------------------------
// Import Resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a relative import path to an actual file path.
 * Tries the import as-is, then with common extensions, then as index file.
 */
function resolveImport(
  importPath: string,
  sourceDir: string,
  existingFiles: Set<string>
): string | null {
  // Normalize the path: sourceDir + importPath
  const parts = [...sourceDir.split('/'), ...importPath.split('/')];
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  const normalizedPath = resolved.join('/');

  // Try exact path first
  if (existingFiles.has(normalizedPath)) {
    return normalizedPath;
  }

  // Try with extensions
  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = normalizedPath + ext;
    if (existingFiles.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main Validation Function
// ---------------------------------------------------------------------------

/**
 * Validate cross-file imports for recently written files.
 *
 * @param projectId - Project ID (to get workspace handle)
 * @param filesToValidate - Array of file paths + content that were just written
 * @returns Validation result with any unresolved imports
 */
export async function validateScopeImports(
  projectId: string,
  filesToValidate: Array<{ path: string; content: string }>
): Promise<ImportValidationResult> {
  const startTime = Date.now();
  const unresolvedImports: ImportError[] = [];
  let totalImports = 0;
  let resolvedImports = 0;

  try {
    // Get workspace handle to collect all existing files
    const linkedFolder = await fileSystemStorage.getHandle(projectId);
    if (!linkedFolder) {
      return {
        valid: true, // Can't validate without workspace
        totalImports: 0,
        resolvedImports: 0,
        unresolvedImports: [],
        checkedFiles: 0,
        durationMs: Date.now() - startTime,
      };
    }

    // Collect all files currently in the workspace
    const existingFiles = await collectWorkspaceFiles(linkedFolder.handle);

    // Also include the files we just wrote (they may not be in the workspace yet
    // if the FS API hasn't flushed, or they may reference each other)
    for (const f of filesToValidate) {
      existingFiles.add(f.path);
    }

    // Check each file's imports
    for (const file of filesToValidate) {
      // Only check TypeScript/JavaScript files
      const ext = file.path.split('.').pop()?.toLowerCase();
      if (!ext || !['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
        continue;
      }

      const sourceDir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : '';
      const lines = file.content.split('\n');

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        IMPORT_REGEX.lastIndex = 0;
        let match;

        while ((match = IMPORT_REGEX.exec(line)) !== null) {
          const importPath = match[1];

          // Only validate relative imports
          if (!isRelativeImport(importPath)) continue;

          totalImports++;
          const resolved = resolveImport(importPath, sourceDir, existingFiles);

          if (resolved) {
            resolvedImports++;
          } else {
            unresolvedImports.push({
              sourceFile: file.path,
              importPath,
              line: lineNum + 1,
            });
          }
        }
      }
    }

    return {
      valid: unresolvedImports.length === 0,
      totalImports,
      resolvedImports,
      unresolvedImports,
      checkedFiles: filesToValidate.length,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      valid: true, // Don't block on validation errors
      totalImports: 0,
      resolvedImports: 0,
      unresolvedImports: [],
      checkedFiles: 0,
      durationMs: Date.now() - startTime,
    };
  }
}
