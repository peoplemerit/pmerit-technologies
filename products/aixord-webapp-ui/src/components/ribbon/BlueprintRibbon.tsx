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
    <div className="p-3 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Blueprint</span>
          <span className="text-[10px] text-gray-500">L-BPX / L-IVL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunValidation}
            disabled={isLoading}
            className="text-[11px] px-2 py-1 rounded bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 disabled:opacity-50"
          >
            {isLoading ? '...' : '▶ Validate'}
          </button>
          <button
            onClick={onOpenPanel}
            className="text-[11px] px-2 py-1 rounded bg-gray-600/30 text-gray-300 hover:bg-gray-600/50"
          >
            + Builder
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-800/50 rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase">Scopes</div>
          <div className="text-lg font-bold text-gray-200">{summary?.scopes || 0}</div>
          {(summary?.subscopes || 0) > 0 && (
            <div className="text-[10px] text-gray-500">+{summary?.subscopes} sub</div>
          )}
        </div>
        <div className="flex-1 bg-gray-800/50 rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase">Deliverables</div>
          <div className="text-lg font-bold text-gray-200">{summary?.deliverables || 0}</div>
          <div className="text-[10px] text-gray-500">
            {summary?.deliverables_with_dod || 0}/{summary?.deliverables || 0} DoD
          </div>
        </div>
        <div className="flex-1 bg-gray-800/50 rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase">Integrity</div>
          {summary?.integrity ? (
            <>
              <div className={`text-lg font-bold ${summary.integrity.passed ? 'text-green-400' : 'text-red-400'}`}>
                {summary.integrity.passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="text-[10px] text-gray-500">
                {new Date(summary.integrity.run_at).toLocaleDateString()}
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-gray-500">—</div>
              <div className="text-[10px] text-gray-500">Not run</div>
            </>
          )}
        </div>
      </div>

      {/* Integrity checks detail (if report exists) */}
      {integrityReport && (
        <div className="bg-gray-800/30 rounded p-2">
          <div className="text-[10px] text-gray-500 uppercase mb-1">5-Check Validation (L-IVL)</div>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(integrityReport.checks) as Array<keyof typeof integrityReport.checks>).map(key => {
              const check = integrityReport.checks[key];
              return (
                <div key={key} className="text-center" title={check.detail}>
                  <div className={`text-sm ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {check.passed ? '✓' : '✗'}
                  </div>
                  <div className="text-[9px] text-gray-500 leading-tight">{checkLabels[key]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scope tree toggle */}
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
            <div className="mt-2 max-h-48 overflow-y-auto">
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
