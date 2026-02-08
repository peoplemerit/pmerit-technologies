/**
 * BlueprintPanel Component — AIXORD v4.5 Post-Blueprint Governance (L-BPX, L-IVL)
 *
 * Slide-out panel for managing blueprint scopes, deliverables, and integrity validation.
 * Follows EngineeringPanel pattern: tabbed interface with CRUD forms.
 *
 * Sections:
 * - Scopes: Create/manage scopes and sub-scopes (L-BPX2, L-BPX3)
 * - Deliverables: Create/manage deliverables with DoD (L-BPX4, L-BPX5)
 * - Validation: Run 5-check integrity validation (L-IVL)
 * - DAG: View dependency graph
 */

import { useState, useEffect, useCallback } from 'react';
import {
  blueprintApi,
  type BlueprintScope,
  type BlueprintDeliverable,
  type IntegrityReport,
  type DAGNode,
  type DAGEdge,
} from '../lib/api';
import BlueprintScopeTree from './BlueprintScopeTree';

export type BlueprintSection = 'scopes' | 'deliverables' | 'validation' | 'dag';

interface BlueprintPanelProps {
  projectId: string;
  token: string;
  initialSection?: BlueprintSection;
  onClose: () => void;
  onUpdate?: () => void;
  /** AI-Governance Integration — Phase 2: Trigger gate re-evaluation after changes */
  onEvaluateGates?: () => void;
}

const SECTION_LABELS: Record<BlueprintSection, string> = {
  scopes: 'Scopes',
  deliverables: 'Deliverables',
  validation: 'Validation',
  dag: 'DAG View',
};

const checkLabels: Record<string, string> = {
  formula: 'Formula Integrity',
  structural: 'Structural Completeness',
  dag: 'DAG Soundness',
  deliverable: 'Deliverable Integrity',
  assumption: 'Assumption Closure',
};

