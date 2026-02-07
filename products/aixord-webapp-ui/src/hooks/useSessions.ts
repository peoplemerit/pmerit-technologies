/**
 * useSessions Hook — AIXORD v4.4 Session Graph Model
 *
 * Manages session lifecycle: list, create, switch, close.
 * Provides the active session and session list for the project.
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type ProjectSession, type SessionType, type EdgeType } from '../lib/api';

interface UseSessionsOptions {
  projectId: string | null;
  token: string | null;
  userId: string | null;
}

interface UseSessionsReturn {
  sessions: ProjectSession[];
  activeSession: ProjectSession | null;
  isLoading: boolean;
  error: string | null;
  createSession: (opts?: {
    sessionType?: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => Promise<ProjectSession | null>;
  switchSession: (sessionId: string) => void;
  closeSession: (sessionId: string, summary?: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
}

export function useSessions({ projectId, token, userId: _userId }: UseSessionsOptions): UseSessionsReturn {
  void _userId; // Will be used in Phase E for session creation attribution
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!projectId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.sessions.list(projectId, token);
      setSessions(data);

      // Auto-select the active session (latest ACTIVE, or latest overall)
      const active = data.find(s => s.status === 'ACTIVE');
      if (active && !activeSessionId) {
        setActiveSessionId(active.id);
      } else if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[data.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token, activeSessionId]);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(async (opts?: {
    sessionType?: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => {
    if (!projectId || !token) return null;
    try {
      const newSession = await api.sessions.create(projectId, {
        session_type: opts?.sessionType || 'BRAINSTORM',
        parent_session_id: opts?.parentSessionId,
        edge_type: opts?.edgeType,
      }, token);

      setSessions(prev => [...prev, newSession]);
      setActiveSessionId(newSession.id);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  }, [projectId, token]);

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const closeSession = useCallback(async (sessionId: string, summary?: string) => {
    if (!projectId || !token) return;
    try {
      await api.sessions.update(projectId, sessionId, {
        status: 'CLOSED',
        summary,
      }, token);

      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, status: 'CLOSED' as const, closed_at: new Date().toISOString() }
          : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
    }
  }, [projectId, token]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSession,
    isLoading,
    error,
    createSession,
    switchSession,
    closeSession,
    fetchSessions,
  };
}
