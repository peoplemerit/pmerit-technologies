/**
 * Evidence Panel Component (PATCH-GITHUB-01)
 *
 * Displays GitHub evidence grouped by Reconciliation Triad category.
 * Evidence is read-only and INFORMS the triad, never overrides.
 *
 * Visibility controlled by Assistance Mode:
 * - GUIDED: Panel collapsed, minimal info
 * - ASSISTED: Panel shows when relevant
 * - EXPERT: Panel always expanded with full details
 */

import { useState } from 'react';
import type { AssistanceMode } from '../contexts/UserSettingsContext';

// Evidence types matching backend
interface EvidenceRecord {
  id: string;
  evidence_type: 'COMMIT' | 'PR' | 'RELEASE' | 'CI_STATUS' | 'ISSUE' | 'MILESTONE';
  triad_category: 'PLANNED' | 'CLAIMED' | 'VERIFIED';
  ref_id: string;
  ref_url: string;
  title: string;
  author: string;
  evidence_timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'STALE' | 'UNAVAILABLE';
}

interface EvidenceTriad {
  planned: EvidenceRecord[];
  claimed: EvidenceRecord[];
  verified: EvidenceRecord[];
}

interface EvidencePanelProps {
  evidence: EvidenceTriad | null;
  assistanceMode: AssistanceMode;
  onSync?: () => void;
  isSyncing?: boolean;
  lastSync?: string | null;
  isConnected: boolean;
}

const TYPE_ICONS: Record<EvidenceRecord['evidence_type'], string> = {
  COMMIT: '📝',
  PR: '🔀',
  RELEASE: '🏷️',
  CI_STATUS: '✅',
  ISSUE: '📋',
  MILESTONE: '🎯',
};

const TRIAD_CONFIG = {
  planned: {
    label: 'PLANNED',
    color: 'violet',
    description: 'Issues & Milestones',
  },
  claimed: {
    label: 'CLAIMED',
    color: 'amber',
    description: 'Commits & PRs',
  },
  verified: {
    label: 'VERIFIED',
    color: 'green',
    description: 'Releases & CI',
  },
};

export function EvidencePanel({
  evidence,
  assistanceMode,
  onSync,
  isSyncing = false,
  lastSync,
  isConnected,
}: EvidencePanelProps) {
  // In GUIDED mode, start collapsed. In EXPERT mode, start expanded.
  const [expanded, setExpanded] = useState(assistanceMode === 'EXPERT');
  const [selectedCategory, setSelectedCategory] = useState<keyof EvidenceTriad | null>(null);

  // D-017 FIX: Show helpful empty state when not connected
  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-sm">
              📊
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">GitHub Evidence</h3>
              <p className="text-xs text-gray-500">Not connected</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <div className="text-center py-6">
            <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-gray-400 text-sm mb-2">No GitHub repository linked</p>
            <p className="text-gray-500 text-xs">
              Connect a GitHub repo in project settings to track evidence
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const counts = {
    planned: evidence?.planned?.length ?? 0,
    claimed: evidence?.claimed?.length ?? 0,
    verified: evidence?.verified?.length ?? 0,
    total: (evidence?.planned?.length ?? 0) + (evidence?.claimed?.length ?? 0) + (evidence?.verified?.length ?? 0),
  };

  // In GUIDED mode, show minimal UI
  if (assistanceMode === 'GUIDED' && !expanded) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
              📊
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">GitHub Evidence</h3>
              <p className="text-xs text-gray-500">
                {counts.total} items tracked
              </p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
            📊
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">GitHub Evidence</h3>
            <p className="text-xs text-gray-500">
              {counts.planned} planned • {counts.claimed} claimed • {counts.verified} verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSync && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSync();
              }}
              disabled={isSyncing}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 rounded transition-colors"
            >
              {isSyncing ? '⟳ Syncing...' : '⟳ Sync'}
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          {/* Category Tabs */}
          <div className="flex gap-2 pt-4 mb-4">
            {(Object.keys(TRIAD_CONFIG) as Array<keyof EvidenceTriad>).map((category) => {
              const config = TRIAD_CONFIG[category];
              const count = counts[category];
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(isActive ? null : category)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? `border-${config.color}-500 bg-${config.color}-500/20`
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`text-xs font-bold ${isActive ? `text-${config.color}-400` : 'text-gray-400'}`}>
                    {config.label}
                  </div>
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-500">{config.description}</div>
                </button>
              );
            })}
          </div>

          {/* Evidence List */}
          {selectedCategory && evidence && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {evidence[selectedCategory].length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No {selectedCategory} evidence found
                </p>
              ) : (
                evidence[selectedCategory].map((item) => (
                  <a
                    key={item.id}
                    href={item.ref_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{TYPE_ICONS[item.evidence_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{item.evidence_type}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{item.author}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.evidence_timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {/* Summary when no category selected */}
          {!selectedCategory && (
            <div className="text-sm text-gray-400 text-center py-4">
              Click a category above to view evidence details
            </div>
          )}

          {/* Info footer */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Evidence is informational only.</strong> This data augments your Reconciliation Triad but does not override your decisions or governance rules.
            </p>
          </div>

          {/* Last sync info */}
          {lastSync && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Last synced: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EvidencePanel;
