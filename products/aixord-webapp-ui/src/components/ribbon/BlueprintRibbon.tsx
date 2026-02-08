/**
 * BlueprintRibbon — Compact ribbon view for Blueprint governance
 * Shows scope/deliverable counts, integrity validation status, and actions.
 */

import { useState } from 'react';
import type { BlueprintSummary, IntegrityReport, BlueprintScope, BlueprintDeliverable } from '../../lib/api';
import BlueprintScopeTree from '../BlueprintScopeTree';

interface BlueprintRibbonProps {
  summary: BlueprintSummary | null;
  scopes: BlueprintScope[];
  deliverables: BlueprintDeliverable[];
  integrityReport: IntegrityReport | null;
  isLoading: boolean;
  onOpenPanel: () => void;
  onRunValidation: () => void;
  onDeleteScope?: (scopeId: string) => void;
  onDeleteDeliverable?: (deliverableId: string) => void;
}

const checkLabels: Record<string, string> = {
  formula: 'Formula Integrity',
  structural: 'Structural Completeness',
  dag: 'DAG Soundness',
  deliverable: 'Deliverable Integrity',
  assumption: 'Assumption Closure',
};

export default function BlueprintRibbon({
  summary,
  scopes,
  deliverables,
  integrityReport,
  isLoading,
  onOpenPanel,
  onRunValidation,
  onDeleteScope,
  onDeleteDeliverable,
}: BlueprintRibbonProps) {
  const [showTree, setShowTree] = useState(false);

  return (
    <div className="space-y-2">
      {/* Row 1: Header + stats inline + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Blueprint</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">
              <span className="text-white font-medium">{summary?.scopes || 0}</span> scopes
              {(summary?.subscopes || 0) > 0 && <span className="text-gray-500"> (+{summary?.subscopes})</span>}
            </span>
            <span className="text-gray-400">
              <span className="text-white font-medium">{summary?.deliverables || 0}</span> deliv
              <span className="text-gray-500"> ({summary?.deliverables_with_dod || 0} DoD)</span>
            </span>
            <span className={`font-medium ${
              summary?.integrity?.passed ? 'text-green-400' : summary?.integrity ? 'text-red-400' : 'text-gray-500'
            }`}>
              {summary?.integrity ? (summary.integrity.passed ? '✓ PASS' : '✗ FAIL') : '— Not run'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunValidation}
            disabled={isLoading}
            className="text-[11px] px-2 py-0.5 rounded bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 disabled:opacity-50"
          >
            {isLoading ? '...' : '▶ Validate'}
          </button>
          <button
            onClick={onOpenPanel}
            className="text-[11px] px-2 py-0.5 rounded bg-gray-600/30 text-gray-300 hover:bg-gray-600/50"
          >
            + Builder
          </button>
        </div>
      </div>

      {/* Row 2: Integrity checks inline (if report exists) */}
      {integrityReport && (
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs w-16 shrink-0">Checks:</span>
          {(Object.keys(integrityReport.checks) as Array<keyof typeof integrityReport.checks>).map(key => {
            const check = integrityReport.checks[key];
            return (
              <span
                key={key}
                title={`${checkLabels[key]}: ${check.detail}`}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  check.passed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {check.passed ? '✓' : '✗'} {checkLabels[key]?.split(' ')[0]}
              </span>
            );
          })}
        </div>
      )}

      {/* Row 3: Scope tree toggle (compact) */}
      {scopes.length > 0 && (
        <div>
          <button
            onClick={() => setShowTree(!showTree)}
            className="text-[11px] text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <span>{showTree ? '▾' : '▸'}</span>
            <span>Scope Tree ({scopes.length} scopes, {deliverables.length} deliverables)</span>
          </button>
          {showTree && (
            <div className="mt-1 max-h-[60px] overflow-y-auto">
              <BlueprintScopeTree
                scopes={scopes}
                deliverables={deliverables}
                onDeleteScope={onDeleteScope}
                onDeleteDeliverable={onDeleteDeliverable}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
