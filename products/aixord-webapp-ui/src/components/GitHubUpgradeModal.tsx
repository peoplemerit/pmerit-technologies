/**
 * GitHubUpgradeModal.tsx (HANDOFF-GITHUB-MODE-UPGRADE-UX-01, TASK 1)
 *
 * Explains permission changes before redirecting to GitHub OAuth for mode upgrade.
 * Shows clear comparison of current vs. upgraded permissions.
 *
 * Accessibility: closes on ESC key, backdrop click, or Cancel button.
 */

import { useEffect, useCallback } from 'react';

export interface GitHubUpgradeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GitHubUpgradeModal({ isOpen, onConfirm, onCancel }: GitHubUpgradeModalProps) {
  // ESC key handler for accessibility
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            Enable Full Workspace Integration
          </h3>
          <p className="text-sm text-gray-400">
            To commit files, create repositories, and push code to GitHub,
            D4-CHAT needs additional permissions.
          </p>
        </div>

        {/* Permission Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Current Access */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Current Access (Evidence Only)
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start text-green-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Read commits, pull requests, releases</span>
              </li>
              <li className="flex items-start text-green-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sync to Reconciliation Triad</span>
              </li>
              <li className="flex items-start text-red-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Cannot write to repositories</span>
              </li>
              <li className="flex items-start text-red-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Cannot create repositories</span>
              </li>
            </ul>
          </div>

          {/* Upgraded Access */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              After Upgrade (Full Workspace)
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start text-green-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Everything in Evidence Only, plus:</span>
              </li>
              <li className="flex items-start text-blue-300 font-medium">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create repositories</span>
              </li>
              <li className="flex items-start text-blue-300 font-medium">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Commit scaffold files</span>
              </li>
              <li className="flex items-start text-blue-300 font-medium">
                <svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Push to feature branches</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="text-sm font-semibold text-yellow-500 mb-1">Security Guarantee</h5>
              <p className="text-xs text-yellow-200">
                D4-CHAT will <strong>only write to branches</strong> named{' '}
                <code className="bg-gray-900 px-1.5 py-0.5 rounded text-yellow-300">
                  aixord/{'{project-name}'}
                </code>
                . We will <strong>never</strong> write to{' '}
                <code className="bg-gray-900 px-1.5 py-0.5 rounded text-red-400">main</code> or{' '}
                <code className="bg-gray-900 px-1.5 py-0.5 rounded text-red-400">master</code>.
                All commits create draft pull requests for your review.
              </p>
            </div>
          </div>
        </div>

        {/* Why Re-Authorization Required */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Why do I need to authorize again?
          </h5>
          <p className="text-xs text-gray-400">
            GitHub's security model requires explicit permission for each level of access.
            When you first connected, we only requested <strong>read-only</strong> access.
            To enable write capabilities, we need you to grant additional permissions via GitHub.
            This is a one-time re-authorization.
          </p>
        </div>

        {/* Documentation Link */}
        <div className="text-xs text-gray-400 mb-4">
          <a
            href="/docs/github-integration"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Learn more about GitHub integration modes
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Authorize Write Access
          </button>
        </div>
      </div>
    </div>
  );
}

export default GitHubUpgradeModal;
