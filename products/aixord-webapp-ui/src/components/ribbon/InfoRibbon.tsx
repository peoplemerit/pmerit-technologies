/**
 * InfoRibbon Component (Ribbon-Style Layout)
 *
 * Contains Project Info, Session Metrics, Session List, and Available Models
 * in a compact four-column layout.
 */

import type { ProjectSession } from '../../lib/api';
import { SessionList } from '../session/SessionList';

interface InfoRibbonProps {
  // Project
  projectName: string;
  objective: string;
  realityClassification: string;
  createdAt: string;

  // Session
  sessionNumber: number;
  sessionCost: number;
  sessionTokens: number;
  messageCount: number;
  avgLatencyMs?: number;

  // Models
  availableModels?: Record<string, Array<{ provider: string; model: string }>>;

  // Sessions (v4.4)
  sessions?: ProjectSession[];
  activeSessionId?: string | null;
  onSwitchSession?: (sessionId: string) => void;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

export function InfoRibbon({
  projectName,
  objective,
  realityClassification,
  createdAt,
  sessionNumber,
  sessionCost,
  sessionTokens,
  messageCount,
  avgLatencyMs,
  availableModels,
  sessions,
  activeSessionId,
  onSwitchSession,
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
            <span className="text-white text-sm">{projectName}</span>
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

      {/* Session Metrics */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Session #{sessionNumber}
        </h4>
        <div className="space-y-1.5">
          <div>
            <span className="text-gray-500 text-xs">Cost: </span>
            <span className="text-green-400 text-sm font-medium">${sessionCost.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Tokens: </span>
            <span className="text-white text-sm">{sessionTokens.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Messages: </span>
            <span className="text-white text-sm">{messageCount}</span>
          </div>
          {avgLatencyMs !== undefined && (
            <div>
              <span className="text-gray-500 text-xs">Avg Latency: </span>
              <span className="text-gray-300 text-xs">{(avgLatencyMs / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Sessions (v4.4) */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Sessions
        </h4>
        {sessions && onSwitchSession ? (
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
