/**
 * InfoRibbon Component (Ribbon-Style Layout)
 *
 * Contains Project Info, Session Metrics, Session List, and Available Models
 * in a compact four-column layout.
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
    <div className="grid grid-cols-4 gap-6">
      {/* Project Info */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Project
        </h4>
        <div className="space-y-1.5">
          <div>
            <span className="text-gray-500 text-xs">Name: </span>
            {onUpdateProject ? (
              <span
                className="text-white text-sm cursor-pointer hover:text-violet-400 transition-colors"
                title="Click to edit"
                onClick={() => {
                  const newName = prompt('Project name:', projectName);
                  if (newName && newName !== projectName) onUpdateProject({ name: newName });
                }}
              >
                {projectName}
              </span>
            ) : (
              <span className="text-white text-sm">{projectName}</span>
            )}
          </div>
          <div>
            <span className="text-gray-500 text-xs">Objective: </span>
            <span className="text-gray-300 text-xs line-clamp-2">{objective || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Reality: </span>
            <span className="text-gray-300 text-xs capitalize">{realityClassification?.toLowerCase() || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Created: </span>
            <span className="text-gray-300 text-xs">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Session Metrics — D11: Uses backend metrics when available */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Session #{sessionNumber}
        </h4>
        <div className="space-y-1.5">
          <div>
            <span className="text-gray-500 text-xs">Cost: </span>
            <span className="text-green-400 text-sm font-medium">
              ${(sessionMetrics?.cost_usd ?? sessionCost).toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Tokens: </span>
            <span className="text-white text-sm">
              {(sessionMetrics?.tokens.total ?? sessionTokens).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Messages: </span>
            <span className="text-white text-sm">
              {sessionMetrics?.messages.total ?? messageCount}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Avg Latency: </span>
            <span className="text-gray-300 text-xs">
              {sessionMetrics?.avg_latency_ms
                ? `${(sessionMetrics.avg_latency_ms / 1000).toFixed(1)}s`
                : avgLatencyMs !== undefined
                  ? `${(avgLatencyMs / 1000).toFixed(1)}s`
                  : 'N/A'}
            </span>
          </div>
          {sessionMetrics?.model_usage && Object.keys(sessionMetrics.model_usage).length > 0 && (
            <div>
              <span className="text-gray-500 text-xs">Models: </span>
              <span className="text-gray-300 text-xs">
                {Object.entries(sessionMetrics.model_usage)
                  .map(([model, count]) => `${model.split('-').slice(-2).join('-')}(${count})`)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sessions (v4.4) with Session Graph */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Session Graph
        </h4>
        {sessions && onSwitchSession && projectId && token ? (
          <div className="max-h-[140px] overflow-y-auto">
            <SessionGraph
              projectId={projectId}
              token={token}
              sessions={sessions}
              activeSessionId={activeSessionId || null}
              onSwitchSession={onSwitchSession}
            />
          </div>
        ) : sessions && onSwitchSession ? (
          <div className="max-h-[120px] overflow-y-auto">
            <SessionList
              sessions={sessions}
              activeSessionId={activeSessionId || null}
              onSwitchSession={onSwitchSession}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-xs">No sessions</p>
        )}
      </div>

      {/* Available Models */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Models
        </h4>
        {availableModels ? (
          <div className="space-y-1">
            {Object.entries(availableModels).slice(0, 3).map(([tier, models]) => (
              <div key={tier}>
                <span className="text-gray-500 text-xs uppercase">{tier}: </span>
                <span className="text-gray-300 text-xs">
                  {models.slice(0, 2).map((m) => m.model.split('-').slice(-2).join('-')).join(', ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">Loading models...</p>
        )}
      </div>
    </div>
  );
}

export default InfoRibbon;
