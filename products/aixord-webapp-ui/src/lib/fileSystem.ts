/**
 * File System Access API Integration
 *
 * Provides secure, user-consented access to local project folders
 * using the Browser File System Access API.
 *
 * Security Model:
 * - User explicitly selects folder via showDirectoryPicker()
 * - Access scoped ONLY to selected folder and children
 * - No parent folder access (API enforces this)
 * - Handles stored in IndexedDB (reference only, not file contents)
 * - User can revoke access anytime
 */

// TypeScript declarations for File System Access API
// These extend the standard DOM types for browsers that support the API
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemHandle {
    queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  }

  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
    getFile(): Promise<File>;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | BufferSource | Blob): Promise<void>;
    close(): Promise<void>;
  }
}

// ============================================================================
// Types
// ============================================================================

export interface FileSystemFile {
  name: string;
  path: string;
  type: 'file';
  size: number;
  lastModified: number;
  extension: string;
  handle: FileSystemFileHandle;
}

export interface FileSystemFolder {
  name: string;
  path: string;
  type: 'folder';
  handle: FileSystemDirectoryHandle;
  children?: FileSystemEntry[];
}

export type FileSystemEntry = FileSystemFile | FileSystemFolder;

export interface LinkedFolder {
  id: string;
  projectId: string;
  name: string;
  linkedAt: string;
  handle: FileSystemDirectoryHandle;
}

export interface FileContent {
  name: string;
  path: string;
  content: string;
  size: number;
  lastModified: number;
}

// ============================================================================
// IndexedDB Storage for Folder Handles
// ============================================================================

const DB_NAME = 'aixord-filesystem';
const DB_VERSION = 1;
const STORE_NAME = 'folder-handles';

class FileSystemStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveHandle(projectId: string, handle: FileSystemDirectoryHandle): Promise<LinkedFolder> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const linkedFolder: LinkedFolder = {
      id: `folder_${projectId}`,
      projectId,
      name: handle.name,
      linkedAt: new Date().toISOString(),
      handle,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(linkedFolder);

      request.onsuccess = () => resolve(linkedFolder);
      request.onerror = () => reject(new Error('Failed to save folder handle'));
    });
  }

  async getHandle(projectId: string): Promise<LinkedFolder | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(`folder_${projectId}`);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get folder handle'));
    });
  }

  async removeHandle(projectId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(`folder_${projectId}`);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove folder handle'));
    });
  }

  async listHandles(): Promise<LinkedFolder[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Failed to list folder handles'));
    });
  }
}

export const fileSystemStorage = new FileSystemStorage();

// ============================================================================
// File System Access API Helpers
// ============================================================================

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

/**
 * Request user to select a folder
 * Returns the directory handle if granted, null if cancelled
 */
export async function requestFolderAccess(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser');
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });
    return handle;
  } catch (err) {
    // User cancelled the picker
    if (err instanceof Error && err.name === 'AbortError') {
      return null;
    }
    throw err;
  }
}

/**
 * Verify permission for an existing handle
 * Browser may prompt user to reconfirm access
 */
export async function verifyPermission(
  handle: FileSystemDirectoryHandle,
  readWrite: boolean = true
): Promise<boolean> {
  const options = {
    mode: (readWrite ? 'readwrite' : 'read') as 'read' | 'readwrite',
  };

  // Check current permission state
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }

  // Request permission (may show browser prompt)
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : '';
}

/**
 * Read directory contents (non-recursive by default)
 */
export async function readDirectory(
  handle: FileSystemDirectoryHandle,
  path: string = '',
  recursive: boolean = false,
  maxDepth: number = 3
): Promise<FileSystemEntry[]> {
  const entries: FileSystemEntry[] = [];
  const currentPath = path || handle.name;

  for await (const [name, entryHandle] of handle.entries()) {
    if (entryHandle.kind === 'file') {
      const fileHandle = entryHandle as FileSystemFileHandle;
      try {
        const file = await fileHandle.getFile();
        entries.push({
          name,
          path: `${currentPath}/${name}`,
          type: 'file',
          size: file.size,
          lastModified: file.lastModified,
          extension: getExtension(name),
          handle: fileHandle,
        });
      } catch {
        // Skip files we can't access
      }
    } else if (entryHandle.kind === 'directory') {
      const dirHandle = entryHandle as FileSystemDirectoryHandle;
      const folder: FileSystemFolder = {
        name,
        path: `${currentPath}/${name}`,
        type: 'folder',
        handle: dirHandle,
      };

      if (recursive && maxDepth > 0) {
        folder.children = await readDirectory(dirHandle, folder.path, true, maxDepth - 1);
      }

      entries.push(folder);
    }
  }

  // Sort: folders first, then files, alphabetically
  return entries.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Read file contents as text
 */
export async function readFileContent(handle: FileSystemFileHandle): Promise<FileContent> {
  const file = await handle.getFile();
  const content = await file.text();

  return {
    name: file.name,
    path: handle.name, // Will be updated by caller with full path
    content,
    size: file.size,
    lastModified: file.lastModified,
  };
}

/**
 * Write content to a file
 */
export async function writeFileContent(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Create a new file in a directory
 */
export async function createFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string = ''
): Promise<FileSystemFileHandle> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  if (content) {
    await writeFileContent(fileHandle, content);
  }
  return fileHandle;
}

/**
 * Create a new subdirectory
 */
export async function createDirectory(
  parentHandle: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return parentHandle.getDirectoryHandle(name, { create: true });
}

/**
 * Delete a file or directory
 */
export async function deleteEntry(
  parentHandle: FileSystemDirectoryHandle,
  name: string,
  recursive: boolean = false
): Promise<void> {
  await parentHandle.removeEntry(name, { recursive });
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(extension: string): string {
  const iconMap: Record<string, string> = {
    // Documents
    md: '📝',
    txt: '📄',
    pdf: '📕',
    doc: '📘',
    docx: '📘',

    // Code
    ts: '🔷',
    tsx: '⚛️',
    js: '🟨',
    jsx: '⚛️',
    json: '📋',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    py: '🐍',
    rs: '🦀',
    go: '🐹',

    // Config
    yaml: '⚙️',
    yml: '⚙️',
    toml: '⚙️',
    env: '🔐',

    // Images
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    svg: '🖼️',

    // Data
    csv: '📊',
    sql: '🗃️',

    // Default
    '': '📄',
  };

  return iconMap[extension] || '📄';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if file is likely text-based (can be displayed)
 */
export function isTextFile(extension: string): boolean {
  const textExtensions = [
    'txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml',
    'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp',
    'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd',
    'sql', 'graphql', 'gql',
    'env', 'gitignore', 'dockerfile',
    'csv', 'log',
  ];
  return textExtensions.includes(extension.toLowerCase());
}
