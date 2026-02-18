/**
 * READ_FILE_REQUEST Parser & Resolver
 *
 * When the AI outputs a === READ_FILE_REQUEST === block, the frontend:
 * 1. Parses the requested file paths
 * 2. Reads them from the workspace via File System Access API
 * 3. Formats the contents as a follow-up context injection
 *
 * This creates a "virtual tool call" loop without needing full
 * tool-use infrastructure in the provider layer.
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

export interface ReadFileRequest {
  paths: string[];
  reason: string;
}

export interface ReadFileResult {
  path: string;
  found: boolean;
  content?: string;
  size?: number;
  error?: string;
}

export interface ReadFileResponse {
  /** Whether any READ_FILE_REQUEST blocks were found */
  hasRequests: boolean;
  /** Parsed requests from the AI response */
  requests: ReadFileRequest[];
  /** Results of reading the files */
  results: ReadFileResult[];
  /** Formatted context string to inject as a follow-up user message */
  contextMessage: string;
  /** Number of files successfully read */
  filesRead: number;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE = 150 * 1024; // 150KB per file
const MAX_FILES_PER_REQUEST = 5;

// ============================================================================
// Parser
// ============================================================================

/**
 * Parse READ_FILE_REQUEST blocks from an AI response.
 *
 * Format:
 * === READ_FILE_REQUEST ===
 * paths:
 * - path/to/file.ext
 * - another/file.md
 * reason: Brief explanation
 * === END READ_FILE_REQUEST ===
 */
export function parseReadFileRequests(content: string): ReadFileRequest[] {
  const requests: ReadFileRequest[] = [];
  const blockRegex = /=== READ_FILE_REQUEST ===\s*([\s\S]*?)\s*=== END READ_FILE_REQUEST ===/g;

  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const blockContent = match[1];

    // Parse paths (lines starting with -)
    const paths: string[] = [];
    const pathLines = blockContent.match(/^[\s]*-\s*(.+)$/gm);
    if (pathLines) {
      for (const line of pathLines) {
        const pathMatch = line.match(/^[\s]*-\s*(.+)$/);
        if (pathMatch) {
          const path = pathMatch[1].trim();
          // Normalize: remove leading ./ or /, forward slashes only
          const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
          if (normalized && !normalized.includes('..')) {
            paths.push(normalized);
          }
        }
      }
    }

    // Parse reason
    const reasonMatch = blockContent.match(/reason:\s*(.+)/i);
    const reason = reasonMatch ? reasonMatch[1].trim() : '';

    if (paths.length > 0) {
      requests.push({
        paths: paths.slice(0, MAX_FILES_PER_REQUEST),
        reason,
      });
    }
  }

  return requests;
}

// ============================================================================
// Resolver
// ============================================================================

/**
 * Read requested files from the workspace using File System Access API.
 */
async function resolveRequestedFiles(
  paths: string[],
  rootHandle: FileSystemDirectoryHandle
): Promise<ReadFileResult[]> {
  const results: ReadFileResult[] = [];

  for (const filePath of paths) {
    try {
      const segments = filePath.split('/').filter(Boolean);
      if (segments.length === 0) {
        results.push({ path: filePath, found: false, error: 'Empty path' });
        continue;
      }

      // Navigate to directory containing the file
      let currentDir = rootHandle;
      for (let i = 0; i < segments.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(segments[i]);
      }

      // Get the file
      const fileName = segments[segments.length - 1];
      const fileHandle = await currentDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();

      // Check size
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          path: filePath,
          found: true,
          size: file.size,
          error: `File too large (${(file.size / 1024).toFixed(1)} KB, limit is ${MAX_FILE_SIZE / 1024} KB)`,
        });
        continue;
      }

      // Check if text file
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (!isTextFile(ext)) {
        results.push({
          path: filePath,
          found: true,
          size: file.size,
          error: 'Binary file — cannot display contents',
        });
        continue;
      }

      // Read content
      const fileData = await readFileContent(fileHandle);
      results.push({
        path: filePath,
        found: true,
        content: fileData.content,
        size: file.size,
      });
    } catch {
      results.push({
        path: filePath,
        found: false,
        error: 'File not found in workspace',
      });
    }
  }

  return results;
}

