/**
 * EvidenceRibbon Component (Detail Panel — Compact)
 *
 * Contains GitHub connection status with repo selection,
 * recent evidence images with management, and evidence sync.
 * Compacted for 140px max height.
 */

import { useState } from 'react';

interface EvidenceRibbonProps {
  // GitHub
  isConnected: boolean;
  repoOwner?: string | null;
  repoName?: string | null;
  lastSync?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSelectRepo?: (repoOwner: string, repoName: string) => void;
  onSync?: () => void;
  repos?: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
  needsRepoSelection?: boolean;

  // Evidence
  recentEvidence?: Array<{
    id: string;
    url: string;
    filename: string;
    evidenceType: string;
  }>;
  onViewAllEvidence?: () => void;
  onImageClick?: (imageId: string) => void;
  onDeleteImage?: (imageId: string) => void;

  isLoading?: boolean;
}

export function EvidenceRibbon({
  isConnected,
  repoOwner,
  repoName,
  lastSync,
  onConnect,
  onDisconnect,
  onSelectRepo,
  onSync,
  repos = [],
  needsRepoSelection = false,
  recentEvidence = [],
  onViewAllEvidence,
  onImageClick,
  onDeleteImage,
  isLoading = false,
}: EvidenceRibbonProps) {
  const [showRepoSelect, setShowRepoSelect] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');

  const handleRepoSelect = () => {
    if (!selectedRepo || !onSelectRepo) return;
    const [owner, name] = selectedRepo.split('/');
    onSelectRepo(owner, name);
    setShowRepoSelect(false);
    setSelectedRepo('');
  };

  return (
    <div className="space-y-2">
      {/* Row 1: GitHub status + actions */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs w-16 shrink-0">GitHub:</span>
        {isConnected && !needsRepoSelection ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-green-400 text-xs">●</span>
            <span className="text-white text-xs font-medium">{repoOwner}/{repoName}</span>
            {lastSync && (
              <span className="text-gray-500 text-[10px]">
                synced {new Date(lastSync).toLocaleDateString()}
              </span>
            )}
            <div className="flex gap-1 ml-auto">
              {onSync && (
                <button onClick={onSync} disabled={isLoading} className="px-1.5 py-0.5 text-[10px] border border-violet-500/30 text-violet-400 rounded hover:bg-violet-500/10">
                  Sync
                </button>
              )}
              {onDisconnect && (
                <button onClick={onDisconnect} disabled={isLoading} className="px-1.5 py-0.5 text-[10px] border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">
                  Disconnect
                </button>
              )}
            </div>
          </div>
        ) : isConnected && needsRepoSelection ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-amber-400 text-xs">Select repo</span>
            {showRepoSelect ? (
              <>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="px-1.5 py-0.5 bg-gray-900/50 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-violet-500 max-w-[200px]"
                >
                  <option value="">Select...</option>
                  {repos.map((r) => (
                    <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                  ))}
                </select>
                <button onClick={handleRepoSelect} disabled={!selectedRepo} className="px-1.5 py-0.5 text-[10px] bg-violet-600 text-white rounded disabled:opacity-50">OK</button>
                <button onClick={() => setShowRepoSelect(false)} className="px-1.5 py-0.5 text-[10px] text-gray-400 rounded hover:text-white">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowRepoSelect(true)} disabled={repos.length === 0} className="px-2 py-0.5 text-[10px] bg-violet-600 text-white rounded disabled:opacity-50">
                  {repos.length === 0 ? 'Loading...' : 'Select'}
                </button>
                {onDisconnect && (
                  <button onClick={onDisconnect} className="px-1.5 py-0.5 text-[10px] border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Disconnect</button>
                )}
              </>
            )}
          </div>
        ) : (
          <button onClick={onConnect} disabled={isLoading || !onConnect} className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors">
            Connect GitHub
          </button>
        )}
      </div>

      {/* Row 2: Evidence thumbnails */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs w-16 shrink-0">Evidence:</span>
        {recentEvidence.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
            {recentEvidence.slice(0, 8).map((evidence) => (
              <div key={evidence.id} className="relative group shrink-0">
                <button
                  onClick={() => onImageClick?.(evidence.id)}
                  className="w-12 h-12 rounded bg-gray-700/50 border border-gray-600/50 hover:border-violet-500/50 transition-colors overflow-hidden"
                  title={evidence.filename}
                >
                  <img src={evidence.url} alt={evidence.filename} className="w-full h-full object-cover" />
                </button>
                {onDeleteImage && (
                  <button
                    onClick={() => onDeleteImage(evidence.id)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            {onViewAllEvidence && (
              <button onClick={onViewAllEvidence} className="text-[10px] text-violet-400 hover:text-violet-300 shrink-0">
                All →
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-xs">No evidence uploaded</span>
        )}
      </div>
    </div>
  );
}

export default EvidenceRibbon;
