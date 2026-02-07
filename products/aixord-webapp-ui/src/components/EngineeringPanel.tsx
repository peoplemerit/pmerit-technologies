/**
 * EngineeringPanel Component — AIXORD v4.5 Part XIV
 *
 * Slide-out panel for viewing and managing engineering governance artifacts.
 * Tabbed interface for each Part XIV artifact type with CRUD forms.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  engineeringApi,
  type SAR,
  type InterfaceContract,
  type FitnessFunction,
  type IntegrationTestRecord,
  type IterationBudget,
  type OperationalReadiness,
  type RollbackStrategy,
  type AlertConfiguration,
  type KnowledgeTransfer,
  type FitnessDimension,
  type TestLevel,
  type ReadinessLevel,
  type AlertSeverity,
  type KnowledgeTransferType,
} from '../lib/api';

export type EngineeringSection =
  | 'sar' | 'contracts' | 'fitness' | 'tests'
  | 'budget' | 'readiness' | 'rollback' | 'alerts' | 'knowledge';

interface EngineeringPanelProps {
  projectId: string;
  token: string;
  initialSection?: EngineeringSection;
  onClose: () => void;
  onUpdate?: () => void;
}

const SECTION_LABELS: Record<EngineeringSection, string> = {
  sar: 'Architecture Records',
  contracts: 'Interface Contracts',
  fitness: 'Fitness Functions',
  tests: 'Integration Tests',
  budget: 'Iteration Budget',
  readiness: 'Operational Readiness',
  rollback: 'Rollback Strategies',
  alerts: 'Alert Configurations',
  knowledge: 'Knowledge Transfer',
};

export function EngineeringPanel({
  projectId,
  token,
  initialSection = 'sar',
  onClose,
  onUpdate,
}: EngineeringPanelProps) {
  const [activeSection, setActiveSection] = useState<EngineeringSection>(initialSection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [sars, setSars] = useState<SAR[]>([]);
  const [contracts, setContracts] = useState<InterfaceContract[]>([]);
  const [fitness, setFitness] = useState<FitnessFunction[]>([]);
  const [tests, setTests] = useState<IntegrationTestRecord[]>([]);
  const [budgets, setBudgets] = useState<IterationBudget[]>([]);
  const [readiness, setReadiness] = useState<OperationalReadiness[]>([]);
  const [rollbackList, setRollbackList] = useState<RollbackStrategy[]>([]);
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeTransfer[]>([]);

  // Load data for active section
  const loadSection = useCallback(async (section: EngineeringSection) => {
    setLoading(true);
    setError(null);
    try {
      switch (section) {
        case 'sar': setSars(await engineeringApi.listSAR(projectId, token)); break;
        case 'contracts': setContracts(await engineeringApi.listContracts(projectId, token)); break;
        case 'fitness': setFitness(await engineeringApi.listFitness(projectId, token)); break;
        case 'tests': setTests(await engineeringApi.listTests(projectId, token)); break;
        case 'budget': setBudgets(await engineeringApi.listBudget(projectId, token)); break;
        case 'readiness': setReadiness(await engineeringApi.listReadiness(projectId, token)); break;
        case 'rollback': setRollbackList(await engineeringApi.listRollback(projectId, token)); break;
        case 'alerts': setAlerts(await engineeringApi.listAlerts(projectId, token)); break;
        case 'knowledge': setKnowledge(await engineeringApi.listKnowledge(projectId, token)); break;
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

  const handleSectionChange = (section: EngineeringSection) => {
    setActiveSection(section);
  };

  // CRUD state
  const [showCreate, setShowCreate] = useState(false);
  const [createFields, setCreateFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (saving) return;
    setSaving(true);
    try {
      switch (activeSection) {
        case 'sar':
          await engineeringApi.createSAR(projectId, { title: createFields.title || 'Untitled SAR' }, token);
          break;
        case 'contracts':
          await engineeringApi.createContract(projectId, {
            contract_name: createFields.name || 'Untitled Contract',
            producer: createFields.producer || '',
            consumer: createFields.consumer || '',
          }, token);
          break;
        case 'fitness':
          await engineeringApi.createFitness(projectId, {
            metric_name: createFields.name || 'Untitled Metric',
            dimension: (createFields.dimension as FitnessDimension) || 'PERFORMANCE',
            target_value: createFields.target || '0',
          }, token);
          break;
        case 'tests':
          await engineeringApi.createTest(projectId, {
            test_name: createFields.name || 'Untitled Test',
            test_level: (createFields.level as TestLevel) || 'INTEGRATION',
          }, token);
          break;
        case 'budget':
          await engineeringApi.createBudget(projectId, {
            scope_name: createFields.name || 'Untitled Scope',
            iteration_ceiling: parseInt(createFields.ceiling || '10', 10),
            expected_iterations: parseInt(createFields.expected || '5', 10),
          }, token);
          break;
        case 'readiness':
          await engineeringApi.createReadiness(projectId, {
            declared_level: (createFields.level as ReadinessLevel) || 'L0',
          }, token);
          break;
        case 'rollback':
          await engineeringApi.createRollback(projectId, {
            component_name: createFields.name || 'Untitled Component',
            rollback_method: createFields.method || 'REDEPLOY',
          }, token);
          break;
        case 'alerts':
          await engineeringApi.createAlert(projectId, {
            alert_name: createFields.name || 'Untitled Alert',
            severity: (createFields.severity as AlertSeverity) || 'SEV3',
            condition_description: createFields.condition || '',
          }, token);
          break;
        case 'knowledge':
          await engineeringApi.createKnowledge(projectId, {
            title: createFields.name || 'Untitled KT',
            transfer_type: (createFields.type as KnowledgeTransferType) || 'ARCHITECTURE',
          }, token);
          break;
      }
      setShowCreate(false);
      setCreateFields({});
      await loadSection(activeSection);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section: EngineeringSection, itemId: string) => {
    try {
      switch (section) {
        case 'sar': await engineeringApi.deleteSAR(projectId, itemId, token); break;
        case 'contracts': await engineeringApi.deleteContract(projectId, itemId, token); break;
        case 'fitness': await engineeringApi.deleteFitness(projectId, itemId, token); break;
        case 'tests': await engineeringApi.deleteTest(projectId, itemId, token); break;
        case 'rollback': await engineeringApi.deleteRollback(projectId, itemId, token); break;
        case 'alerts': await engineeringApi.deleteAlert(projectId, itemId, token); break;
        case 'knowledge': await engineeringApi.deleteKnowledge(projectId, itemId, token); break;
        default: return; // Budget/Readiness may not have delete
      }
      await loadSection(section);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Status badge helper
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-yellow-500/20 text-yellow-400',
      ACTIVE: 'bg-green-500/20 text-green-400',
      SUPERSEDED: 'bg-gray-500/20 text-gray-400',
      ARCHIVED: 'bg-gray-600/20 text-gray-500',
      DEPRECATED: 'bg-orange-500/20 text-orange-400',
      BROKEN: 'bg-red-500/20 text-red-400',
      DEFINED: 'bg-blue-500/20 text-blue-400',
      MEASURING: 'bg-cyan-500/20 text-cyan-400',
      PASSING: 'bg-green-500/20 text-green-400',
      FAILING: 'bg-red-500/20 text-red-400',
      NOT_RUN: 'bg-gray-500/20 text-gray-400',
      PASS: 'bg-green-500/20 text-green-400',
      FAIL: 'bg-red-500/20 text-red-400',
      EXCEEDED: 'bg-red-500/20 text-red-400',
      EXHAUSTED: 'bg-orange-500/20 text-orange-400',
      CLOSED: 'bg-gray-500/20 text-gray-400',
      REVIEW: 'bg-blue-500/20 text-blue-400',
      PUBLISHED: 'bg-green-500/20 text-green-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    );
  };

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

  const renderCreateForm = () => {
    switch (activeSection) {
      case 'sar':
        return formInput('Title', 'title', 'System Architecture Record title');
      case 'contracts':
        return <>{formInput('Contract Name', 'name', 'Contract name')}{formInput('Producer', 'producer', 'Producer service')}{formInput('Consumer', 'consumer', 'Consumer service')}</>;
      case 'fitness':
        return <>{formInput('Metric Name', 'name', 'e.g., P95 Latency')}{formInput('Dimension', 'dimension', 'PERFORMANCE|RELIABILITY|SECURITY')}{formInput('Target Value', 'target', 'e.g., 200ms')}</>;
      case 'tests':
        return <>{formInput('Test Name', 'name', 'Test name')}{formInput('Level', 'level', 'UNIT|INTEGRATION|SYSTEM|ACCEPTANCE')}</>;
      case 'budget':
        return <>{formInput('Scope Name', 'name', 'Scope or feature name')}{formInput('Iteration Ceiling', 'ceiling', '10')}{formInput('Expected Iterations', 'expected', '5')}</>;
      case 'readiness':
        return formInput('Declared Level', 'level', 'L0|L1|L2|L3');
      case 'rollback':
        return <>{formInput('Component Name', 'name', 'Component name')}{formInput('Rollback Method', 'method', 'REDEPLOY|DATABASE_ROLLBACK|FEATURE_FLAG')}</>;
      case 'alerts':
        return <>{formInput('Alert Name', 'name', 'Alert name')}{formInput('Severity', 'severity', 'SEV1|SEV2|SEV3|SEV4')}{formInput('Condition', 'condition', 'Trigger condition')}</>;
      case 'knowledge':
        return <>{formInput('Title', 'name', 'KT artifact title')}{formInput('Transfer Type', 'type', 'DEPLOYMENT|MONITORING|TROUBLESHOOTING|ARCHITECTURE|API|DEPENDENCIES')}</>;
      default:
        return null;
    }
  };

  const deleteBtn = (section: EngineeringSection, itemId: string) => (
    <button
      onClick={() => handleDelete(section, itemId)}
      className="text-gray-500 hover:text-red-400 transition-colors p-1"
      title="Delete"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );

  // Render section content
  const renderContent = () => {
    if (loading) {
      return <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>;
    }
    if (error) {
      return <div className="text-red-400 text-sm py-4 text-center">{error}</div>;
    }

    switch (activeSection) {
      case 'sar':
        return sars.length === 0 ? (
          <EmptyState label="No System Architecture Records" />
        ) : (
          <div className="space-y-2">
            {sars.map(s => (
              <div key={s.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{s.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">v{s.version}</span>
                    {statusBadge(s.status)}
                    {deleteBtn('sar', s.id)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mt-2">
                  <div>Boundary: {s.system_boundary ? '✓' : '○'}</div>
                  <div>Components: {s.component_map ? '✓' : '○'}</div>
                  <div>Interfaces: {s.interface_contracts_summary ? '✓' : '○'}</div>
                  <div>Data Flow: {s.data_flow ? '✓' : '○'}</div>
                  <div>State: {s.state_ownership ? '✓' : '○'}</div>
                  <div>Consistency: {s.consistency_model ? '✓' : '○'}</div>
                  <div>Failures: {s.failure_domains ? '✓' : '○'}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'contracts':
        return contracts.length === 0 ? (
          <EmptyState label="No Interface Contracts" />
        ) : (
          <div className="space-y-2">
            {contracts.map(c => (
              <div key={c.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{c.contract_name}</span>
                  <div className="flex items-center gap-2">{statusBadge(c.status)}{deleteBtn('contracts', c.id)}</div>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-violet-400">{c.producer}</span>
                  <span className="mx-1">→</span>
                  <span className="text-blue-400">{c.consumer}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mt-1">
                  <div>Input: {c.input_shape ? '✓' : '○'}</div>
                  <div>Output: {c.output_shape ? '✓' : '○'}</div>
                  <div>Errors: {c.error_contract ? '✓' : '○'}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'fitness':
        return fitness.length === 0 ? (
          <EmptyState label="No Fitness Functions" />
        ) : (
          <div className="space-y-2">
            {fitness.map(f => (
              <div key={f.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{f.metric_name}</span>
                  <div className="flex items-center gap-2">{statusBadge(f.status)}{deleteBtn('fitness', f.id)}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="text-violet-400">{f.dimension}</span>
                  <span>Target: {f.target_value}{f.unit ? ` ${f.unit}` : ''}</span>
                  {f.current_value && <span>Current: {f.current_value}{f.unit ? ` ${f.unit}` : ''}</span>}
                </div>
              </div>
            ))}
          </div>
        );

      case 'tests':
        return tests.length === 0 ? (
          <EmptyState label="No Integration Tests" />
        ) : (
          <div className="space-y-2">
            {tests.map(t => (
              <div key={t.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{t.test_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{t.test_level}</span>
                    {statusBadge(t.last_result)}
                    {deleteBtn('tests', t.id)}
                  </div>
                </div>
                {t.description && (
                  <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                )}
                {(t.producer || t.consumer) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {t.producer && <span className="text-violet-400">{t.producer}</span>}
                    {t.producer && t.consumer && <span className="mx-1">→</span>}
                    {t.consumer && <span className="text-blue-400">{t.consumer}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'budget':
        return budgets.length === 0 ? (
          <EmptyState label="No Iteration Budgets" />
        ) : (
          <div className="space-y-2">
            {budgets.map(b => (
              <div key={b.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{b.scope_name}</span>
                  {statusBadge(b.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Iterations: {b.actual_iterations}/{b.iteration_ceiling}</span>
                  <span>Expected: {b.expected_iterations}</span>
                  {b.time_budget_hours && (
                    <span>Time: {b.time_used_hours}/{b.time_budget_hours}h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'readiness':
        return readiness.length === 0 ? (
          <EmptyState label="No Operational Readiness Records" />
        ) : (
          <div className="space-y-2">
            {readiness.map(r => (
              <div key={r.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">
                    Declared: {r.declared_level} | Current: {r.current_level}
                  </span>
                  {r.verified_at && (
                    <span className="text-xs text-green-400">Verified</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                  <div>Deployment: {r.deployment_method ? '✓' : '○'}</div>
                  <div>Health: {r.health_endpoint ? '✓' : '○'}</div>
                  <div>Logging: {r.logging_strategy ? '✓' : '○'}</div>
                  <div>Alerting: {r.alerting ? '✓' : '○'}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'rollback':
        return rollbackList.length === 0 ? (
          <EmptyState label="No Rollback Strategies" />
        ) : (
          <div className="space-y-2">
            {rollbackList.map(r => (
              <div key={r.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{r.component_name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${r.rollback_tested ? 'text-green-400' : 'text-yellow-400'}`}>
                      {r.rollback_tested ? '✓ Tested' : '○ Untested'}
                    </span>
                    {deleteBtn('rollback', r.id)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Method: {r.rollback_method}
                  {r.recovery_time_target && <span className="ml-3">RTO: {r.recovery_time_target}</span>}
                </div>
              </div>
            ))}
          </div>
        );

      case 'alerts':
        return alerts.length === 0 ? (
          <EmptyState label="No Alert Configurations" />
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{a.alert_name}</span>
                  <div className="flex items-center gap-2">
                    {statusBadge(a.severity)}
                    <span className={`text-xs ${a.enabled ? 'text-green-400' : 'text-gray-500'}`}>
                      {a.enabled ? 'ON' : 'OFF'}
                    </span>
                    {deleteBtn('alerts', a.id)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{a.condition_description}</div>
                {a.notification_channel && (
                  <div className="text-xs text-gray-500 mt-1">Channel: {a.notification_channel}</div>
                )}
              </div>
            ))}
          </div>
        );

      case 'knowledge':
        return knowledge.length === 0 ? (
          <EmptyState label="No Knowledge Transfer Artifacts" />
        ) : (
          <div className="space-y-2">
            {knowledge.map(k => (
              <div key={k.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{k.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{k.transfer_type}</span>
                    {statusBadge(k.status)}
                    {deleteBtn('knowledge', k.id)}
                  </div>
                </div>
                {k.target_audience && (
                  <div className="text-xs text-gray-400">Audience: {k.target_audience}</div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-gray-900 border-l border-gray-700 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">Engineering Governance</h2>
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
          {(Object.keys(SECTION_LABELS) as EngineeringSection[]).map(section => (
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
          {/* Add button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => { setShowCreate(!showCreate); setCreateFields({}); }}
              className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              {showCreate ? 'Cancel' : `+ Add ${SECTION_LABELS[activeSection]}`}
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
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

export default EngineeringPanel;
