/**
 * Reconciliation Triad Component (GCP-01)
 *
 * AIXORD v4.3 Governance Completion Patch
 * Tracks PLANNED vs CLAIMED vs VERIFIED for audit reconciliation.
 */

import { useState } from 'react';
import type { ReconciliationTriad as ReconciliationTriadType } from '../lib/api';

interface ReconciliationTriadProps {
  reconciliation: ReconciliationTriadType | undefined;
  onUpdate: (reconciliation: ReconciliationTriadType) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  phase?: string;
}

type TriadColumn = 'planned' | 'claimed' | 'verified';

const COLUMN_CONFIG: Record<TriadColumn, { label: string; color: string; description: string }> = {
  planned: {
    label: 'PLANNED',
    color: 'violet',
    description: 'Authorized objectives and deliverables',
  },
  claimed: {
    label: 'CLAIMED',
    color: 'amber',
    description: 'What is asserted as complete',
  },
  verified: {
    label: 'VERIFIED',
    color: 'green',
    description: 'What can be proven with evidence',
  },
};

export function ReconciliationTriad({
  reconciliation,
  onUpdate,
  isLoading = false,
  readOnly = false,
  phase,
}: ReconciliationTriadProps) {
  // isLoading reserved for future async operations
  void isLoading;
  const [expanded, setExpanded] = useState(false);
  const [newItem, setNewItem] = useState<Record<TriadColumn, string>>({
    planned: '',
    claimed: '',
    verified: '',
  });

  // Default reconciliation if not provided
  const currentReconciliation: ReconciliationTriadType = reconciliation || {
    planned: [],
    claimed: [],
    verified: [],
    divergences: [],
  };

  const handleAddItem = (column: TriadColumn) => {
    if (readOnly || !newItem[column].trim()) return;

    const updated = {
      ...currentReconciliation,
      [column]: [...currentReconciliation[column], newItem[column].trim()],
    };

    // Auto-detect divergences
    updated.divergences = detectDivergences(updated);

    onUpdate(updated);
    setNewItem((prev) => ({ ...prev, [column]: '' }));
  };

  const handleRemoveItem = (column: TriadColumn, index: number) => {
    if (readOnly) return;

    const updated = {
      ...currentReconciliation,
      [column]: currentReconciliation[column].filter((_, i) => i !== index),
    };

    // Auto-detect divergences
    updated.divergences = detectDivergences(updated);

    onUpdate(updated);
  };

  const handleClearDivergences = () => {
    if (readOnly) return;
    onUpdate({
      ...currentReconciliation,
      divergences: [],
    });
  };

  // Detect divergences between columns
  function detectDivergences(rec: ReconciliationTriadType): string[] {
    const divergences: string[] = [];

    // CLAIMED but not VERIFIED
    rec.claimed.forEach((item) => {
      if (!rec.verified.some((v) => v.toLowerCase().includes(item.toLowerCase()))) {
        divergences.push(`CLAIMED "${item}" is not VERIFIED`);
      }
    });

    // PLANNED but not CLAIMED
    rec.planned.forEach((item) => {
      if (!rec.claimed.some((c) => c.toLowerCase().includes(item.toLowerCase()))) {
        divergences.push(`PLANNED "${item}" is not CLAIMED`);
      }
    });

    // VERIFIED but not PLANNED (scope creep)
    rec.verified.forEach((item) => {
      if (!rec.planned.some((p) => p.toLowerCase().includes(item.toLowerCase()))) {
        divergences.push(`VERIFIED "${item}" was not PLANNED (scope creep?)`);
      }
    });

    return divergences;
  }

  // Calculate reconciliation status
  const totalPlanned = currentReconciliation.planned.length;
  const totalVerified = currentReconciliation.verified.length;
  const divergenceCount = currentReconciliation.divergences.length;

  const isReconciled = totalPlanned > 0 && divergenceCount === 0 && totalVerified >= totalPlanned;
  const showInReviewPhase = phase === 'REVIEW' || phase === 'R';

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            isReconciled ? 'bg-green-500/20 text-green-400' :
            divergenceCount > 0 ? 'bg-red-500/20 text-red-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            RT
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">Reconciliation Triad</h3>
            <p className="text-xs text-gray-500">
              {totalPlanned} planned, {totalVerified} verified
              {divergenceCount > 0 && `, ${divergenceCount} divergence(s)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isReconciled && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
              RECONCILED
            </span>
          )}
          {divergenceCount > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
              {divergenceCount} DIVERGENCE{divergenceCount > 1 ? 'S' : ''}
            </span>
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
          {/* Three Columns */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {(Object.keys(COLUMN_CONFIG) as TriadColumn[]).map((column) => {
              const config = COLUMN_CONFIG[column];
              const items = currentReconciliation[column];

              return (
                <div key={column} className="space-y-2">
                  {/* Column Header */}
                  <div className={`text-center py-2 rounded-t-lg bg-${config.color}-500/10 border-b border-${config.color}-500/30`}>
                    <span className={`text-sm font-bold text-${config.color}-400`}>
                      {config.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 min-h-[100px]">
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No items</p>
                    ) : (
                      items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1 p-2 bg-gray-900/50 rounded text-xs"
                        >
                          <span className="flex-1 text-gray-300">{item}</span>
                          {!readOnly && (
                            <button
                              onClick={() => handleRemoveItem(column, i)}
                              className="text-gray-500 hover:text-red-400"
                            >
                              x
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Item Input */}
                  {!readOnly && (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newItem[column]}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, [column]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(column)}
                        placeholder={`Add ${column}...`}
                        className="flex-1 px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={() => handleAddItem(column)}
                        disabled={!newItem[column].trim()}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded text-xs"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divergences Section */}
          {divergenceCount > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-red-400">Detected Divergences</h4>
                {!readOnly && (
                  <button
                    onClick={handleClearDivergences}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                {currentReconciliation.divergences.map((div, i) => (
                  <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                    <span className="text-red-500">!</span>
                    {div}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* GCP-01 Warning */}
          {showInReviewPhase && !isReconciled && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-300">
                <strong>GCP-01 Audit Reconciliation Gate:</strong> All divergences must be resolved before the project can be LOCKED. Either fix the issues or obtain Director waiver.
              </p>
            </div>
          )}

          {/* Reconciled Success */}
          {isReconciled && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300 font-medium">
                Reconciliation complete. PLANNED = CLAIMED = VERIFIED.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReconciliationTriad;
