/**
 * SessionGraph Component (Bridge: sessionsApi.getGraph + createEdge)
 *
 * Displays session dependency graph as a simple visual timeline
 * with edges between sessions.
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type ProjectSession, type EdgeType } from '../../lib/api';

interface SessionEdge {
  id: string;
  from_session_id: string;
  to_session_id: string;
  edge_type: EdgeType;
  created_at: string;
}

interface SessionGraphProps {
  projectId: string;
  token: string;
  sessions: ProjectSession[];
  activeSessionId: string | null;
  onSwitchSession: (sessionId: string) => void;
}

const EDGE_COLORS: Record<EdgeType, string> = {
  CONTINUES: 'text-blue-400',
  DERIVES: 'text-violet-400',
  SUPERSEDES: 'text-amber-400',
  FORKS: 'text-green-400',
  RECONCILES: 'text-cyan-400',
};

const EDGE_LABELS: Record<EdgeType, string> = {
  CONTINUES: 'Continues',
  DERIVES: 'Derives',
  SUPERSEDES: 'Supersedes',
  FORKS: 'Forks',
  RECONCILES: 'Reconciles',
};

export function SessionGraph({
  projectId,
  token,
  sessions,
  activeSessionId,
  onSwitchSession,
}: SessionGraphProps) {
  const [edges, setEdges] = useState<SessionEdge[]>([]);
  const [showCreateEdge, setShowCreateEdge] = useState(false);
  const [newEdge, setNewEdge] = useState({ fromId: '', toId: '', type: 'CONTINUES' as EdgeType });

  const fetchGraph = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      const graph = await api.sessions.getGraph(projectId, activeSessionId, token);
      setEdges([...(graph.outgoing || []), ...(graph.incoming || [])]);
    } catch {
      // Non-critical
    }
  }, [projectId, activeSessionId, token]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleCreateEdge = async () => {
    if (!newEdge.fromId || !newEdge.toId) return;
    try {
      await api.sessions.createEdge(projectId, newEdge.fromId, {
        to_session_id: newEdge.toId,
        edge_type: newEdge.type,
      }, token);
      setShowCreateEdge(false);
      setNewEdge({ fromId: '', toId: '', type: 'CONTINUES' });
      await fetchGraph();
    } catch (err) {
      console.error('Failed to create edge:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Session nodes */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {sessions.map((session, idx) => {
          const isActive = session.id === activeSessionId;
          return (
            <div key={session.id} className="flex items-center">
              <button
                onClick={() => onSwitchSession(session.id)}
                className={`flex flex-col items-center px-2 py-1 rounded-lg text-xs transition-colors min-w-[48px] ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : session.status === 'CLOSED'
                    ? 'bg-gray-700/50 text-gray-500'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">S{session.session_number}</span>
                <span className="text-[10px] opacity-70">{session.session_type?.slice(0, 3)}</span>
              </button>
              {idx < sessions.length - 1 && (
                <div className="w-4 h-0.5 bg-gray-600 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Edges for current session */}
      {edges.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Edges:</span>
          {edges.map((edge) => {
            const fromSession = sessions.find(s => s.id === edge.from_session_id);
            const toSession = sessions.find(s => s.id === edge.to_session_id);
            return (
              <div key={edge.id} className="flex items-center gap-1 text-xs">
                <span className="text-gray-400">S{fromSession?.session_number || '?'}</span>
                <span className={EDGE_COLORS[edge.edge_type]}>
                  {EDGE_LABELS[edge.edge_type]}
                </span>
                <span className="text-gray-400">S{toSession?.session_number || '?'}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Create edge */}
      {showCreateEdge ? (
        <div className="space-y-2 p-2 bg-gray-800/50 rounded border border-gray-700/50">
          <div className="flex gap-2">
            <select
              value={newEdge.fromId}
              onChange={(e) => setNewEdge(prev => ({ ...prev, fromId: e.target.value }))}
              className="flex-1 px-1.5 py-1 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            >
              <option value="">From...</option>
              {sessions.map(s => <option key={s.id} value={s.id}>S{s.session_number}</option>)}
            </select>
            <select
              value={newEdge.type}
              onChange={(e) => setNewEdge(prev => ({ ...prev, type: e.target.value as EdgeType }))}
              className="px-1.5 py-1 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            >
              {(Object.keys(EDGE_LABELS) as EdgeType[]).map(t => (
                <option key={t} value={t}>{EDGE_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={newEdge.toId}
              onChange={(e) => setNewEdge(prev => ({ ...prev, toId: e.target.value }))}
              className="flex-1 px-1.5 py-1 bg-gray-900/50 border border-gray-700 rounded text-xs text-white"
            >
              <option value="">To...</option>
              {sessions.map(s => <option key={s.id} value={s.id}>S{s.session_number}</option>)}
            </select>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowCreateEdge(false)} className="px-2 py-1 text-xs text-gray-400 border border-gray-700 rounded">Cancel</button>
            <button onClick={handleCreateEdge} disabled={!newEdge.fromId || !newEdge.toId} className="px-2 py-1 text-xs bg-violet-600 text-white rounded disabled:opacity-50">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateEdge(true)}
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          + Add Edge
        </button>
      )}
    </div>
  );
}

export default SessionGraph;
