/**
 * Decision Log Component
 *
 * Enhanced decision logging UI with:
 * - Filterable decision list
 * - Decision type badges with status colors
 * - Owner/actor tracking
 * - Expandable rationale/notes
 * - Question Log sub-section
 *
 * Reference: Decision Log.png mockup
 */

import { useState, useMemo } from 'react';
import type { Decision } from '../lib/api';

// ============================================================================
// Types
// ============================================================================

interface Question {
  id: string;
  question: string;
  owner: string;
  discussions: string[];
  action?: string;
  createdAt: string;
}

interface DecisionLogProps {
  decisions: Decision[];
  questions?: Question[];
  isLoading: boolean;
  onAddDecision?: (decision: DecisionCreateData) => Promise<void>;
  onAddQuestion?: (question: Omit<Question, 'id' | 'createdAt'>) => Promise<void>;
}

interface DecisionCreateData {
  type: Decision['type'];
  summary: string;
  phase?: Decision['phase'];
  rationale?: string;
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
      year: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

// Status Badge Component
function StatusBadge({ type }: { type: Decision['type'] }) {
  const styles: Record<Decision['type'], { bg: string; text: string; label: string }> = {
    APPROVAL: { bg: 'bg-green-500', text: 'text-white', label: 'Approved' },
    REJECTION: { bg: 'bg-red-500', text: 'text-white', label: 'Rejected' },
    DEFERRAL: { bg: 'bg-amber-500', text: 'text-white', label: 'Pending' },
    SCOPE_CHANGE: { bg: 'bg-blue-500', text: 'text-white', label: 'Scope Change' }
  };

  const style = styles[type] || styles.DEFERRAL;

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// Decision Row Component
function DecisionRow({ decision, isExpanded, onToggle }: {
  decision: Decision;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const phaseLabels: Record<string, string> = {
    B: 'Brainstorm',
    P: 'Plan',
    E: 'Execute',
    R: 'Review'
  };

  const topicColors: Record<string, string> = {
    B: 'bg-violet-100 text-violet-700',
    P: 'bg-blue-100 text-blue-700',
    E: 'bg-green-100 text-green-700',
    R: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <div
        className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        {/* Topic/Phase */}
        <div className="col-span-2">
          <span className={`px-2 py-1 text-xs rounded ${decision.phase ? topicColors[decision.phase] : 'bg-gray-700 text-gray-300'}`}>
            {decision.phase ? phaseLabels[decision.phase] : 'General'}
          </span>
        </div>

        {/* Description */}
        <div className="col-span-5 text-sm text-white truncate">
          {decision.summary}
        </div>

        {/* Owner/Actor */}
        <div className="col-span-2 text-sm text-gray-400">
          {decision.actor || 'System'}
        </div>

        {/* Status */}
        <div className="col-span-2">
          <StatusBadge type={decision.type} />
        </div>

        {/* Expand Icon */}
        <div className="col-span-1 flex justify-end">
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

      {/* Expanded Details */}
      {isExpanded && decision.rationale && (
        <div className="px-4 pb-4 bg-gray-800/20">
          <div className="pl-4 border-l-2 border-violet-500/30">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-300">{decision.rationale}</p>
            <p className="text-xs text-gray-500 mt-2">{formatDate(decision.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Question Row Component
function QuestionRow({ question }: { question: Question }) {
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800/30 border-b border-gray-700/50 last:border-b-0">
      {/* Question */}
      <div className="col-span-4 text-sm text-white">
        {question.question}
      </div>

      {/* Owner */}
      <div className="col-span-2 text-sm text-gray-400">
        {question.owner}
      </div>

      {/* Discussions */}
      <div className="col-span-4 text-xs text-gray-500">
        <ul className="list-disc list-inside space-y-1">
          {question.discussions.slice(0, 2).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {/* Action */}
      <div className="col-span-2">
        {question.action ? (
          <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">
            {question.action}
          </span>
        ) : (
          <span className="text-xs text-gray-500">Pending</span>
        )}
      </div>
    </div>
  );
}

// Add Decision Form
function AddDecisionForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (data: DecisionCreateData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<DecisionCreateData>({
    type: 'APPROVAL',
    summary: '',
    phase: 'B',
    rationale: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.summary.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phase</label>
          <select
            value={formData.phase || 'B'}
            onChange={(e) => setFormData({ ...formData, phase: e.target.value as Decision['phase'] })}
            className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            <option value="B">Brainstorm</option>
            <option value="P">Plan</option>
            <option value="E">Execute</option>
            <option value="R">Review</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Decision Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Decision['type'] })}
            className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            <option value="APPROVAL">Approval</option>
            <option value="REJECTION">Rejection</option>
            <option value="DEFERRAL">Pending</option>
            <option value="SCOPE_CHANGE">Scope Change</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Summary</label>
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief description of the decision..."
          className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
        <textarea
          value={formData.rationale || ''}
          onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
          placeholder="Additional context or rationale..."
          rows={2}
          className="w-full bg-gray-900 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500 resize-none"
        />
      </div>

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
          disabled={!formData.summary.trim()}
          className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Add Decision
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DecisionLog({
  decisions,
  questions = [],
  isLoading,
  onAddDecision
}: DecisionLogProps) {
  const [activeTab, setActiveTab] = useState<'decisions' | 'questions'>('decisions');
  const [filterType, setFilterType] = useState<Decision['type'] | 'ALL'>('ALL');
  const [filterPhase, setFilterPhase] = useState<Decision['phase'] | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      if (filterType !== 'ALL' && d.type !== filterType) return false;
      if (filterPhase !== 'ALL' && d.phase !== filterPhase) return false;
      return true;
    });
  }, [decisions, filterType, filterPhase]);

  // Statistics
  const stats = useMemo(() => {
    const approved = decisions.filter(d => d.type === 'APPROVAL').length;
    const rejected = decisions.filter(d => d.type === 'REJECTION').length;
    const pending = decisions.filter(d => d.type === 'DEFERRAL').length;
    const scopeChanges = decisions.filter(d => d.type === 'SCOPE_CHANGE').length;
    return { approved, rejected, pending, scopeChanges, total: decisions.length };
  }, [decisions]);

  const handleAddDecision = async (data: DecisionCreateData) => {
    if (!onAddDecision) return;
    try {
      await onAddDecision(data);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add decision:', err);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Decision Log</h3>
          {onAddDecision && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">{stats.approved} Approved</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-gray-400">{stats.rejected} Rejected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-gray-400">{stats.pending} Pending</span>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-700/50">
          <AddDecisionForm
            onSubmit={handleAddDecision}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'decisions'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Decisions ({filteredDecisions.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'questions'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'decisions' && (
        <div className="px-4 py-2 border-b border-gray-700/30 flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as Decision['type'] | 'ALL')}
            className="bg-gray-900/50 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="ALL">All Types</option>
            <option value="APPROVAL">Approved</option>
            <option value="REJECTION">Rejected</option>
            <option value="DEFERRAL">Pending</option>
            <option value="SCOPE_CHANGE">Scope Change</option>
          </select>
          <select
            value={filterPhase || 'ALL'}
            onChange={(e) => setFilterPhase(e.target.value === 'ALL' ? 'ALL' : e.target.value as Decision['phase'])}
            className="bg-gray-900/50 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="ALL">All Phases</option>
            <option value="B">Brainstorm</option>
            <option value="P">Plan</option>
            <option value="E">Execute</option>
            <option value="R">Review</option>
          </select>
        </div>
      )}

      {/* Table Header */}
      {activeTab === 'decisions' && filteredDecisions.length > 0 && (
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-700/30 bg-gray-900/30">
          <div className="col-span-2">Topic</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Owner</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>
      )}

      {activeTab === 'questions' && questions.length > 0 && (
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-700/30 bg-gray-900/30">
          <div className="col-span-4">Question</div>
          <div className="col-span-2">Owner</div>
          <div className="col-span-4">Discussions</div>
          <div className="col-span-2">Action</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : activeTab === 'decisions' ? (
          filteredDecisions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">No decisions recorded yet</p>
              <p className="text-gray-600 text-xs mt-1">Click "Add" to record your first decision</p>
            </div>
          ) : (
            filteredDecisions.map((decision) => (
              <DecisionRow
                key={decision.id}
                decision={decision}
                isExpanded={expandedId === decision.id}
                onToggle={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
              />
            ))
          )
        ) : questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">❓</div>
            <p className="text-gray-500 text-sm">No open questions</p>
            <p className="text-gray-600 text-xs mt-1">Questions raised during discussions will appear here</p>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  );
}

export default DecisionLog;
