/**
 * Artifact Persistence API
 *
 * Handles artifact commits, evidence tracking, and persistence verification.
 */

import { request } from './core';

export interface ArtifactToCommit {
  type: 'STATE' | 'HANDOFF' | 'BLUEPRINT' | 'ARTIFACT' | 'AUDIT' | 'SCAFFOLD' | 'GOVERNANCE';
  path: string; // Relative to workspace root
  content: string;
}

export interface ArtifactCommitRequest {
  project_id: string;
  session_id?: string | null;
  artifacts: ArtifactToCommit[];
}

export interface FileEvidence {
  path: string;
  size_bytes: number;
  sha256: string;
}

export interface ArtifactCommitEvidence {
  commit_id: string;
  timestamp: string;
  files_written: FileEvidence[];
  workspace_binding_id: string;
}

export interface ArtifactCommitRecord extends ArtifactCommitEvidence {
  id: string;
  project_id: string;
  session_id: string | null;
  committed_at: string;
}

/**
 * Commit artifacts to the workspace with evidence tracking
 */
async function commit(data: ArtifactCommitRequest): Promise<ArtifactCommitEvidence> {
  return request<ArtifactCommitEvidence>(`/artifacts/commit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get artifact commit history for a project
 */
async function getCommits(projectId: string): Promise<ArtifactCommitRecord[]> {
  return request<ArtifactCommitRecord[]>(`/artifacts/commits/${projectId}`);
}

/**
 * Get last artifact commit for a project
 */
async function getLastCommit(projectId: string): Promise<ArtifactCommitRecord | null> {
  const commits = await getCommits(projectId);
  return commits.length > 0 ? commits[0] : null;
}

export const artifactsApi = {
  commit,
  getCommits,
  getLastCommit,
};
