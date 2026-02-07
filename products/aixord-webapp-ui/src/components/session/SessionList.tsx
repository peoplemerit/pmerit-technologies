/**
 * SessionList — AIXORD v4.4 Session Graph Model
 *
 * Compact list of sessions with status badges.
 * Used in the Info ribbon for session switching.
 */

import type { ProjectSession } from '../../lib/api';

interface SessionListProps {
  sessions: ProjectSession[];
  activeSessionId: string | null;
  onSwitchSession: (sessionId: string) => void;
}

const typeColors: Record<string, string> = {
  DISCOVER: 'bg-cyan-500/20 text-cyan-400',
  BRAINSTORM: 'bg-blue-500/20 text-blue-400',
  BLUEPRINT: 'bg-amber-500/20 text-amber-400',
  EXECUTE: 'bg-green-500/20 text-green-400',
  AUDIT: 'bg-purple-500/20 text-purple-400',
  VERIFY_LOCK: 'bg-red-500/20 text-red-400',
};

const statusIcons: Record<string, string> = {
  ACTIVE: '●',
  CLOSED: '○',
  ARCHIVED: '◌',
};

export function SessionList({ sessions, activeSessionId, onSwitchSession }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-gray-500 text-xs text-center py-2">
        No sessions yet. Click &quot;+ New Session&quot; to start.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sessions.map(session => (
        <button
          key={session.id}
          onClick={() => onSwitchSession(session.id)}
          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
            session.id === activeSessionId
              ? 'bg-violet-500/15 border border-violet-500/30 text-white'
              : 'hover:bg-gray-800/50 text-gray-400 border border-transparent'
          }`}
        >
          <span className={`text-xs ${session.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-600'}`}>
            {statusIcons[session.status] || '●'}
          </span>
          <span className="text-xs font-medium">S{session.session_number}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[session.session_type] || 'bg-gray-500/20 text-gray-400'}`}>
            {session.session_type}
          </span>
          <span className="text-[10px] text-gray-600 ml-auto">
            {session.message_count} msgs
          </span>
        </button>
      ))}
    </div>
  );
}

export default SessionList;
