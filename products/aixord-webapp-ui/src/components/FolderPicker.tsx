/**
 * FolderPicker Component
 *
 * Allows users to link a local project folder to their AIXORD project
 * using the Browser File System Access API.
 *
 * Features:
 * - Select folder via native file picker
 * - Display linked folder status
 * - Reconnect to previously linked folder
 * - Unlink folder
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isFileSystemAccessSupported,
  requestFolderAccess,
  verifyPermission,
  fileSystemStorage,
  type LinkedFolder,
} from '../lib/fileSystem';

interface FolderPickerProps {
  projectId: string;
  onFolderLinked?: (folder: LinkedFolder) => void;
  onFolderUnlinked?: () => void;
  compact?: boolean;
}

export function FolderPicker({
  projectId,
  onFolderLinked,
  onFolderUnlinked,
  compact = false,
}: FolderPickerProps) {
  const [linkedFolder, setLinkedFolder] = useState<LinkedFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'prompt' | 'denied' | null>(null);

  // Check for existing linked folder on mount
  useEffect(() => {
    async function checkExistingLink() {
      setIsLoading(true);
      try {
        const existing = await fileSystemStorage.getHandle(projectId);
        if (existing) {
          // Verify we still have permission
          const hasPermission = await verifyPermission(existing.handle, true);
          if (hasPermission) {
            setLinkedFolder(existing);
            setPermissionStatus('granted');
            onFolderLinked?.(existing);
          } else {
            setPermissionStatus('prompt');
            setLinkedFolder(existing);
          }
        }
      } catch (err) {
        console.error('Failed to check existing folder link:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isFileSystemAccessSupported()) {
      checkExistingLink();
    } else {
      setIsLoading(false);
    }
  }, [projectId, onFolderLinked]);

  // Request folder access
  const handleSelectFolder = useCallback(async () => {
    setError(null);
    try {
      const handle = await requestFolderAccess();
      if (handle) {
        const folder = await fileSystemStorage.saveHandle(projectId, handle);
        setLinkedFolder(folder);
        setPermissionStatus('granted');
        onFolderLinked?.(folder);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select folder');
    }
  }, [projectId, onFolderLinked]);

  // Reconnect to existing folder (revalidate permission)
  const handleReconnect = useCallback(async () => {
    if (!linkedFolder) return;
    setError(null);
    try {
      const hasPermission = await verifyPermission(linkedFolder.handle, true);
      if (hasPermission) {
        setPermissionStatus('granted');
        onFolderLinked?.(linkedFolder);
      } else {
        setPermissionStatus('denied');
        setError('Permission denied. Please try selecting the folder again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reconnect');
    }
  }, [linkedFolder, onFolderLinked]);

  // Unlink folder
  const handleUnlink = useCallback(async () => {
    try {
      await fileSystemStorage.removeHandle(projectId);
      setLinkedFolder(null);
      setPermissionStatus(null);
      onFolderUnlinked?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink folder');
    }
  }, [projectId, onFolderUnlinked]);

  // API not supported
  if (!isFileSystemAccessSupported()) {
    return (
      <div className={`bg-gray-800/50 rounded-xl border border-gray-700/50 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3 text-amber-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium">Browser Not Supported</p>
            <p className="text-xs text-gray-400">
              File System Access requires Chrome, Edge, or Opera
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl border border-gray-700/50 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent" />
          <span className="text-gray-400 text-sm">Checking folder link...</span>
        </div>
      </div>
    );
  }

  // Compact view for sidebar/header
  if (compact) {
    if (linkedFolder && permissionStatus === 'granted') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-green-300 text-sm truncate max-w-[120px]" title={linkedFolder.name}>
            {linkedFolder.name}
          </span>
          <button
            onClick={handleUnlink}
            className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
            title="Unlink folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={linkedFolder ? handleReconnect : handleSelectFolder}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors text-sm"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="text-gray-300">
          {linkedFolder ? 'Reconnect Folder' : 'Link Folder'}
        </span>
      </button>
    );
  }

  // Full view
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Local Files
        </h3>
        {linkedFolder && permissionStatus === 'granted' && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
            Connected
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Linked Folder Display */}
      {linkedFolder && permissionStatus === 'granted' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{linkedFolder.name}</p>
              <p className="text-gray-500 text-xs">
                Linked {new Date(linkedFolder.linkedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSelectFolder}
              className="flex-1 px-3 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-sm"
            >
              Change Folder
            </button>
            <button
              onClick={handleUnlink}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
            >
              Unlink
            </button>
          </div>
        </div>
      ) : linkedFolder && permissionStatus === 'prompt' ? (
        // Need to reconnect
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-300 text-sm font-medium">Permission Required</p>
              <p className="text-gray-400 text-xs">
                Click reconnect to restore access to "{linkedFolder.name}"
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReconnect}
              className="flex-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Reconnect
            </button>
            <button
              onClick={handleUnlink}
              className="px-3 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-400 rounded-lg transition-colors text-sm"
            >
              Forget
            </button>
          </div>
        </div>
      ) : (
        // No folder linked
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Link a local folder to access project files directly from AIXORD.
            Your browser will ask for permission to read and write files.
          </p>

          <button
            onClick={handleSelectFolder}
            className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Select Folder
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Access only to folder you select
            </p>
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Revoke access anytime
            </p>
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No background scanning
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FolderPicker;
