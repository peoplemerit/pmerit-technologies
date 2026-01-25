/**
 * API Hooks for AIXORD Web App
 *
 * React hooks for interacting with the D4 API.
 * Note: useAuth has been moved to contexts/AuthContext.tsx
 */

import { useState, useEffect, useCallback } from 'react';
import { api, APIError, type Project, type AIXORDState } from '../lib/api';

// ============================================================================
// Projects Hook
// ============================================================================

export function useProjects(token: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.projects.list(token);
      setProjects(data);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (data: {
      name: string;
      objective: string;
      realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
    }) => {
      if (!token) throw new Error('Not authenticated');
      const project = await api.projects.create(data, token);
      setProjects((p) => [...p, project]);
      return project;
    },
    [token]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Not authenticated');
      await api.projects.delete(id, token);
      setProjects((p) => p.filter((proj) => proj.id !== id));
    },
    [token]
  );

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  };
}

// ============================================================================
// Project State Hook
// ============================================================================

export function useProjectState(projectId: string | null, token: string | null) {
  const [state, setState] = useState<AIXORDState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    if (!projectId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.state.get(projectId, token);
      setState(data);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to fetch state');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const passGate = useCallback(
    async (gateId: string) => {
      if (!projectId || !token) throw new Error('Not authenticated');
      const newState = await api.state.passGate(projectId, gateId, token);
      setState(newState);
      return newState;
    },
    [projectId, token]
  );

  const setPhase = useCallback(
    async (phase: string) => {
      if (!projectId || !token) throw new Error('Not authenticated');
      const newState = await api.state.setPhase(projectId, phase, token);
      setState(newState);
      return newState;
    },
    [projectId, token]
  );

  const incrementSession = useCallback(async () => {
    if (!projectId || !token) throw new Error('Not authenticated');
    const newState = await api.state.incrementSession(projectId, token);
    setState(newState);
    return newState;
  }, [projectId, token]);

  return {
    state,
    isLoading,
    error,
    fetchState,
    passGate,
    setPhase,
    incrementSession,
  };
}
