/**
 * FileAttachment Component
 *
 * UI for attaching files from the linked folder to chat messages.
 * Shows a modal file picker and displays attached files as chips.
 */

import { useState, useCallback } from 'react';
import { FileExplorer } from './FileExplorer';
import {
  getFileIcon,
  formatFileSize,
  isTextFile,
  readFileContent,
  type FileSystemFile,
  type FileContent,
} from '../lib/fileSystem';

export interface AttachedFile {
  file: FileSystemFile;
  content?: FileContent;
  includeContent: boolean;
}

interface FileAttachmentProps {
  folderHandle: FileSystemDirectoryHandle | null;
  folderName: string;
  attachedFiles: AttachedFile[];
  onAttach: (files: AttachedFile[]) => void;
  onRemove: (file: AttachedFile) => void;
  onClear: () => void;
  maxFiles?: number;
  maxContentSize?: number; // Max size for including content (in bytes)
}

export function FileAttachment({
  folderHandle,
  folderName,
  attachedFiles,
  onAttach,
  onRemove,
  onClear,
  maxFiles = 5,
  maxContentSize = 100000, // 100KB default
}: FileAttachmentProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileSystemFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection from explorer
  const handleFilesSelect = useCallback((files: FileSystemFile[]) => {
    setSelectedFiles(files.slice(0, maxFiles - attachedFiles.length));
  }, [maxFiles, attachedFiles.length]);

  // Attach selected files
  const handleAttach = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const newAttachments: AttachedFile[] = await Promise.all(
        selectedFiles.map(async (file) => {
          // Only include content for text files under size limit
          const shouldIncludeContent = isTextFile(file.extension) && file.size <= maxContentSize;
          let content: FileContent | undefined;

          if (shouldIncludeContent) {
            try {
              content = await readFileContent(file.handle);
              content.path = file.path;
            } catch {
              // Skip content if read fails
            }
          }

          return {
            file,
            content,
            includeContent: shouldIncludeContent && !!content,
          };
        })
      );

      onAttach(newAttachments);
      setSelectedFiles([]);
      setShowPicker(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, maxContentSize, onAttach]);

  // Toggle content inclusion for an attached file
  const toggleContentInclusion = useCallback(async (attachment: AttachedFile) => {
    if (!attachment.content && isTextFile(attachment.file.extension)) {
      // Load content if not already loaded
      try {
        const content = await readFileContent(attachment.file.handle);
        content.path = attachment.file.path;
        onAttach([{
          ...attachment,
          content,
          includeContent: true,
        }]);
      } catch {
        // Ignore errors
      }
    } else {
      // Toggle inclusion
      onAttach([{
        ...attachment,
        includeContent: !attachment.includeContent,
      }]);
    }
  }, [onAttach]);

  // No folder linked
  if (!folderHandle) {
    return null;
  }

  return (
    <>
      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((attachment) => (
            <div
              key={attachment.file.path}
              className="flex items-center gap-2 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm group"
            >
              <span className="text-base" role="img" aria-label={attachment.file.extension}>
                {getFileIcon(attachment.file.extension)}
              </span>
              <span className="text-gray-300 max-w-[120px] truncate" title={attachment.file.name}>
                {attachment.file.name}
              </span>
              {isTextFile(attachment.file.extension) && (
                <button
                  onClick={() => toggleContentInclusion(attachment)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                    attachment.includeContent
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-gray-700/50 text-gray-500 hover:text-gray-300'
                  }`}
                  title={attachment.includeContent ? 'Content included' : 'Click to include content'}
                >
                  {attachment.includeContent ? 'Content' : 'Ref'}
                </button>
              )}
              <button
                onClick={() => onRemove(attachment)}
                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {attachedFiles.length > 1 && (
            <button
              onClick={onClear}
              className="px-2 py-1 text-gray-500 hover:text-red-400 text-xs transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Attach Button */}
      {attachedFiles.length < maxFiles && (
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm"
          title="Attach files from linked folder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Attach
        </button>
      )}

      {/* File Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-white">Attach Files</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Select files to attach to your message ({selectedFiles.length}/{maxFiles - attachedFiles.length} selected)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPicker(false);
                  setSelectedFiles([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* File Explorer */}
            <div className="flex-1 overflow-hidden p-4" style={{ minHeight: '400px' }}>
              <FileExplorer
                folderHandle={folderHandle}
                folderName={folderName}
                selectedFiles={selectedFiles}
                onFilesSelect={handleFilesSelect}
                multiSelect={true}
                showPreview={true}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800/50">
              <div className="text-sm text-gray-400">
                {selectedFiles.length > 0 ? (
                  <span>
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} •{' '}
                    {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                  </span>
                ) : (
                  <span>Select files to attach</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPicker(false);
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAttach}
                  disabled={selectedFiles.length === 0 || isLoading}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Attaching...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attach {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Utility to format attachments for chat context
export function formatAttachmentsForContext(attachments: AttachedFile[]): string {
  if (attachments.length === 0) return '';

  const sections: string[] = [];

  for (const attachment of attachments) {
    if (attachment.includeContent && attachment.content) {
      sections.push(`--- FILE: ${attachment.file.path} ---\n${attachment.content.content}\n--- END FILE ---`);
    } else {
      sections.push(`[Attached: ${attachment.file.path} (${formatFileSize(attachment.file.size)})]`);
    }
  }

  return `\n\nAttached Files:\n${sections.join('\n\n')}`;
}

export default FileAttachment;