// ============================================================================
// Context Formatter
// ============================================================================

/**
 * Format file read results into a context message for the AI.
 */
function formatFileResults(results: ReadFileResult[], reason: string): string {
  const parts: string[] = [
    `=== FILE CONTENTS (auto-read from workspace) ===`,
    reason ? `Request reason: ${reason}` : '',
    '',
  ];

  for (const result of results) {
    if (result.found && result.content) {
      const sizeStr = result.size ? `${(result.size / 1024).toFixed(1)} KB` : 'unknown size';
      parts.push(`--- ${result.path} (${sizeStr}) ---`);
      parts.push(result.content);
      parts.push(`--- END ${result.path} ---`);
      parts.push('');
    } else if (result.found && result.error) {
      parts.push(`--- ${result.path} ---`);
      parts.push(`[${result.error}]`);
      parts.push(`--- END ${result.path} ---`);
      parts.push('');
    } else {
      parts.push(`--- ${result.path} ---`);
      parts.push(`[${result.error || 'File not found in workspace'}]`);
      parts.push(`--- END ${result.path} ---`);
      parts.push('');
    }
  }

  parts.push('=== END FILE CONTENTS ===');
  parts.push('');
  parts.push('IMPORTANT: These file contents are EPHEMERAL — they will NOT be stored in the conversation history.');
  parts.push('Analyze the file contents above and provide your insights, summary, or analysis in your response.');
  parts.push('Do NOT echo or reproduce the raw file contents. Your analysis is what persists in the session.');

  return parts.filter(Boolean).join('\n');
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Process an AI response for READ_FILE_REQUEST blocks.
 *
 * If found, reads the requested files from the workspace and returns
 * a formatted context message to inject as a follow-up.
 *
 * @param aiResponse - The AI's response content
 * @param projectId - Project ID for workspace handle lookup
 * @returns ReadFileResponse with results and formatted context message
 */
export async function processReadFileRequests(
  aiResponse: string,
  projectId: string
): Promise<ReadFileResponse> {
  // Parse requests from AI response
  const requests = parseReadFileRequests(aiResponse);

  if (requests.length === 0) {
    return {
      hasRequests: false,
      requests: [],
      results: [],
      contextMessage: '',
      filesRead: 0,
    };
  }

  // Get workspace handle
  const linkedFolder = await fileSystemStorage.getHandle(projectId);
  if (!linkedFolder) {
    return {
      hasRequests: true,
      requests,
      results: [],
      contextMessage: '[Workspace not bound — cannot read requested files]',
      filesRead: 0,
    };
  }

  // Verify permission
  const hasPermission = await verifyPermission(linkedFolder.handle, false);
  if (!hasPermission) {
    return {
      hasRequests: true,
      requests,
      results: [],
      contextMessage: '[Workspace permission denied — cannot read requested files]',
      filesRead: 0,
    };
  }

  // Collect all unique paths across all requests
  const allPaths = new Set<string>();
  let combinedReason = '';
  for (const req of requests) {
    for (const path of req.paths) {
      allPaths.add(path);
    }
    if (req.reason) {
      combinedReason = combinedReason ? `${combinedReason}; ${req.reason}` : req.reason;
    }
  }

  // Read files
  const results = await resolveRequestedFiles(
    Array.from(allPaths).slice(0, MAX_FILES_PER_REQUEST),
    linkedFolder.handle
  );

  // Format response
  const contextMessage = formatFileResults(results, combinedReason);
  const filesRead = results.filter(r => r.found && r.content).length;

  return {
    hasRequests: true,
    requests,
    results,
    contextMessage,
    filesRead,
  };
}
