/**
 * Knowledge Artifacts Component (GKDL-01)
 *
 * Implements L-GKDL1-7 from AIXORD v4.3:
 * - L-GKDL1: Derived knowledge is governed
 * - L-GKDL2: Sessions=evidence, artifacts=authoritative
 * - L-GKDL5: AI-derived = DRAFT until approved
 * - L-GKDL6: Authority hierarchy (CSR > DoD > SOM > SDG > FAQ)
 *
 * Features:
 * - List artifacts by type and status
 * - Create new artifacts (manual or AI-derived)
 * - Approve artifacts (Director approval)
 * - Generate CSR for 10+ sessions
 * - View artifact content with markdown rendering
 */

import { useState, useMemo } from 'react';
import type {
  KnowledgeArtifact,
  KnowledgeArtifactType,
  ArtifactStatus,
  DerivationSource,
} from '../lib/api';
import {
  ARTIFACT_TYPE_LABELS,
  ARTIFACT_STATUS_LABELS,
  ARTIFACT_AUTHORITY_LEVELS,
} from '../lib/api';

// ============================================================================
// Types
// ============================================================================

interface KnowledgeArtifactsProps {
  artifacts: KnowledgeArtifact[];
  isLoading: boolean;
  onCreateArtifact?: (data: CreateArtifactData) => Promise<void>;
  onApproveArtifact?: (artifactId: string) => Promise<void>;
  onDeleteArtifact?: (artifactId: string) => Promise<void>;
  onGenerateCSR?: () => Promise<void>;
  sessionCount?: number; // For CSR generation eligibility
}

