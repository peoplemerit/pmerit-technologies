/**
 * InfoRibbon Component (Detail Panel — Compact)
 *
 * Contains Project Info, Session Metrics, Session Graph, and Models
 * in compact rows for 140px max height.
 */

import type { ProjectSession, SessionMetrics } from '../../lib/api';
import { SessionList } from '../session/SessionList';
import { SessionGraph } from '../session/SessionGraph';

interface InfoRibbonProps {
  // Project
  projectId: string;
  projectName: string;
  objective: string;
  realityClassification: string;
  createdAt: string;
  token: string;

  // Session
  sessionNumber: number;
  sessionCost: number;
  sessionTokens: number;
  messageCount: number;
  avgLatencyMs?: number;

  // D11: Backend session metrics
  sessionMetrics?: SessionMetrics | null;

  // Models
  availableModels?: Record<string, Array<{ provider: string; model: string }>>;

  // Sessions (v4.4)
  sessions?: ProjectSession[];
  activeSessionId?: string | null;
  onSwitchSession?: (sessionId: string) => void;

  // Bridge: api.projects.update
  onUpdateProject?: (data: { name?: string; objective?: string }) => void;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

export function InfoRibbon({
  projectId,
  projectName,
  objective,
  realityClassification,
  createdAt,
  token,
  sessionNumber,
  sessionCost,
  sessionTokens,
  messageCount,
  avgLatencyMs,
  availableModels,
  sessionMetrics,
  sessions,
  activeSessionId,
  onSwitchSession,
  onUpdateProject,
}: InfoRibbonProps) {
  return (
    <div className="space-y-2">
      {/* Row 1: Project info + session metrics inline */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Project:</span>
          {onUpdateProject ? (
            <span
              className="text-white text-xs font-medium cursor-pointer hover:text-violet-400 transition-colors"
              title="Click to edit"
              onClick={() => {
                const newName = prompt('Project name:', projectName);
                if (newName && newName !== projectName) onUpdateProject({ name: newName });
              }}
            >
              {projectName}
            </span>
          ) : (
            <span className="text-white text-xs font-medium">{projectName}</span>
          )}
          <span className="text-gray-600">·</span>
          <span className="text-gray-400 text-[10px] capitalize">{realityClassification?.toLowerCase() || 'N/A'}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400 text-[10px]">{formatDate(createdAt)}</span>
        </div>
        <span className="text-gray-600">|</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">S#{sessionNumber}</span>
          <span className="text-green-400 font-medium">${(sessionMetrics?.cost_usd ?? sessionCost).toFixed(4)}</span>
          <span className="text-gray-300">{(sessionMetrics?.tokens.total ?? sessionTokens).toLocaleString()} tok</span>
          <span className="text-gray-300">{sessionMetrics?.messages.total ?? messageCount} msg</span>
          <span className="text-gray-400 text-[10px]">
            {sessionMetrics?.avg_latency_ms
              ? `${(sessionMetrics.avg_latency_ms / 1000).toFixed(1)}s`
              : avgLatencyMs !== undefined
                ? `${(avgLatencyMs / 1000).toFixed(1)}s`
                : ''}
          </span>
        </div>
      </div>

      {/* Row 2: Objective */}
      {objective && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs shrink-0">Objective:</span>
          <span className="text-gray-300 text-xs truncate">{objective}</span>
        </div>
      )}

      {/* Row 3: Session graph/list + Models */}
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <span className="text-gray-500 text-[10px] uppercase">Sessions</span>
          {sessions && onSwitchSession && projectId && token ? (
            <div className="max-h-[55px] overflow-y-auto mt-0.5">
              <SessionGraph
                projectId={projectId}
                token={token}
                sessions={sessions}
                activeSessionId={activeSessionId || null}
                onSwitchSession={onSwitchSession}
              />
            </div>
          ) : sessions && onSwitchSession ? (
            <div className="max-h-[55px] overflow-y-auto mt-0.5">
              <SessionList
                sessions={sessions}
                activeSessionId={activeSessionId || null}
                onSwitchSession={onSwitchSession}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-[10px]">No sessions</p>
          )}
        </div>
        <div className="min-w-[140px]">
          <span className="text-gray-500 text-[10px] uppercase">Models</span>
          {availableModels ? (
            <div className="mt-0.5 space-y-0.5">
              {Object.entries(availableModels).slice(0, 2).map(([tier, models]) => (
                <div key={tier} className="text-[10px]">
                  <span className="text-gray-500 uppercase">{tier}: </span>
                  <span className="text-gray-300">
                    {models.slice(0, 2).map((m) => m.model.split('-').slice(-2).join('-')).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-[10px]">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoRibbon;
