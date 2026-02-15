/**
 * Agent Dashboard — Multi-Agent Status View
 * AIXORD v4.6 — HANDOFF-CGC-01 GAP-1 + HANDOFF-AUDIT-FRONTEND-01 Phase 2B.3
 *
 * Real-time display of agent instances and task queue
 * for the Worker-Auditor multi-agent architecture.
 * Enhanced with audit status, context budget meter, and audit controls.
 */

import { useEffect, useState, useCallback } from 'react';
import { request } from '../lib/api/core';
import { API_BASE } from '../lib/api/config';

interface Agent {
  id: string;
  agent_type: 'SUPERVISOR' | 'WORKER' | 'AUDITOR';
  model_provider: string;
  model_id: string;
  status: string;
  assigned_task: string | null;
  tokens_used: number;
  api_calls: number;
  wu_consumed: number;
  parent_agent_id: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

interface AgentTask {
  id: string;
  task_type: string;
  task_description: string;
  status: string;
  execution_mode: string;
  attempt_count: number;
  max_attempts: number;
  confidence_score: number | null;
  readiness_score: number;
  logic_score: number;
  procedural_score: number;
  validation_score: number;
  assigned_agent_id: string | null;
  agent_type: string | null;
  model_provider: string | null;
  model_id: string | null;
  agent_status: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface AgentDashboardProps {
  projectId: string;
  token: string;
}

const STATUS_COLORS: Record<string, string> = {
  IDLE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  INITIALIZING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  RUNNING: 'bg-green-500/20 text-green-400 border-green-500/30',
  WAITING_FOR_APPROVAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PAUSED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  TERMINATED: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
  // Task statuses
  QUEUED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-green-500/20 text-green-400 border-green-500/30',
  AWAITING_AUDIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  AWAITING_APPROVAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const AGENT_ICONS: Record<string, string> = {
  SUPERVISOR: 'S',
  WORKER: 'W',
  AUDITOR: 'A',
};

const AGENT_ICON_COLORS: Record<string, string> = {
  SUPERVISOR: 'bg-violet-500/20 text-violet-400',
  WORKER: 'bg-blue-500/20 text-blue-400',
  AUDITOR: 'bg-orange-500/20 text-orange-400',
};

export function AgentDashboard({ projectId, token }: AgentDashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audit enhancements (Phase 2B.3)
  const [auditConfig, setAuditConfig] = useState<any>(null);
  const [contextBudget, setContextBudget] = useState<any>(null);
  const [pendingAudits, setPendingAudits] = useState<any[]>([]);

  const loadAgents = useCallback(async () => {
    try {
      const data = await request<Agent[]>(
        `/projects/${projectId}/agents`, {}, token
      );
      setAgents(data);
    } catch {
      setAgents([]);
    }
  }, [projectId, token]);

  const loadTasks = useCallback(async () => {
    try {
      const data = await request<AgentTask[]>(
        `/projects/${projectId}/tasks`, {}, token
      );
      setTasks(data);
    } catch {
      setTasks([]);
    }
  }, [projectId, token]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([loadAgents(), loadTasks()])
      .catch(() => setError('Failed to load agent data'))
      .finally(() => setLoading(false));

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadAgents();
      loadTasks();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAgents, loadTasks]);

  // Audit data polling (Phase 2B.3)
  useEffect(() => {
    async function loadAuditData() {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) return;

      // Load audit config
      try {
        const configRes = await fetch(
          `${API_BASE}/projects/${projectId}/audit-config`,
          { headers: { 'Authorization': `Bearer ${sessionToken}` } }
        );
        if (configRes.ok) {
          const data = await configRes.json();
          setAuditConfig(data.config);
        }
      } catch (e) { /* silent */ }

      // Load context budget
      try {
        const budgetRes = await fetch(
          `${API_BASE}/projects/${projectId}/agents/context-budget?scope=full`,
          { headers: { 'Authorization': `Bearer ${sessionToken}` } }
        );
        if (budgetRes.ok) {
          const data = await budgetRes.json();
          setContextBudget(data.budget);
        }
      } catch (e) { /* silent */ }

      // Load pending audits (audits with pending findings)
      try {
        const auditsRes = await fetch(
          `${API_BASE}/projects/${projectId}/agents/audit-log`,
          { headers: { 'Authorization': `Bearer ${sessionToken}` } }
        );
        if (auditsRes.ok) {
          const auditsData = await auditsRes.json();
          const pending = [];

          for (const audit of auditsData.audits || []) {
            const findingsRes = await fetch(
              `${API_BASE}/projects/${projectId}/audit-findings?audit_id=${audit.id}&disposition=PENDING`,
              { headers: { 'Authorization': `Bearer ${sessionToken}` } }
            );
            if (findingsRes.ok) {
              const findingsData = await findingsRes.json();
              if (findingsData.findings?.length > 0) {
                pending.push({
                  ...audit,
                  pending_count: findingsData.findings.length
                });
              }
            }
          }

          setPendingAudits(pending);
        }
      } catch (e) { /* silent */ }
    }

    loadAuditData();
    const interval = setInterval(loadAuditData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [projectId]);

  // Run audit (Phase 2B.3)
  async function runAudit(scope: 'full' | 'module', target?: string) {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    try {
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/agents/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            task_type: 'CROSS_MODEL_VALIDATION',
            description: scope === 'full'
              ? 'Full codebase audit'
              : `Audit ${target}`,
            parameters: {
              scope,
              target,
              worker_model: auditConfig?.worker_model || 'openai:gpt-4o',
              auditor_model: auditConfig?.auditor_model || 'anthropic:claude-sonnet-4-20250514'
            }
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create audit task');

      alert('Audit task created successfully');
      loadTasks();
    } catch (error) {
      console.error('Run audit error:', error);
      alert('Failed to create audit task');
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">Loading agent dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400 text-sm">{error}</div>
    );
  }

  const activeAgents = agents.filter(a => ['RUNNING', 'WAITING_FOR_APPROVAL', 'PAUSED'].includes(a.status));
  const pendingTasks = tasks.filter(t => ['QUEUED', 'ASSIGNED'].includes(t.status));
  const activeTasks = tasks.filter(t => ['IN_PROGRESS', 'AWAITING_AUDIT', 'AWAITING_APPROVAL'].includes(t.status));
  const totalWU = agents.reduce((sum, a) => sum + (a.wu_consumed || 0), 0);
  const totalTokens = agents.reduce((sum, a) => sum + (a.tokens_used || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className="text-lg font-bold text-white">{activeAgents.length}</div>
          <div className="text-xs text-gray-500">Active Agents</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className="text-lg font-bold text-amber-400">{pendingTasks.length + activeTasks.length}</div>
          <div className="text-xs text-gray-500">Tasks</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className="text-lg font-bold text-violet-400">{totalWU.toFixed(1)}</div>
          <div className="text-xs text-gray-500">WU Used</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className="text-lg font-bold text-blue-400">{(totalTokens / 1000).toFixed(1)}k</div>
          <div className="text-xs text-gray-500">Tokens</div>
        </div>
      </div>

      {/* Agent Instances */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-violet-500/20 text-violet-400">
            AG
          </div>
          <h3 className="text-sm font-semibold text-white">Agent Instances</h3>
          <span className="text-xs text-gray-500">{agents.length} total</span>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No agents created yet.
            <br />
            Use the orchestrate endpoint to create agents.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2.5 bg-gray-900/30 border border-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    AGENT_ICON_COLORS[agent.agent_type] || 'bg-gray-700 text-gray-400'
                  }`}>
                    {AGENT_ICONS[agent.agent_type] || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{agent.agent_type}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{agent.model_id}</span>
                    </div>
                    {agent.assigned_task && (
                      <p className="text-[10px] text-gray-500 truncate">{agent.assigned_task}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {(agent.tokens_used || 0).toLocaleString()} tok
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    STATUS_COLORS[agent.status] || 'bg-gray-700 text-gray-400 border-gray-600'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Queue */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-400">
            TQ
          </div>
          <h3 className="text-sm font-semibold text-white">Task Queue</h3>
          <span className="text-xs text-gray-500">{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No tasks in queue.
            <br />
            Tasks are created by the Supervisor during orchestration.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tasks.map(task => (
              <div
                key={task.id}
                className="p-2.5 bg-gray-900/30 border border-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-700/50 text-gray-400 rounded">
                      {task.task_type}
                    </span>
                    <span className="text-xs text-gray-300 truncate max-w-[200px]">
                      {task.task_description}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    STATUS_COLORS[task.status] || 'bg-gray-700 text-gray-400 border-gray-600'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {/* Readiness Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-16 shrink-0">Readiness:</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (task.readiness_score || 0) >= 0.8 ? 'bg-green-500' :
                        (task.readiness_score || 0) >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(task.readiness_score || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 w-10 text-right">
                    {((task.readiness_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Attempt count */}
                {task.attempt_count > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500">
                      Attempt {task.attempt_count}/{task.max_attempts}
                    </span>
                    {task.confidence_score !== null && (
                      <span className="text-[10px] text-gray-500">
                        | Confidence: {task.confidence_score}%
                      </span>
                    )}
                    {task.error_message && (
                      <span className="text-[10px] text-red-400 truncate max-w-[200px]" title={task.error_message}>
                        {task.error_message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Budget Section (Phase 2B.3) */}
      {contextBudget && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-green-500/20 text-green-400">
              CB
            </div>
            <h3 className="text-sm font-semibold text-white">Context Budget</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Startup Context</span>
                <span className="text-gray-400 font-mono">
                  {contextBudget.startup?.total || 0} lines
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(((contextBudget.startup?.total || 0) / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Target: &le;500 lines (L-MOSA3)
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Claude Capacity</span>
                <span className={`font-mono font-medium ${
                  (contextBudget.total?.claude_capacity_percent || 0) > 75
                    ? 'text-red-400'
                    : (contextBudget.total?.claude_capacity_percent || 0) > 50
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}>
                  {contextBudget.total?.claude_capacity_percent || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (contextBudget.total?.claude_capacity_percent || 0) > 75
                      ? 'bg-red-500'
                      : (contextBudget.total?.claude_capacity_percent || 0) > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(contextBudget.total?.claude_capacity_percent || 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-gray-500">
              <p>Status: <span className="font-semibold text-gray-400">{contextBudget.status || 'Unknown'}</span></p>
              {contextBudget.recommendation && (
                <p className="mt-0.5">{contextBudget.recommendation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Audits Section (Phase 2B.3) */}
      {pendingAudits.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-yellow-500/20 text-yellow-400">
              !
            </div>
            <h3 className="text-sm font-semibold text-yellow-400">Audits Requiring Triage</h3>
          </div>

          <div className="space-y-2">
            {pendingAudits.map(audit => (
              <div key={audit.id} className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white">
                    Audit from {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {audit.pending_count} findings pending triage
                  </p>
                </div>
                <button
                  onClick={() => {/* Open AuditGate — wired by parent component */}}
                  className="px-2.5 py-1 text-[10px] font-medium bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
                >
                  Triage Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Controls Section (Phase 2B.3) */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-orange-500/20 text-orange-400">
            AC
          </div>
          <h3 className="text-sm font-semibold text-white">Audit Controls</h3>
        </div>

        <div className="space-y-3">
          {auditConfig && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-2.5">
                <p className="text-[10px] text-gray-500">Worker Model</p>
                <p className="text-xs font-mono text-gray-300">{auditConfig.worker_model}</p>
              </div>
              <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-2.5">
                <p className="text-[10px] text-gray-500">Auditor Model</p>
                <p className="text-xs font-mono text-gray-300">{auditConfig.auditor_model}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => runAudit('full')}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-40"
              disabled={contextBudget?.status === 'RED'}
            >
              Run Full Audit
            </button>
            <button
              onClick={() => {
                const target = prompt('Enter module name (e.g., 03-ARCHITECTURE):');
                if (target) runAudit('module', target);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              Audit Single Module
            </button>
          </div>

          {contextBudget?.status === 'RED' && (
            <p className="text-[10px] text-red-400">
              Context budget exceeded. Use incremental audit only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
