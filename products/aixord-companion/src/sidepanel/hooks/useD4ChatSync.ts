/**
 * D4-CHAT Sync Hook
 *
 * Manages authentication and synchronization with D4-CHAT platform.
 * - Login/logout
 * - Project sync
 * - State sync
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type User, type Project, type ProjectState } from '../../lib/api';
import type { CompanionState, Phase, GateID, GateStatus } from '../../types';

const STORAGE_KEY_TOKEN = 'aixord_d4chat_token';
const STORAGE_KEY_USER = 'aixord_d4chat_user';
const STORAGE_KEY_PROJECT_ID = 'aixord_d4chat_project_id';

export interface D4ChatSyncState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  authError: string | null;

  // Sync
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedAt: string | null;

  // Linked project
  linkedProjectId: string | null;
  linkedProject: Project | null;
  remoteState: ProjectState | null;

  // Available projects
  projects: Project[];
}

export interface D4ChatSyncActions {
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Project linking
  linkProject: (projectId: string) => Promise<void>;
  unlinkProject: () => void;
  refreshProjects: () => Promise<void>;

  // Sync
  syncToRemote: (state: CompanionState) => Promise<void>;
  syncFromRemote: () => Promise<CompanionState | null>;

  // Create new project
  createAndLinkProject: (name: string, objective?: string) => Promise<void>;
}

export function useD4ChatSync(): [D4ChatSyncState, D4ChatSyncActions] {
  const [state, setState] = useState<D4ChatSyncState>({
    isAuthenticated: false,
    user: null,
    authLoading: true,
    authError: null,
    isSyncing: false,
    syncError: null,
    lastSyncedAt: null,
    linkedProjectId: null,
    linkedProject: null,
    remoteState: null,
    projects: [],
  });

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEY_TOKEN,
        STORAGE_KEY_USER,
        STORAGE_KEY_PROJECT_ID,
      ]);

      if (result[STORAGE_KEY_TOKEN] && result[STORAGE_KEY_USER]) {
        api.setToken(result[STORAGE_KEY_TOKEN]);

        // Verify token is still valid
        try {
          const user = await api.me();
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user,
            authLoading: false,
            linkedProjectId: result[STORAGE_KEY_PROJECT_ID] || null,
          }));

          // Load projects if authenticated
          await loadProjects();

          // Load linked project if exists
          if (result[STORAGE_KEY_PROJECT_ID]) {
            await loadLinkedProject(result[STORAGE_KEY_PROJECT_ID]);
          }
        } catch {
          // Token invalid, clear storage
          await chrome.storage.local.remove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
          api.setToken(null);
          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            authLoading: false,
          }));
        }
      } else {
        setState((prev) => ({ ...prev, authLoading: false }));
      }
    } catch (error) {
      console.error('[D4ChatSync] Error loading stored auth:', error);
      setState((prev) => ({ ...prev, authLoading: false }));
    }
  };

  const loadProjects = async () => {
    try {
      const { projects } = await api.listProjects();
      setState((prev) => ({ ...prev, projects }));
    } catch (error) {
      console.error('[D4ChatSync] Error loading projects:', error);
    }
  };

  const loadLinkedProject = async (projectId: string) => {
    try {
      const [project, remoteState] = await Promise.all([
        api.getProject(projectId),
        api.getState(projectId),
      ]);
      setState((prev) => ({
        ...prev,
        linkedProject: project,
        remoteState,
      }));
    } catch (error) {
      console.error('[D4ChatSync] Error loading linked project:', error);
      // Unlink if project not found
      setState((prev) => ({
        ...prev,
        linkedProjectId: null,
        linkedProject: null,
        remoteState: null,
      }));
      await chrome.storage.local.remove(STORAGE_KEY_PROJECT_ID);
    }
  };

  // Auth actions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, authLoading: true, authError: null }));

    try {
      const result = await api.login(email, password);

      // Store token and user
      await chrome.storage.local.set({
        [STORAGE_KEY_TOKEN]: result.token,
        [STORAGE_KEY_USER]: result.user,
      });

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: result.user,
        authLoading: false,
        authError: null,
      }));

      // Load projects after login
      await loadProjects();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        authLoading: false,
        authError: message,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }

    await chrome.storage.local.remove([
      STORAGE_KEY_TOKEN,
      STORAGE_KEY_USER,
      STORAGE_KEY_PROJECT_ID,
    ]);

    api.setToken(null);

    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      linkedProjectId: null,
      linkedProject: null,
      remoteState: null,
      projects: [],
    }));
  }, []);

  // Project linking
  const linkProject = useCallback(async (projectId: string) => {
    await chrome.storage.local.set({ [STORAGE_KEY_PROJECT_ID]: projectId });

    setState((prev) => ({ ...prev, linkedProjectId: projectId }));

    await loadLinkedProject(projectId);
  }, []);

  const unlinkProject = useCallback(() => {
    chrome.storage.local.remove(STORAGE_KEY_PROJECT_ID);

    setState((prev) => ({
      ...prev,
      linkedProjectId: null,
      linkedProject: null,
      remoteState: null,
    }));
  }, []);

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, []);

  const createAndLinkProject = useCallback(
    async (name: string, objective?: string) => {
      setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

      try {
        const project = await api.createProject({
          name,
          objective,
          reality_classification: 'GREENFIELD',
        });

        await linkProject(project.id);
        await loadProjects();

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create project';
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: message,
        }));
      }
    },
    [linkProject]
  );

  // Sync actions
  const syncToRemote = useCallback(
    async (companionState: CompanionState) => {
      if (!state.linkedProjectId) {
        throw new Error('No project linked');
      }

      setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

      try {
        // Convert companion state to remote format
        const gates: Record<string, boolean> = {};
        for (const [gateId, status] of Object.entries(companionState.session.gates)) {
          gates[gateId] = status === 'passed';
        }

        // Map phase
        const phaseMap: Record<Phase, string> = {
          BRAINSTORM: 'BRAINSTORM',
          PLAN: 'PLAN',
          EXECUTE: 'EXECUTE',
          REVIEW: 'REVIEW',
        };

        await api.updateState(state.linkedProjectId, {
          phase: phaseMap[companionState.session.phase],
          gates,
        });

        // Update project name/objective if set
        if (companionState.project) {
          await api.updateProject(state.linkedProjectId, {
            name: companionState.project.name,
            objective: companionState.project.description,
          });
        }

        // Reload remote state
        const remoteState = await api.getState(state.linkedProjectId);

        setState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          remoteState,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sync failed';
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          syncError: message,
        }));
        throw error;
      }
    },
    [state.linkedProjectId]
  );

  const syncFromRemote = useCallback(async (): Promise<CompanionState | null> => {
    if (!state.linkedProjectId) {
      return null;
    }

    setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const [project, remoteState] = await Promise.all([
        api.getProject(state.linkedProjectId),
        api.getState(state.linkedProjectId),
      ]);

      // Convert remote state to companion format
      const gates: Record<GateID, GateStatus> = {} as Record<GateID, GateStatus>;
      for (const [gateId, passed] of Object.entries(remoteState.gates || {})) {
        gates[gateId as GateID] = passed ? 'passed' : 'pending';
      }

      // Map phase
      const phaseMap: Record<string, Phase> = {
        BRAINSTORM: 'BRAINSTORM',
        PLAN: 'PLAN',
        EXECUTE: 'EXECUTE',
        REVIEW: 'REVIEW',
        B: 'BRAINSTORM',
        P: 'PLAN',
        E: 'EXECUTE',
        R: 'REVIEW',
      };

      const companionState: CompanionState = {
        project: {
          name: project.name,
          description: project.objective || '',
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        },
        session: {
          phase: phaseMap[remoteState.phase] || 'BRAINSTORM',
          gates,
          notes: '',
          promptTemplates: [],
        },
        lastSyncedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        linkedProject: project,
        remoteState,
      }));

      return companionState;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: message,
      }));
      return null;
    }
  }, [state.linkedProjectId]);

  const actions: D4ChatSyncActions = {
    login,
    logout,
    linkProject,
    unlinkProject,
    refreshProjects,
    createAndLinkProject,
    syncToRemote,
    syncFromRemote,
  };

  return [state, actions];
}
