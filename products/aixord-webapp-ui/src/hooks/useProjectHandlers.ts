/**
 * useProjectHandlers Hook
 * 
 * Non-chat handler functions for project interactions:
 * - Tab navigation
 * - Phase transitions
 * - Gate toggles
 * - GitHub/CCS/workspace operations
 */

import { useCallback } from 'react';
import { api, type CredentialType, type ExposureSource } from '../lib/api';

interface UseProjectHandlersOptions {
  projectId: string | null;
  token: string | null;
  activeSession: { id: string; session_number: number } | null;
  toggleGate: (gateId: string, value: boolean) => Promise<void>;
  setPhase: (phase: string, opts?: {
    reassess_reason?: string;
    review_summary?: string;
  }) => Promise<void>;
  onRefetchEvidence: () => void;
  onRefetchImages: () => void;
  onRefetchCCSStatus: () => void;
}

export function useProjectHandlers({
  projectId,
  token,
  activeSession,
  toggleGate,
  setPhase,
  onRefetchEvidence,
  onRefetchImages,
  onRefetchCCSStatus,
}: UseProjectHandlersOptions) {

  const handleToggleGate = useCallback(async (gateId: string, currentValue: boolean) => {
    try {
      await toggleGate(gateId, !currentValue);
    } catch (err) {
      console.error('Failed to toggle gate:', err);
    }
  }, [toggleGate]);

  const handleSetPhase = useCallback(async (
    phase: string,
    opts?: { reassess_reason?: string; review_summary?: string }
  ) => {
    try {
      await setPhase(phase, opts);
    } catch (err) {
      console.error('Failed to set phase:', err);
      throw err; // Re-throw for parent to handle UI errors
    }
  }, [setPhase]);

  const handleGitHubConnect = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const result = await api.github.connect(projectId, token);
      if (result.authorization_url) window.location.href = result.authorization_url;
    } catch (err) {
      console.error('GitHub connect failed:', err);
    }
  }, [projectId, token]);

  const handleGitHubDisconnect = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      await api.github.disconnect(projectId, token);
      return true;
    } catch (err) {
      console.error('GitHub disconnect failed:', err);
      return false;
    }
  }, [projectId, token]);

  const handleGitHubSelectRepo = useCallback(async (repoOwner: string, repoName: string) => {
    if (!projectId || !token) return;
    try {
      await api.github.selectRepo(projectId, repoOwner, repoName, token);
      onRefetchEvidence();
      return true;
    } catch (err) {
      console.error('Failed to select repo:', err);
      return false;
    }
  }, [projectId, token, onRefetchEvidence]);

  const handleEvidenceSync = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      await api.evidence.sync(projectId, token, activeSession?.id);
      onRefetchEvidence();
      onRefetchImages();
    } catch (err) {
      console.error('Evidence sync failed:', err);
    }
  }, [projectId, token, activeSession, onRefetchEvidence, onRefetchImages]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (!projectId || !token) return;
    try {
      await api.images.delete(projectId, imageId, token);
      onRefetchImages();
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }, [projectId, token, onRefetchImages]);

  const handleClearMessages = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      await api.messages.clear(projectId, token);
      return true;
    } catch (err) {
      console.error('Failed to clear messages:', err);
      return false;
    }
  }, [projectId, token]);

  const handleUpdateProject = useCallback(async (data: { name?: string; objective?: string }) => {
    if (!projectId || !token) return;
    try {
      const updated = await api.projects.update(projectId, data, token);
      return updated;
    } catch (err) {
      console.error('Failed to update project:', err);
      return null;
    }
  }, [projectId, token]);

  const handleCreateCCSIncident = useCallback(async (data: {
    credentialType: CredentialType;
    credentialName: string;
    exposureSource: ExposureSource;
    exposureDescription: string;
    impactAssessment: string;
    affectedSystems?: string[];
  }) => {
    if (!projectId || !token) return;
    try {
      await api.ccs.createIncident(projectId, data, token);
      onRefetchCCSStatus();
      return true;
    } catch (err) {
      console.error('Failed to create CCS incident:', err);
      return false;
    }
  }, [projectId, token, onRefetchCCSStatus]);

  const handleWorkspaceComplete = useCallback(async (binding: {
    folder_name: string | null;
    folder_template: string | null;
    permission_level: 'read' | 'readwrite';
    scaffold_generated: boolean;
    github_connected: boolean;
    github_repo: string | null;
    binding_confirmed: boolean;
    // Scaffold count reporting (S1-T1)
    scaffold_item_count?: number;
    scaffold_skipped_count?: number;
    scaffold_error_count?: number;
    // ENV-SYNC-01: Push metadata
    github_push_count?: number;
    github_push_sha?: string;
    github_push_branch?: string;
  }) => {
    if (!projectId || !token) return;
    try {
      // Save binding to backend (convert null to undefined for API compatibility)
      await api.workspace.updateBinding(projectId, {
        folder_name: binding.folder_name ?? undefined,
        folder_template: binding.folder_template ?? undefined,
        permission_level: binding.permission_level,
        scaffold_generated: binding.scaffold_generated,
        github_connected: binding.github_connected,
        github_repo: binding.github_repo ?? undefined,
        binding_confirmed: binding.binding_confirmed,
        // S1-T1: Forward scaffold counts to backend
        scaffold_item_count: binding.scaffold_item_count,
        scaffold_skipped_count: binding.scaffold_skipped_count,
        scaffold_error_count: binding.scaffold_error_count,
        // ENV-SYNC-01: Include push metadata if scaffold was pushed to GitHub
        github_push_count: binding.github_push_count,
        github_push_sha: binding.github_push_sha,
        github_push_branch: binding.github_push_branch,
      }, token);

      // Toggle GA:ENV and GA:FLD gates
      if (binding.folder_name) {
        await toggleGate('GA:FLD', true);
      }
      if (binding.binding_confirmed) {
        await toggleGate('GA:ENV', true);
      }

      return true;
    } catch (err) {
      console.error('Workspace setup failed:', err);
      return false;
    }
  }, [projectId, token, toggleGate]);

  return {
    handleToggleGate,
    handleSetPhase,
    handleGitHubConnect,
    handleGitHubDisconnect,
    handleGitHubSelectRepo,
    handleEvidenceSync,
    handleDeleteImage,
    handleClearMessages,
    handleUpdateProject,
    handleCreateCCSIncident,
    handleWorkspaceComplete,
  };
}