export function BlueprintPanel({
  projectId,
  token,
  initialSection = 'scopes',
  onClose,
  onUpdate,
  onEvaluateGates,
}: BlueprintPanelProps) {
  const [activeSection, setActiveSection] = useState<BlueprintSection>(initialSection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [scopes, setScopes] = useState<BlueprintScope[]>([]);
  const [deliverables, setDeliverables] = useState<BlueprintDeliverable[]>([]);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [dagNodes, setDagNodes] = useState<DAGNode[]>([]);
  const [dagEdges, setDagEdges] = useState<DAGEdge[]>([]);

  // CRUD state
  const [showCreate, setShowCreate] = useState(false);
  const [createFields, setCreateFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  // Load data for active section
  const loadSection = useCallback(async (section: BlueprintSection) => {
    setLoading(true);
    setError(null);
    try {
      switch (section) {
        case 'scopes': {
          const [s, d] = await Promise.all([
            blueprintApi.listScopes(projectId, token),
            blueprintApi.listDeliverables(projectId, token),
          ]);
          setScopes(s);
          setDeliverables(d);
          break;
        }
        case 'deliverables': {
          const [s, d] = await Promise.all([
            blueprintApi.listScopes(projectId, token),
            blueprintApi.listDeliverables(projectId, token),
          ]);
          setScopes(s);
          setDeliverables(d);
          break;
        }
        case 'validation': {
          try {
            const report = await blueprintApi.getIntegrity(projectId, token);
            setIntegrityReport(report);
          } catch {
            setIntegrityReport(null);
          }
          break;
        }
        case 'dag': {
          try {
            const dag = await blueprintApi.getDAG(projectId, token);
            setDagNodes(dag.nodes || []);
            setDagEdges(dag.edges || []);
          } catch {
            setDagNodes([]);
            setDagEdges([]);
          }
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    loadSection(activeSection);
  }, [activeSection, loadSection]);

  const handleSectionChange = (section: BlueprintSection) => {
    setActiveSection(section);
    setShowCreate(false);
    setCreateFields({});
  };

  // ============================================================================
  // CRUD Handlers
  // ============================================================================

  const handleCreateScope = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await blueprintApi.createScope(projectId, {
        name: createFields.name || 'Untitled Scope',
        parent_scope_id: createFields.parent_scope_id || undefined,
        purpose: createFields.purpose || undefined,
        boundary: createFields.boundary || undefined,
        assumptions: createFields.assumptions ? createFields.assumptions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        assumption_status: createFields.assumption_status || undefined,
      }, token);
      setShowCreate(false);
      setCreateFields({});
      await loadSection('scopes');
      onUpdate?.();
      onEvaluateGates?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scope');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDeliverable = async () => {
    if (saving) return;
    if (!createFields.scope_id) {
      setError('Please select a scope for the deliverable');
      return;
    }
    setSaving(true);
    try {
      await blueprintApi.createDeliverable(projectId, {
        scope_id: createFields.scope_id,
        name: createFields.name || 'Untitled Deliverable',
        description: createFields.description || undefined,
        dod_evidence_spec: createFields.dod_evidence_spec || undefined,
        dod_verification_method: createFields.dod_verification_method || undefined,
        dod_quality_bar: createFields.dod_quality_bar || undefined,
        dod_failure_modes: createFields.dod_failure_modes || undefined,
        upstream_deps: createFields.upstream_deps ? createFields.upstream_deps.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        dependency_type: createFields.dependency_type || undefined,
      }, token);
      setShowCreate(false);
      setCreateFields({});
      await loadSection('deliverables');
      onUpdate?.();
      onEvaluateGates?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deliverable');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (activeSection === 'scopes') {
      await handleCreateScope();
    } else if (activeSection === 'deliverables') {
      await handleCreateDeliverable();
    }
  };

  const handleDeleteScope = async (scopeId: string) => {
    try {
      await blueprintApi.deleteScope(projectId, scopeId, token);
      await loadSection(activeSection);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scope');
    }
  };

  const handleDeleteDeliverable = async (deliverableId: string) => {
    try {
      await blueprintApi.deleteDeliverable(projectId, deliverableId, token);
      await loadSection(activeSection);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deliverable');
    }
  };

  const handleRunValidation = async () => {
    setValidating(true);
    setError(null);
    try {
      const report = await blueprintApi.runValidation(projectId, token);
      setIntegrityReport(report);
      onUpdate?.();
      onEvaluateGates?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  // ============================================================================
  // Form Helpers
  // ============================================================================

  const formInput = (label: string, key: string, placeholder?: string) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={createFields[key] || ''}
        onChange={(e) => setCreateFields(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
      />
    </div>
  );

  const formTextarea = (label: string, key: string, placeholder?: string) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <textarea
        value={createFields[key] || ''}
        onChange={(e) => setCreateFields(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        rows={2}
        className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
      />
    </div>
  );

  const formSelect = (label: string, key: string, options: { value: string; label: string }[]) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={createFields[key] || ''}
        onChange={(e) => setCreateFields(prev => ({ ...prev, [key]: e.target.value }))}
        className="w-full px-2 py-1.5 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-violet-500"
      >
        <option value="">Select...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const renderCreateForm = () => {
    if (activeSection === 'scopes') {
      const parentOptions = scopes
        .filter(s => s.tier === 1)
        .map(s => ({ value: s.id, label: s.name }));

      return (
        <>
          {formInput('Scope Name', 'name', 'e.g., Authentication Module')}
          {parentOptions.length > 0 && formSelect('Parent Scope (optional — makes sub-scope)', 'parent_scope_id', parentOptions)}
          {formTextarea('Purpose', 'purpose', 'Why this scope exists')}
          {formTextarea('Boundary', 'boundary', 'What is in/out of scope')}
          {formInput('Assumptions', 'assumptions', 'Comma-separated assumptions')}
          {formSelect('Assumption Status', 'assumption_status', [
            { value: 'OPEN', label: 'OPEN' },
            { value: 'CONFIRMED', label: 'CONFIRMED' },
            { value: 'UNKNOWN', label: 'UNKNOWN' },
          ])}
        </>
      );
    }

    if (activeSection === 'deliverables') {
      const scopeOptions = scopes.map(s => ({
        value: s.id,
        label: `${s.tier === 2 ? '  ↳ ' : ''}${s.name}`,
      }));

      return (
        <>
          {formInput('Deliverable Name', 'name', 'e.g., Login API Endpoint')}
          {formSelect('Scope', 'scope_id', scopeOptions)}
          {formTextarea('Description', 'description', 'What this deliverable produces')}
          <div className="border-t border-gray-700/50 pt-2 mt-2">
            <div className="text-xs text-violet-400 font-medium mb-2">Definition of Done (L-BPX5)</div>
            {formTextarea('Evidence Spec', 'dod_evidence_spec', 'What evidence proves completion')}
            {formSelect('Verification Method', 'dod_verification_method', [
              { value: 'AUTOMATED', label: 'Automated' },
              { value: 'MANUAL', label: 'Manual' },
              { value: 'REVIEW', label: 'Review' },
              { value: 'DEMO', label: 'Demo' },
            ])}
            {formInput('Quality Bar', 'dod_quality_bar', 'Minimum quality threshold')}
            {formTextarea('Failure Modes', 'dod_failure_modes', 'Known ways this can fail')}
          </div>
          <div className="border-t border-gray-700/50 pt-2 mt-2">
            <div className="text-xs text-violet-400 font-medium mb-2">Dependencies (L-BPX4)</div>
            {formInput('Upstream Dependencies', 'upstream_deps', 'Comma-separated deliverable IDs')}
            {formSelect('Dependency Type', 'dependency_type', [
              { value: 'hard', label: 'Hard (blocking)' },
              { value: 'soft', label: 'Soft (non-blocking)' },
            ])}
          </div>
        </>
      );
    }

    return null;
  };

  // ============================================================================
  // Section Renderers
  // ============================================================================

  const renderScopesContent = () => {
    if (scopes.length === 0 && deliverables.length === 0) {
      return <EmptyState label="No Blueprint Scopes" />;
    }

    return (
      <BlueprintScopeTree
        scopes={scopes}
        deliverables={deliverables}
        onDeleteScope={handleDeleteScope}
        onDeleteDeliverable={handleDeleteDeliverable}
      />
    );
  };

  const renderDeliverablesContent = () => {
    if (deliverables.length === 0) {
      return <EmptyState label="No Deliverables" />;
    }

    return (
      <div className="space-y-2">
        {deliverables.map(d => {
          const scope = scopes.find(s => s.id === d.scope_id);
          const deps = JSON.parse(d.upstream_deps || '[]') as string[];
          const hasDoD = !!d.dod_evidence_spec && !!d.dod_verification_method;

          return (
            <div key={d.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">{d.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${hasDoD ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    DoD {hasDoD ? '✓' : '○'}
                  </span>
                  <StatusBadge status={d.status} />
                  <button
                    onClick={() => handleDeleteDeliverable(d.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {scope && (
                <div className="text-xs text-gray-500 mb-1">
                  Scope: <span className="text-violet-400">{scope.name}</span>
                </div>
              )}
              {d.description && (
                <div className="text-xs text-gray-400 mb-1">{d.description}</div>
              )}
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-1">
                <div>Evidence: {d.dod_evidence_spec ? '✓' : '○'}</div>
                <div>Verification: {d.dod_verification_method ? '✓' : '○'}</div>
                <div>Quality: {d.dod_quality_bar ? '✓' : '○'}</div>
                <div>Failures: {d.dod_failure_modes ? '✓' : '○'}</div>
              </div>
              {deps.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Dependencies: {deps.length} upstream ({d.dependency_type || 'hard'})
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderValidationContent = () => {
    return (
      <div className="space-y-4">
        {/* Run Validation Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white font-medium">Integrity Validation (L-IVL)</div>
            <div className="text-xs text-gray-500">5-check validation required before EXECUTE entry</div>
          </div>
          <button
            onClick={handleRunValidation}
            disabled={validating}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {validating ? 'Running...' : '▶ Run Validation'}
          </button>
        </div>

        {/* Report Display */}
        {integrityReport ? (
          <div className="space-y-3">
            {/* Overall Result */}
            <div className={`p-3 rounded-lg border ${integrityReport.all_passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${integrityReport.all_passed ? 'text-green-400' : 'text-red-400'}`}>
                    {integrityReport.all_passed ? '✓ PASS' : '✗ FAIL'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(integrityReport.run_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {integrityReport.totals?.scopes ?? 0} scopes · {integrityReport.totals?.deliverables ?? 0} deliverables
                </div>
              </div>
            </div>

            {/* Individual Checks */}
            <div className="space-y-2">
              {(Object.keys(integrityReport.checks) as Array<keyof typeof integrityReport.checks>).map(key => {
                const check = integrityReport.checks[key];
                return (
                  <div key={key} className={`p-3 rounded-lg border ${check.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {check.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-sm text-white font-medium">{checkLabels[key] || key}</span>
                      </div>
                    </div>
                    {check.detail && (
                      <div className="text-xs text-gray-400 mt-1 ml-5">{check.detail}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm mb-2">No validation report yet</div>
            <p className="text-gray-600 text-xs">
              Click "Run Validation" to check blueprint integrity.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDAGContent = () => {
    if (dagNodes.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm mb-2">No DAG data</div>
          <p className="text-gray-600 text-xs">
            Create deliverables with dependencies to build the DAG.
          </p>
          <button
            onClick={() => loadSection('dag')}
            className="mt-3 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-xs text-gray-500 mb-2">
          {dagNodes.length} nodes · {dagEdges.length} edges
        </div>

        {/* Node list with dependency arrows */}
        <div className="space-y-2">
          {dagNodes.map(node => {
            const incomingEdges = dagEdges.filter(e => e.to === node.id);
            const outgoingEdges = dagEdges.filter(e => e.from === node.id);

            return (
              <div key={node.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{node.name}</span>
                  <StatusBadge status={node.status} />
                </div>
                <div className="text-xs text-gray-500">
                  Scope: <span className="text-violet-400">{node.scope_id}</span>
                </div>
                {incomingEdges.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    ↑ Depends on: {incomingEdges.map(e => {
                      const fromNode = dagNodes.find(n => n.id === e.from);
                      return fromNode?.name || e.from;
                    }).join(', ')}
                    {incomingEdges.some(e => e.type === 'soft') && <span className="text-gray-600 ml-1">(soft)</span>}
                  </div>
                )}
                {outgoingEdges.length > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ↓ Blocks: {outgoingEdges.map(e => {
                      const toNode = dagNodes.find(n => n.id === e.to);
                      return toNode?.name || e.to;
                    }).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>;
    }
    if (error) {
      return (
        <div className="text-red-400 text-sm py-4 text-center">
          {error}
          <button
            onClick={() => { setError(null); loadSection(activeSection); }}
            className="block mx-auto mt-2 text-xs text-gray-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'scopes': return renderScopesContent();
      case 'deliverables': return renderDeliverablesContent();
      case 'validation': return renderValidationContent();
      case 'dag': return renderDAGContent();
      default: return null;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  const canCreate = activeSection === 'scopes' || activeSection === 'deliverables';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-gray-900 border-l border-gray-700 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">Blueprint Governance</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-700/50 bg-gray-800/50">
          {(Object.keys(SECTION_LABELS) as BlueprintSection[]).map(section => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeSection === section
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {SECTION_LABELS[section]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add button (only for scopes/deliverables) */}
          {canCreate && (
            <div className="flex justify-end mb-3">
              <button
                onClick={() => { setShowCreate(!showCreate); setCreateFields({}); }}
                className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                {showCreate ? 'Cancel' : `+ Add ${activeSection === 'scopes' ? 'Scope' : 'Deliverable'}`}
              </button>
            </div>
          )}

          {/* Create form */}
          {showCreate && canCreate && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-violet-500/30 space-y-2">
              {renderCreateForm()}
              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-yellow-500/20 text-yellow-400',
    ACTIVE: 'bg-green-500/20 text-green-400',
    READY: 'bg-cyan-500/20 text-cyan-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    COMPLETE: 'bg-green-500/20 text-green-400',
    DONE: 'bg-green-500/20 text-green-400',
    VERIFIED: 'bg-emerald-500/20 text-emerald-400',
    LOCKED: 'bg-purple-500/20 text-purple-400',
    BLOCKED: 'bg-red-500/20 text-red-400',
    CANCELLED: 'bg-gray-600/20 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <p className="text-gray-600 text-xs">
        Use the + Add button above to create one.
      </p>
    </div>
  );
}

export default BlueprintPanel;
