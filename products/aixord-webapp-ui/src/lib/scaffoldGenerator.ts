/**
 * Scaffold Generator — Write folder templates to linked directory
 *
 * Recursively walks a TemplateNode[] tree and creates directories/files
 * using the existing File System Access API utilities from fileSystem.ts.
 *
 * This activates the previously unused createDirectory() and createFile()
 * functions from fileSystem.ts (lines 340-360).
 */

import { createDirectory, createFile } from './fileSystem';
import type { TemplateNode } from './workspaceTemplates';

export interface ScaffoldResult {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Generate scaffold by writing template structure to the linked folder.
 * Skips entries that already exist (non-destructive).
 */
export async function generateScaffold(
  rootHandle: FileSystemDirectoryHandle,
  template: TemplateNode[]
): Promise<ScaffoldResult> {
  const result: ScaffoldResult = { created: 0, skipped: 0, errors: [] };

  for (const node of template) {
    await processNode(rootHandle, node, '', result);
  }

  return result;
}

async function processNode(
  parentHandle: FileSystemDirectoryHandle,
  node: TemplateNode,
  path: string,
  result: ScaffoldResult
): Promise<void> {
  const fullPath = path ? `${path}/${node.name}` : node.name;

  try {
    if (node.type === 'folder') {
      // Check if folder already exists
      let dirHandle: FileSystemDirectoryHandle;
      try {
        dirHandle = await parentHandle.getDirectoryHandle(node.name);
        result.skipped++;
      } catch {
        // Doesn't exist — create it
        dirHandle = await createDirectory(parentHandle, node.name);
        result.created++;
      }

      // Recurse into children
      if (node.children) {
        for (const child of node.children) {
          await processNode(dirHandle, child, fullPath, result);
        }
      }
    } else {
      // File — check if it exists
      try {
        await parentHandle.getFileHandle(node.name);
        result.skipped++; // Already exists — don't overwrite
      } catch {
        // Doesn't exist — create it
        await createFile(parentHandle, node.name, node.content || '');
        result.created++;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`${fullPath}: ${message}`);
  }
}
