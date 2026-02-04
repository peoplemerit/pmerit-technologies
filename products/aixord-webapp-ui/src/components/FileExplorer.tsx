/**
 * FileExplorer Component
 *
 * Browse and interact with files in a linked folder.
 * Supports file preview, selection for chat attachment, and basic operations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  readDirectory,
  readFileContent,
  getFileIcon,
  formatFileSize,
  isTextFile,
  type FileSystemEntry,
  type FileSystemFile,
  type FileSystemFolder,
  type FileContent,
} from '../lib/fileSystem';

interface FileExplorerProps {
  folderHandle: FileSystemDirectoryHandle;
  folderName: string;
  onFileSelect?: (file: FileSystemFile, content?: FileContent) => void;
  onFilesSelect?: (files: FileSystemFile[]) => void;
  selectedFiles?: FileSystemFile[];
  multiSelect?: boolean;
  showPreview?: boolean;
}

export function FileExplorer({
  folderHandle,
  folderName,
  onFileSelect,
  onFilesSelect,
  selectedFiles = [],
  multiSelect = false,
  showPreview = true,
}: FileExplorerProps) {
  const [entries, setEntries] = useState<FileSystemEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentHandle, setCurrentHandle] = useState<FileSystemDirectoryHandle>(folderHandle);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileContent | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load directory contents
  const loadDirectory = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    setError(null);
    try {
      const contents = await readDirectory(handle);
      setEntries(contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read directory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load root directory on mount
  useEffect(() => {
    setCurrentHandle(folderHandle);
    setCurrentPath([]);
    loadDirectory(folderHandle);
  }, [folderHandle, loadDirectory]);

  // Navigate to a folder
  const navigateToFolder = useCallback(async (folder: FileSystemFolder) => {
    setCurrentHandle(folder.handle);
    setCurrentPath((prev) => [...prev, folder.name]);
    await loadDirectory(folder.handle);
    setPreviewFile(null);
  }, [loadDirectory]);

  // Navigate up one level
  const navigateUp = useCallback(async () => {
    if (currentPath.length === 0) return;

    // Reconstruct path to parent
    const newPath = currentPath.slice(0, -1);
    let handle = folderHandle;

    for (const segment of newPath) {
      handle = await handle.getDirectoryHandle(segment);
    }

    setCurrentHandle(handle);
    setCurrentPath(newPath);
    await loadDirectory(handle);
    setPreviewFile(null);
  }, [currentPath, folderHandle, loadDirectory]);

  // Navigate to specific path index
  const navigateToPathIndex = useCallback(async (index: number) => {
    if (index < 0) {
      setCurrentHandle(folderHandle);
      setCurrentPath([]);
      await loadDirectory(folderHandle);
      setPreviewFile(null);
      return;
    }

    const newPath = currentPath.slice(0, index + 1);
    let handle = folderHandle;

    for (const segment of newPath) {
      handle = await handle.getDirectoryHandle(segment);
    }

    setCurrentHandle(handle);
    setCurrentPath(newPath);
    await loadDirectory(handle);
    setPreviewFile(null);
  }, [currentPath, folderHandle, loadDirectory]);

  // Preview a file
  const handlePreview = useCallback(async (file: FileSystemFile) => {
    if (!isTextFile(file.extension)) {
      setPreviewFile({
        name: file.name,
        path: file.path,
        content: `[Binary file: ${file.extension.toUpperCase()}]\n\nSize: ${formatFileSize(file.size)}\nLast modified: ${new Date(file.lastModified).toLocaleString()}`,
        size: file.size,
        lastModified: file.lastModified,
      });
      return;
    }

    setPreviewLoading(true);
    try {
      const content = await readFileContent(file.handle);
      content.path = file.path;
      setPreviewFile(content);
    } catch (err) {
      setPreviewFile({
        name: file.name,
        path: file.path,
        content: `Error reading file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        size: file.size,
        lastModified: file.lastModified,
      });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Select a file
  const handleFileClick = useCallback(async (file: FileSystemFile) => {
    if (showPreview) {
      await handlePreview(file);
    }

    if (multiSelect && onFilesSelect) {
      const isSelected = selectedFiles.some((f) => f.path === file.path);
      if (isSelected) {
        onFilesSelect(selectedFiles.filter((f) => f.path !== file.path));
      } else {
        onFilesSelect([...selectedFiles, file]);
      }
    } else if (onFileSelect) {
      if (isTextFile(file.extension)) {
        const content = await readFileContent(file.handle);
        content.path = file.path;
        onFileSelect(file, content);
      } else {
        onFileSelect(file);
      }
    }
  }, [showPreview, handlePreview, multiSelect, onFilesSelect, selectedFiles, onFileSelect]);

  // Check if file is selected
  const isFileSelected = useCallback(
    (file: FileSystemFile) => selectedFiles.some((f) => f.path === file.path),
    [selectedFiles]
  );

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col h-full">
      {/* Header / Breadcrumb */}
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigateToPathIndex(-1)}
            className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {folderName}
          </button>
          {currentPath.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => navigateToPathIndex(index)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {segment}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto border-r border-gray-700/50`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => loadDirectory(currentHandle)}
                className="mt-2 text-violet-400 hover:text-violet-300 text-sm"
              >
                Retry
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Empty folder
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {/* Back button if not at root */}
              {currentPath.length > 0 && (
                <button
                  onClick={navigateUp}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span className="text-gray-400 text-sm">..</span>
                </button>
              )}

              {/* Entries */}
              {entries.map((entry) => (
                <div key={entry.path}>
                  {entry.type === 'folder' ? (
                    <button
                      onClick={() => navigateToFolder(entry)}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-white text-sm flex-1 text-left truncate">{entry.name}</span>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFileClick(entry)}
                      className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700/30 transition-colors ${
                        isFileSelected(entry) ? 'bg-violet-500/20' : ''
                      }`}
                    >
                      {multiSelect && (
                        <div
                          className={`w-4 h-4 rounded border ${
                            isFileSelected(entry)
                              ? 'bg-violet-500 border-violet-500'
                              : 'border-gray-600'
                          } flex items-center justify-center`}
                        >
                          {isFileSelected(entry) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="text-lg" role="img" aria-label={entry.extension}>
                        {getFileIcon(entry.extension)}
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-sm truncate">{entry.name}</p>
                        <p className="text-gray-500 text-xs">
                          {formatFileSize(entry.size)} • {new Date(entry.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      {previewFile?.path === entry.path && (
                        <div className="w-2 h-2 bg-violet-500 rounded-full" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            {previewLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
              </div>
            ) : previewFile ? (
              <>
                {/* Preview Header */}
                <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{previewFile.name}</p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(previewFile.size)} • {new Date(previewFile.lastModified).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap break-words">
                    {previewFile.content.length > 50000
                      ? `${previewFile.content.slice(0, 50000)}\n\n[Content truncated - file too large]`
                      : previewFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Select a file to preview</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with selection info */}
      {multiSelect && selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-800/30 flex items-center justify-between">
          <span className="text-gray-400 text-sm">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => onFilesSelect?.([])}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

export default FileExplorer;
