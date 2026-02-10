/**
 * useAssignments Hook (HANDOFF-TDL-01 Task 4)
 *
 * Manages task assignments, escalations, standups, and task board state.
 * Provides CRUD + lifecycle operations for the Task Delegation Layer.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  assignmentsApi,
  type TaskAssignmentData,
  type EscalationData,
  type StandupData,
  type TaskBoardData,
} from '../lib/api';

interface UseAssignmentsOptions {
  projectId: string | null;
  token: string | null;
  sessionId?: string | null;
  autoFetch?: boolean;
}

interface UseAssignmentsReturn {
  // Data
  assignments: TaskAssignmentData[];
  escalations: EscalationData[];
  standups: StandupData[];
  taskBoard: TaskBoardData | null;
  isLoading: boolean;
  error: string | null;

  // Fetch
  fetchAssignments: (params?: { status?: string }) => Promise<void>;
  fetchEscalations: (params?: { status?: string }) => Promise<void>;
  fetchStandups: () => Promise<void>;
  fetchTaskBoard: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Assignment CRUD
  assign: (data: { deliverable_id: string; session_id?: string; priority?: string; authority_scope?: string[] }) => Promise<TaskAssignmentData | null>;
  updateAssignment: (assignmentId: string, data: { priority?: string; sort_order?: number }) => Promise<boolean>;
  removeAssignment: (assignmentId: string) => Promise<boolean>;

  // Assignment lifecycle
  startAssignment: (assignmentId: string) => Promise<boolean>;
  updateProgress: (assignmentId: string, data: { progress_percent: number; progress_notes?: string; completed_items?: string[]; remaining_items?: string[] }) => Promise<boolean>;
  submitAssignment: (assignmentId: string, data: { submission_summary: string; submission_evidence?: string[] }) => Promise<boolean>;
  acceptAssignment: (assignmentId: string, data?: { review_notes?: string }) => Promise<boolean>;
  rejectAssignment: (assignmentId: string, data: { review_notes: string }) => Promise<boolean>;
  blockAssignment: (assignmentId: string, data: { blocked_reason: string }) => Promise<boolean>;

  // Escalations
  createEscalation: (data: { assignment_id: string; decision_needed: string; options?: string[]; recommendation?: string; recommendation_rationale?: string }) => Promise<EscalationData | null>;
  resolveEscalation: (escalationId: string, data: { resolution: string }) => Promise<boolean>;

  // Standups
  postStandup: (data: { session_id: string; working_on: string; completed_since_last?: string[]; in_progress?: string[]; blocked?: string[]; next_actions?: string[]; estimate_to_completion?: string; message_number?: number }) => Promise<StandupData | null>;

  // Helpers
  clearError: () => void;
}

export function useAssignments({
  projectId,
  token,
  sessionId,
  autoFetch = true,
}: UseAssignmentsOptions): UseAssignmentsReturn {
  const [assignments, setAssignments] = useState<TaskAssignmentData[]>([]);
  const [escalations, setEscalations] = useState<EscalationData[]>([]);
  const [standups, setStandups] = useState<StandupData[]>([]);
  const [taskBoard, setTaskBoard] = useState<TaskBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Fetch operations ──

  const fetchAssignments = useCallback(async (params?: { status?: string }) => {
    if (!projectId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await assignmentsApi.list(projectId, token, {
        session_id: sessionId || undefined,
        ...params,
      });
      setAssignments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token, sessionId]);

  const fetchEscalations = useCallback(async (params?: { status?: string }) => {
    if (!projectId || !token) return;
    try {
      const result = await assignmentsApi.listEscalations(projectId, token, params);
      setEscalations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch escalations');
    }
  }, [projectId, token]);

  const fetchStandups = useCallback(async () => {
    if (!projectId || !token || !sessionId) return;
    try {
      const result = await assignmentsApi.listStandups(projectId, sessionId, token);
      setStandups(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch standups');
    }
  }, [projectId, token, sessionId]);

  const fetchTaskBoard = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const result = await assignmentsApi.getTaskBoard(projectId, token);
      setTaskBoard(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task board');
    }
  }, [projectId, token]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchAssignments(),
      fetchEscalations({ status: 'OPEN' }),
      fetchTaskBoard(),
      sessionId ? fetchStandups() : Promise.resolve(),
    ]);
  }, [fetchAssignments, fetchEscalations, fetchTaskBoard, fetchStandups, sessionId]);

  // ── Assignment CRUD ──

  const assign = useCallback(async (data: { deliverable_id: string; session_id?: string; priority?: string; authority_scope?: string[] }) => {
    if (!projectId || !token) return null;
    setError(null);
    try {
      const result = await assignmentsApi.assign(projectId, data, token);
      await fetchAssignments();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign deliverable');
      return null;
    }
  }, [projectId, token, fetchAssignments]);

  const updateAssignment = useCallback(async (assignmentId: string, data: { priority?: string; sort_order?: number }) => {
    if (!projectId || !token) return false;
    setError(null);
    try {
      await assignmentsApi.update(projectId, assignmentId, data as Partial<Pick<TaskAssignmentData, 'priority' | 'sort_order'>>, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  const removeAssignment = useCallback(async (assignmentId: string) => {
    if (!projectId || !token) return false;
    setError(null);
    try {
      await assignmentsApi.remove(projectId, assignmentId, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  // ── Lifecycle operations ──

  const startAssignment = useCallback(async (assignmentId: string) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.start(projectId, assignmentId, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  const updateProgress = useCallback(async (assignmentId: string, data: { progress_percent: number; progress_notes?: string; completed_items?: string[]; remaining_items?: string[] }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.progress(projectId, assignmentId, data, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  const submitAssignment = useCallback(async (assignmentId: string, data: { submission_summary: string; submission_evidence?: string[] }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.submit(projectId, assignmentId, data, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  const acceptAssignment = useCallback(async (assignmentId: string, data?: { review_notes?: string }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.accept(projectId, assignmentId, data || {}, token);
      await refreshAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept assignment');
      return false;
    }
  }, [projectId, token, refreshAll]);

  const rejectAssignment = useCallback(async (assignmentId: string, data: { review_notes: string }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.reject(projectId, assignmentId, data, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  const blockAssignment = useCallback(async (assignmentId: string, data: { blocked_reason: string }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.block(projectId, assignmentId, data, token);
      await fetchAssignments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block assignment');
      return false;
    }
  }, [projectId, token, fetchAssignments]);

  // ── Escalations ──

  const createEscalation = useCallback(async (data: { assignment_id: string; decision_needed: string; options?: string[]; recommendation?: string; recommendation_rationale?: string }) => {
    if (!projectId || !token) return null;
    try {
      const result = await assignmentsApi.createEscalation(projectId, data, token);
      await fetchEscalations({ status: 'OPEN' });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escalation');
      return null;
    }
  }, [projectId, token, fetchEscalations]);

  const resolveEscalation = useCallback(async (escalationId: string, data: { resolution: string }) => {
    if (!projectId || !token) return false;
    try {
      await assignmentsApi.resolveEscalation(projectId, escalationId, data, token);
      await Promise.all([fetchEscalations({ status: 'OPEN' }), fetchAssignments()]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve escalation');
      return false;
    }
  }, [projectId, token, fetchEscalations, fetchAssignments]);

  // ── Standups ──

  const postStandup = useCallback(async (data: { session_id: string; working_on: string; completed_since_last?: string[]; in_progress?: string[]; blocked?: string[]; next_actions?: string[]; estimate_to_completion?: string; message_number?: number }) => {
    if (!projectId || !token) return null;
    try {
      const result = await assignmentsApi.postStandup(projectId, data, token);
      await fetchStandups();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post standup');
      return null;
    }
  }, [projectId, token, fetchStandups]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && projectId && token) {
      refreshAll();
    }
  }, [autoFetch, projectId, token, refreshAll]);

  return {
    assignments,
    escalations,
    standups,
    taskBoard,
    isLoading,
    error,
    fetchAssignments,
    fetchEscalations,
    fetchStandups,
    fetchTaskBoard,
    refreshAll,
    assign,
    updateAssignment,
    removeAssignment,
    startAssignment,
    updateProgress,
    submitAssignment,
    acceptAssignment,
    rejectAssignment,
    blockAssignment,
    createEscalation,
    resolveEscalation,
    postStandup,
    clearError,
  };
}