interface CreateArtifactData {
  type: KnowledgeArtifactType;
  title: string;
  content: string;
  summary?: string;
  derivationSource?: DerivationSource;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

function getStatusColor(status: ArtifactStatus): { bg: string; text: string } {
  const colors: Record<ArtifactStatus, { bg: string; text: string }> = {
    DRAFT: { bg: 'bg-gray-500', text: 'text-white' },
    REVIEW: { bg: 'bg-amber-500', text: 'text-white' },
    APPROVED: { bg: 'bg-green-500', text: 'text-white' },
    SUPERSEDED: { bg: 'bg-red-500/50', text: 'text-red-200' },
  };
  return colors[status] || colors.DRAFT;
}

function getTypeColor(type: KnowledgeArtifactType): string {
  const colors: Record<KnowledgeArtifactType, string> = {
    CONSOLIDATED_SESSION_REFERENCE: 'bg-violet-100 text-violet-700',
    DEFINITION_OF_DONE: 'bg-blue-100 text-blue-700',
    SYSTEM_OPERATION_MANUAL: 'bg-cyan-100 text-cyan-700',
    SYSTEM_DIAGNOSTICS_GUIDE: 'bg-amber-100 text-amber-700',
    FAQ_REFERENCE: 'bg-green-100 text-green-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

function getDerivationIcon(source: DerivationSource): string {
  const icons: Record<DerivationSource, string> = {
    MANUAL: '✍️',
    AI_DERIVED: '🤖',
    EXTRACTED: '📤',
    IMPORTED: '📥',
  };
  return icons[source] || '📄';
}

// ============================================================================
// Sub-Components
// ============================================================================

// Status Badge
function StatusBadge({ status }: { status: ArtifactStatus }) {
  const { bg, text } = getStatusColor(status);
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${bg} ${text}`}>
      {ARTIFACT_STATUS_LABELS[status]}
    </span>
  );
}

// Type Badge
function TypeBadge({ type }: { type: KnowledgeArtifactType }) {
  const shortLabels: Record<KnowledgeArtifactType, string> = {
    CONSOLIDATED_SESSION_REFERENCE: 'CSR',
    DEFINITION_OF_DONE: 'DoD',
    SYSTEM_OPERATION_MANUAL: 'SOM',
    SYSTEM_DIAGNOSTICS_GUIDE: 'SDG',
    FAQ_REFERENCE: 'FAQ',
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded ${getTypeColor(type)}`}
      title={ARTIFACT_TYPE_LABELS[type]}
    >
      {shortLabels[type]}
    </span>
  );
}

// Authority Level Indicator
function AuthorityLevel({ level }: { level: number }) {
  const maxLevel = 100;
  const percentage = (level / maxLevel) * 100;

  return (
    <div className="flex items-center gap-2" title={`Authority Level: ${level}`}>
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{level}</span>
    </div>
  );
}

// Artifact Row
function ArtifactRow({
  artifact,
  isExpanded,
  onToggle,
  onApprove,
  onDelete,
}: {
  artifact: KnowledgeArtifact;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
}) {
  const canApprove = artifact.status === 'DRAFT' || artifact.status === 'REVIEW';
  const canDelete = artifact.status !== 'SUPERSEDED';

  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <div
        className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        {/* Type */}
        <div className="col-span-1">
          <TypeBadge type={artifact.type} />
        </div>

        {/* Title */}
        <div className="col-span-4 text-sm text-white truncate flex items-center gap-2">
          <span title={`Source: ${artifact.derivationSource}`}>
            {getDerivationIcon(artifact.derivationSource)}
          </span>
          {artifact.title}
        </div>

        {/* Version */}
        <div className="col-span-1 text-sm text-gray-400">v{artifact.version}</div>

        {/* Authority */}
        <div className="col-span-2">
          <AuthorityLevel level={artifact.authorityLevel} />
        </div>

        {/* Status */}
        <div className="col-span-2">
          <StatusBadge status={artifact.status} />
        </div>

        {/* Actions & Expand */}
        <div className="col-span-2 flex justify-end items-center gap-2">
          {canApprove && onApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
              title="Approve artifact (L-GKDL5)"
            >
              Approve
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Supersede this artifact?')) {
                  onDelete();
                }
              }}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Supersede artifact"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-800/20">
          <div className="pl-4 border-l-2 border-violet-500/30 space-y-3">
            {/* Summary */}
            {artifact.summary && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Summary</p>
                <p className="text-sm text-gray-300">{artifact.summary}</p>
              </div>
            )}

            {/* Content Preview */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Content Preview</p>
              <div className="text-sm text-gray-300 bg-gray-900/50 rounded p-3 max-h-48 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
                {artifact.content.slice(0, 1000)}
                {artifact.content.length > 1000 && '...'}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Created: {formatDate(artifact.createdAt)}</span>
              <span>Updated: {formatDate(artifact.updatedAt)}</span>
              {artifact.approvedBy && (
                <span className="text-green-400">
                  Approved: {formatDate(artifact.approvedAt || '')}
                </span>
              )}
              <span>Type: {ARTIFACT_TYPE_LABELS[artifact.type]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Artifact Form
function CreateArtifactForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateArtifactData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateArtifactData>({
    type: 'FAQ_REFERENCE',
    title: '',
    content: '',
    summary: '',
    derivationSource: 'MANUAL',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Artifact Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as KnowledgeArtifactType })}
            className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            <option value="FAQ_REFERENCE">FAQ Reference</option>
            <option value="SYSTEM_OPERATION_MANUAL">System Operation Manual</option>
            <option value="SYSTEM_DIAGNOSTICS_GUIDE">System Diagnostics Guide</option>
            <option value="DEFINITION_OF_DONE">Definition of Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Source</label>
          <select
            value={formData.derivationSource || 'MANUAL'}
            onChange={(e) => setFormData({ ...formData, derivationSource: e.target.value as DerivationSource })}
            className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            <option value="MANUAL">Manual Entry</option>
            <option value="AI_DERIVED">AI Derived</option>
            <option value="EXTRACTED">Extracted</option>
            <option value="IMPORTED">Imported</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Artifact title..."
          className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Summary (optional)</label>
        <input
          type="text"
          value={formData.summary || ''}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief description..."
          className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Content (Markdown supported)</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="# Artifact Content&#10;&#10;Enter your content here using Markdown..."
          rows={8}
          className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500 resize-none font-mono"
        />
      </div>

      {formData.derivationSource === 'AI_DERIVED' && (
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300">
          <strong>Note:</strong> AI-derived artifacts will be created as DRAFT and require Director approval per L-GKDL5.
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.title.trim() || !formData.content.trim()}
          className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Create Artifact
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function KnowledgeArtifacts({
  artifacts,
  isLoading,
  onCreateArtifact,
  onApproveArtifact,
  onDeleteArtifact,
  onGenerateCSR,
  sessionCount = 0,
}: KnowledgeArtifactsProps) {
  const [filterType, setFilterType] = useState<KnowledgeArtifactType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ArtifactStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    return artifacts
      .filter((a) => {
        if (filterType !== 'ALL' && a.type !== filterType) return false;
        if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by authority level (highest first), then by updated date
        if (b.authorityLevel !== a.authorityLevel) {
          return b.authorityLevel - a.authorityLevel;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [artifacts, filterType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const byStatus = {
      draft: artifacts.filter((a) => a.status === 'DRAFT').length,
      review: artifacts.filter((a) => a.status === 'REVIEW').length,
      approved: artifacts.filter((a) => a.status === 'APPROVED').length,
      superseded: artifacts.filter((a) => a.status === 'SUPERSEDED').length,
    };
    const byType = Object.keys(ARTIFACT_AUTHORITY_LEVELS).reduce(
      (acc, type) => {
        acc[type as KnowledgeArtifactType] = artifacts.filter((a) => a.type === type).length;
        return acc;
      },
      {} as Record<KnowledgeArtifactType, number>
    );
    return { byStatus, byType, total: artifacts.length };
  }, [artifacts]);

  const handleCreateArtifact = async (data: CreateArtifactData) => {
    if (!onCreateArtifact) return;
    try {
      await onCreateArtifact(data);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create artifact:', err);
    }
  };

  const canGenerateCSR = sessionCount >= 10;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Knowledge Artifacts</h3>
            <span className="text-xs text-gray-500">(GKDL-01)</span>
          </div>
          <div className="flex gap-2">
            {onGenerateCSR && (
              <button
                onClick={onGenerateCSR}
                disabled={!canGenerateCSR}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                  canGenerateCSR
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  canGenerateCSR
                    ? 'Generate Consolidated Session Reference'
                    : `Need ${10 - sessionCount} more sessions for CSR (L-GCP6)`
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                CSR
              </button>
            )}
            {onCreateArtifact && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full" />
            <span className="text-gray-400">{stats.byStatus.draft} Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-gray-400">{stats.byStatus.review} Review</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">{stats.byStatus.approved} Approved</span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">Sessions: {sessionCount}/10 for CSR</span>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-700/50">
          <CreateArtifactForm onSubmit={handleCreateArtifact} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-2 border-b border-gray-700/30 flex gap-2 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as KnowledgeArtifactType | 'ALL')}
          className="bg-gray-900/50 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
        >
          <option value="ALL">All Types</option>
          <option value="CONSOLIDATED_SESSION_REFERENCE">CSR</option>
          <option value="DEFINITION_OF_DONE">DoD</option>
          <option value="SYSTEM_OPERATION_MANUAL">SOM</option>
          <option value="SYSTEM_DIAGNOSTICS_GUIDE">SDG</option>
          <option value="FAQ_REFERENCE">FAQ</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ArtifactStatus | 'ALL')}
          className="bg-gray-900/50 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="SUPERSEDED">Superseded</option>
        </select>
      </div>

      {/* Table Header */}
      {filteredArtifacts.length > 0 && (
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-700/30 bg-gray-900/30">
          <div className="col-span-1">Type</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-1">Ver</div>
          <div className="col-span-2">Authority</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-gray-500 text-sm">No knowledge artifacts yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Create FAQs, SOMs, SDGs, or DoDs to document project knowledge
            </p>
            {sessionCount >= 10 && (
              <p className="text-cyan-400 text-xs mt-2">
                You have {sessionCount} sessions - you can generate a CSR!
              </p>
            )}
          </div>
        ) : (
          filteredArtifacts.map((artifact) => (
            <ArtifactRow
              key={artifact.id}
              artifact={artifact}
              isExpanded={expandedId === artifact.id}
              onToggle={() => setExpandedId(expandedId === artifact.id ? null : artifact.id)}
              onApprove={onApproveArtifact ? () => onApproveArtifact(artifact.id) : undefined}
              onDelete={onDeleteArtifact ? () => onDeleteArtifact(artifact.id) : undefined}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-700/30 text-xs text-gray-600">
        <span>Authority: CSR(100) &gt; DoD(80) &gt; SOM(60) &gt; SDG(40) &gt; FAQ(20)</span>
        <span className="mx-2">|</span>
        <span>Per L-GKDL6: Higher authority supersedes lower</span>
      </div>
    </div>
  );
}

export default KnowledgeArtifacts;
