/**
 * GitHub Connect Component (PATCH-GITHUB-01 + DUAL-MODE-01 + UPGRADE-UX-01)
 *
 * Displays GitHub connection status and allows connecting/disconnecting.
 * Supports dual modes:
 * - READ_ONLY: Evidence sync only (default for non-software projects)
 * - WORKSPACE_SYNC: Full read-write (default for Software — Full Governance)
 *
 * UPGRADE-UX-01: Upgrade modal + success toast for mode upgrade flow.
 */

import { useState, useEffect } from 'react';
import type { GitHubConnection, GitHubMode } from '../lib/api';
import { GitHubUpgradeModal } from './GitHubUpgradeModal';

interface GitHubConnectProps {
  projectId: string;
  connection: GitHubConnection | null;
  onConnect: (mode?: GitHubMode) => void;
  onDisconnect: () => void;
  onSelectRepo?: (repoOwner: string, repoName: string) => void;
  onUpgradeMode?: () => void;
  isLoading?: boolean;
  repos?: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
  /** Default mode suggestion based on project type */
  defaultMode?: GitHubMode;
}

export function GitHubConnect({
  connection,
  onConnect,
  onDisconnect,
  onSelectRepo,
  onUpgradeMode,
  isLoading = false,
  repos = [],
  defaultMode = 'READ_ONLY',
}: GitHubConnectProps) {
  const [showRepoSelect, setShowRepoSelect] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedMode, setSelectedMode] = useState<GitHubMode>(defaultMode);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // UPGRADE-UX-01: Detect successful upgrade from OAuth callback URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('github_upgraded') === 'true') {
      setShowSuccessToast(true);
      // Clear URL parameter without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('github_upgraded');
      window.history.replaceState({}, '', url.toString());
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const isConnected = connection?.connected ?? false;
  const hasRepo = connection?.repo_name && connection.repo_name !== 'PENDING';

  const handleRepoSelect = () => {
    if (!selectedRepo || !onSelectRepo) return;
    const [owner, name] = selectedRepo.split('/');
    onSelectRepo(owner, name);
    setShowRepoSelect(false);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">Connect GitHub</h3>
            <p className="text-xs text-gray-500">Link a repository for evidence tracking</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Connect a GitHub repository to track evidence and optionally sync your workspace.
        </p>

        {/* DUAL-MODE-01: Mode selection */}
        <div className="space-y-2 mb-4">
          <label className="text-xs text-gray-400 font-medium">Access Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMode('READ_ONLY')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedMode === 'READ_ONLY'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="text-xs font-medium text-white mb-0.5">Evidence Only</div>
              <div className="text-[10px] text-gray-500">Read-only. Track commits, PRs, releases.</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('WORKSPACE_SYNC')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedMode === 'WORKSPACE_SYNC'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="text-xs font-medium text-white mb-0.5">Full Workspace</div>
              <div className="text-[10px] text-gray-500">Read + write. Commit scaffold & code.</div>
            </button>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          selectedMode === 'WORKSPACE_SYNC'
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-violet-500/10 border border-violet-500/30'
        }`}>
          <svg className={`w-4 h-4 flex-shrink-0 ${selectedMode === 'WORKSPACE_SYNC' ? 'text-green-400' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`text-xs ${selectedMode === 'WORKSPACE_SYNC' ? 'text-green-300' : 'text-violet-300'}`}>
            {selectedMode === 'WORKSPACE_SYNC' ? (
              <><strong>Full access.</strong> D4-CHAT will commit scaffold files and code to a feature branch (<code className="text-green-400">aixord/*</code>). Never writes to main.</>
            ) : (
              <><strong>Read-only access.</strong> We only read repository metadata. No code access, no write permissions.</>
            )}
          </p>
        </div>

        <button
          onClick={() => onConnect(selectedMode)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Connect GitHub
            </>
          )}
        </button>
      </div>
    );
  }

  // Connected but no repo selected
  if (isConnected && !hasRepo) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">GitHub Connected</h3>
            <p className="text-xs text-green-400">Select a repository</p>
          </div>
        </div>

        {showRepoSelect ? (
          <div className="space-y-3">
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">Select a repository...</option>
              {repos.map((repo) => (
                <option key={repo.full_name} value={repo.full_name}>
                  {repo.full_name} {repo.private && '🔒'}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRepoSelect(false)}
                className="flex-1 px-3 py-2 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRepoSelect}
                disabled={!selectedRepo || isLoading}
                className="flex-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Saving...' : 'Select'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Please select which repository to track for this project.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRepoSelect(true)}
                disabled={isLoading || repos.length === 0}
                className="flex-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {repos.length === 0 ? 'Loading repos...' : 'Select Repository'}
              </button>
              <button
                onClick={onDisconnect}
                disabled={isLoading}
                className="px-3 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fully connected
  const connMode = connection?.github_mode || 'READ_ONLY';
  const isWorkspaceSync = connMode === 'WORKSPACE_SYNC';

  return (
    <div className={`bg-gray-800/50 rounded-xl border p-4 ${
      isWorkspaceSync ? 'border-green-500/30' : 'border-green-500/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isWorkspaceSync ? 'bg-green-500/20' : 'bg-green-500/20'
          }`}>
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">
              {connection?.repo_owner}/{connection?.repo_name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-green-400">Connected</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                isWorkspaceSync
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              }`}>
                {isWorkspaceSync ? 'Full Access' : 'Read Only'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          disabled={isLoading}
          className="px-3 py-1 text-xs border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Upgrade to WORKSPACE_SYNC if currently READ_ONLY — triggers modal */}
      {!isWorkspaceSync && onUpgradeMode && (
        <button
          onClick={() => setShowUpgradeModal(true)}
          disabled={isLoading}
          className="w-full mb-2 px-3 py-1.5 text-xs bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 rounded-lg transition-colors"
        >
          Upgrade to Full Access (Read + Write)
        </button>
      )}

      {connection?.last_sync && (
        <p className="text-xs text-gray-500">
          Last synced: {new Date(connection.last_sync).toLocaleString()}
        </p>
      )}

      {/* UPGRADE-UX-01: Permission comparison modal */}
      <GitHubUpgradeModal
        isOpen={showUpgradeModal}
        onConfirm={() => {
          setShowUpgradeModal(false);
          onUpgradeMode?.();
        }}
        onCancel={() => setShowUpgradeModal(false)}
      />

      {/* UPGRADE-UX-01: Success toast after OAuth upgrade */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-green-600 text-white rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Workspace Features Enabled!</h4>
              <p className="text-sm text-green-100">
                D4-CHAT can now commit files, create repositories, and push code to GitHub.
                All writes go to <code className="bg-green-700 px-1 rounded">aixord/*</code> branches.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-green-200 hover:text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitHubConnect;
