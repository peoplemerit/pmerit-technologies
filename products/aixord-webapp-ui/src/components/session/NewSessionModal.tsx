/**
 * NewSessionModal — AIXORD v4.4 Session Graph Model
 *
 * Modal for creating a new session with type selection,
 * optional parent session, and edge type.
 */

import { useState } from 'react';
import type { ProjectSession, SessionType, EdgeType } from '../../lib/api';

interface NewSessionModalProps {
  currentSession: ProjectSession | null;
  sessions: ProjectSession[];
  onConfirm: (opts: {
    sessionType: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => void;
  onCancel: () => void;
}

const SESSION_TYPES: { value: SessionType; label: string; description: string; icon: string }[] = [
  { value: 'DISCOVER', label: 'Discover', description: 'Explore problem space', icon: '🔍' },
  { value: 'BRAINSTORM', label: 'Brainstorm', description: 'Generate ideas and solutions', icon: '💡' },
  { value: 'BLUEPRINT', label: 'Blueprint', description: 'Design architecture and plan', icon: '📐' },
  { value: 'EXECUTE', label: 'Execute', description: 'Implement the solution', icon: '⚡' },
  { value: 'AUDIT', label: 'Audit', description: 'Review and verify work', icon: '🔎' },
  { value: 'VERIFY_LOCK', label: 'Verify & Lock', description: 'Final verification and sign-off', icon: '🔒' },
];

const EDGE_TYPES: { value: EdgeType; label: string; description: string }[] = [
  { value: 'CONTINUES', label: 'Continues', description: 'Direct continuation of previous session' },
  { value: 'DERIVES', label: 'Derives', description: 'Based on insights from previous session' },
  { value: 'SUPERSEDES', label: 'Supersedes', description: 'Replaces a previous session approach' },
  { value: 'FORKS', label: 'Forks', description: 'Explores an alternative path' },
  { value: 'RECONCILES', label: 'Reconciles', description: 'Merges multiple session outcomes' },
];

export function NewSessionModal({ currentSession, sessions: _sessions, onConfirm, onCancel }: NewSessionModalProps) {
  void _sessions; // Reserved for future session graph visualization
  const [sessionType, setSessionType] = useState<SessionType>('BRAINSTORM');
  const [linkToParent, setLinkToParent] = useState(!!currentSession);
  const [edgeType, setEdgeType] = useState<EdgeType>('CONTINUES');

  const handleConfirm = () => {
    onConfirm({
      sessionType,
      parentSessionId: linkToParent && currentSession ? currentSession.id : undefined,
      edgeType: linkToParent && currentSession ? edgeType : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-1">Start New Session</h3>
        <p className="text-gray-400 text-sm mb-4">
          {currentSession
            ? `Current: Session ${currentSession.session_number} (${currentSession.session_type})`
            : 'Create the first session for this project'}
        </p>

        {/* Session Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Session Type</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_TYPES.map(st => (
              <button
                key={st.value}
                onClick={() => setSessionType(st.value)}
                className={`text-left p-2.5 rounded-lg border transition-colors ${
                  sessionType === st.value
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{st.icon}</span>
                  <span className="text-sm font-medium">{st.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 ml-7">{st.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Link to Parent Session */}
        {currentSession && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={linkToParent}
                onChange={(e) => setLinkToParent(e.target.checked)}
                className="rounded border-gray-600 bg-gray-900 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-300">
                Link to Session {currentSession.session_number}
              </span>
            </label>
          </div>
        )}

        {/* Edge Type Selection */}
        {linkToParent && currentSession && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Relationship</label>
            <div className="space-y-1.5">
              {EDGE_TYPES.map(et => (
                <button
                  key={et.value}
                  onClick={() => setEdgeType(et.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    edgeType === et.value
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium">{et.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{et.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewSessionModal;
