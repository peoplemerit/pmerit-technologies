/**
 * Project Page
 *
 * Individual project view with state management.
 */

import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectState, useProjects } from '../hooks/useApi';
import { GateTracker } from '../components/GateTracker';
import { PhaseSelector } from '../components/PhaseSelector';

export function Project() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { projects } = useProjects(token);
  const {
    state,
    isLoading,
    error,
    passGate,
    setPhase,
    incrementSession,
  } = useProjectState(id || null, token);

  const project = projects.find((p) => p.id === id);

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl text-white mb-4">Project not found</h1>
          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handlePassGate = async (gateId: string) => {
    try {
      await passGate(gateId);
    } catch (err) {
      console.error('Failed to pass gate:', err);
    }
  };

  const handleSetPhase = async (phase: string) => {
    try {
      await setPhase(phase);
    } catch (err) {
      console.error('Failed to set phase:', err);
    }
  };

  const handleIncrementSession = async () => {
    try {
      await incrementSession();
    } catch (err) {
      console.error('Failed to increment session:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Projects
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">{project?.name || 'Loading...'}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{project?.name || 'Project'}</h1>
            {project && (
              <p className="text-gray-400 mt-1">{project.objective}</p>
            )}
          </div>

          {state && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-gray-500 text-sm">Session</span>
                <div className="text-2xl font-bold text-white">#{state.session.number}</div>
              </div>
              <button
                onClick={handleIncrementSession}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                New Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && !state && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {/* State Content */}
      {state && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phase Selector */}
            <PhaseSelector
              currentPhase={state.session.phase}
              onSetPhase={handleSetPhase}
              isLoading={isLoading}
            />

            {/* Gate Tracker */}
            <GateTracker
              gates={state.gates}
              onPassGate={handlePassGate}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>

              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 text-sm">Objective</span>
                  <p className="text-white">{state.project.objective}</p>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Reality Classification</span>
                  <p className="text-white capitalize">{state.reality.class.toLowerCase()}</p>
                </div>

                {state.reality.constraints.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-sm">Constraints</span>
                    <ul className="text-white text-sm mt-1 space-y-1">
                      {state.reality.constraints.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Session Info</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Session Number</span>
                  <span className="text-white">{state.session.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Messages</span>
                  <span className="text-white">{state.session.messageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="text-white">
                    {new Date(state.session.startedAt).toLocaleString()}
                  </span>
                </div>
                {state.session.lastCheckpoint && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Checkpoint</span>
                    <span className="text-white">
                      {new Date(state.session.lastCheckpoint).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                  onClick={() => {/* TODO: Implement */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Decisions
                </button>
                <button
                  className="w-full px-4 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                  onClick={() => {/* TODO: Implement */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Artifacts
                </button>
                <button
                  className="w-full px-4 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                  onClick={() => {/* TODO: Implement */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;
