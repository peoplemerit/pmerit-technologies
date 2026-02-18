/**
 * AIXORD Web App API Client - Evidence & Knowledge Management
 */

import { request } from './core';

// ============================================================================
// GitHub API (PATCH-GITHUB-01 + DUAL-MODE-01)
// ============================================================================

/**
 * GitHub connection mode (DUAL-MODE-01)
 * READ_ONLY:      Evidence sync only
 * WORKSPACE_SYNC: Full read-write (create repos, commit scaffold, push code)
 */
export type GitHubMode = 'READ_ONLY' | 'WORKSPACE_SYNC';

/**
 * GitHub connection status
 */
export interface GitHubConnection {
  project_id: string;
  connected: boolean;
  repo_owner: string | null;
  repo_name: string | null;
  scope: GitHubMode;
  github_mode: GitHubMode;
  connected_at: string | null;
  last_sync: string | null;
}

/**
 * Platform commit record (from github_commits table)
 */
export interface GitHubPlatformCommit {
  id: string;
  branch: string;
  commit_sha: string;
  tree_sha: string;
  message: string;
  files_count: number;
  committed_by: string;
  committed_at: string;
  pr_number: number | null;
  pr_url: string | null;
}

/**
 * GitHub evidence record
 */
export interface GitHubEvidenceRecord {
  id: string;
  evidence_type: 'COMMIT' | 'PR' | 'RELEASE' | 'CI_STATUS' | 'ISSUE' | 'MILESTONE';
  triad_category: 'PLANNED' | 'CLAIMED' | 'VERIFIED';
  ref_id: string;
  ref_url: string;
  title: string;
  author: string;
  evidence_timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'STALE' | 'UNAVAILABLE';
}

/**
 * Evidence grouped by triad category
 */
export interface EvidenceTriad {
  planned: GitHubEvidenceRecord[];
  claimed: GitHubEvidenceRecord[];
  verified: GitHubEvidenceRecord[];
}

/**
 * GitHub repository info
 */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  description: string | null;
  updated_at: string;
  url: string;
}

export const githubApi = {
  /**
   * Initiate GitHub OAuth connection (DUAL-MODE-01: mode-aware)
   * Returns authorization URL to redirect user
   */
  async connect(
    projectId: string,
    token: string,
    repoOwner?: string,
    repoName?: string,
    mode?: GitHubMode
  ): Promise<{ authorization_url: string; state: string; expires_in: number }> {
    return request<{ authorization_url: string; state: string; expires_in: number }>(
      '/github/connect',
      {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          repo_owner: repoOwner,
          repo_name: repoName,
          mode: mode || 'READ_ONLY',
        }),
      },
      token
    );
  },

  /**
   * Get GitHub connection status for a project
   */
  async getStatus(projectId: string, token: string): Promise<GitHubConnection> {
    return request<GitHubConnection>(`/github/status/${projectId}`, {}, token);
  },

  /**
   * Disconnect GitHub from a project
   */
  async disconnect(projectId: string, token: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/github/disconnect/${projectId}`, { method: 'DELETE' }, token);
  },

  /**
   * List repositories available to the user
   */
  async listRepos(projectId: string, token: string): Promise<{ repos: GitHubRepo[] }> {
    return request<{ repos: GitHubRepo[] }>(`/github/repos?project_id=${projectId}`, {}, token);
  },

  /**
   * Update the connected repository for a project
   */
  async selectRepo(
    projectId: string,
    repoOwner: string,
    repoName: string,
    token: string
  ): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/github/repo/${projectId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ repo_owner: repoOwner, repo_name: repoName }),
      },
      token
    );
  },

  /**
   * Switch GitHub mode (DUAL-MODE-01)
   * Upgrading READ_ONLY → WORKSPACE_SYNC returns requires_reauth=true
   */
  async switchMode(
    projectId: string,
    mode: GitHubMode,
    token: string
  ): Promise<{ success?: boolean; requires_reauth?: boolean; github_mode?: GitHubMode; message: string }> {
    return request<{ success?: boolean; requires_reauth?: boolean; github_mode?: GitHubMode; message: string }>(
      `/github/mode/${projectId}`,
      { method: 'PUT', body: JSON.stringify({ mode }) },
      token
    );
  },

  /**
   * Commit files to GitHub (WORKSPACE_SYNC only)
   * ENV-SYNC-01: Accepts optional scope_name for scope-level commit tracking
   */
  async commitFiles(
    projectId: string,
    files: Array<{ path: string; content: string }>,
    message: string,
    token: string,
    branch?: string,
    scopeName?: string
  ): Promise<{
    success: boolean;
    commit_sha: string;
    tree_sha: string;
    branch: string;
    files_committed: number;
    commit_url: string;
    pr_number?: number;
    pr_url?: string;
  }> {
    return request(`/github/commit/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ files, message, branch, scope_name: scopeName }),
    }, token);
  },

  /**
   * List platform-made commits
   */
  async getCommits(
    projectId: string,
    token: string,
    page = 1,
    perPage = 20
  ): Promise<{ commits: GitHubPlatformCommit[]; total: number; page: number; per_page: number }> {
    return request(`/github/commits/${projectId}?page=${page}&per_page=${perPage}`, {}, token);
  },

  /**
   * Create a new GitHub repository (WORKSPACE_SYNC only)
   */
  async createRepo(
    projectId: string,
    name: string,
    token: string,
    description?: string,
    isPrivate = true
  ): Promise<{ success: boolean; repo: { owner: string; name: string; full_name: string; html_url: string }; message: string }> {
    return request(`/github/create-repo/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ name, description, private: isPrivate }),
    }, token);
  },

  /**
   * Fetch recursive file tree from GitHub repository (GITHUB-SYNC-01)
   * Uses GET /github/tree/:projectId endpoint added in FIX-GITHUB-READ-01
   */
  async getTree(
    projectId: string,
    token: string,
    depth = 6
  ): Promise<{
    repo: string;
    ref: string;
    sha: string;
    entries: Array<{ path: string; type: 'file' | 'dir'; size?: number }>;
    total: number;
    shown: number;
    truncated_by_github: boolean;
  }> {
    return request(`/github/tree/${projectId}?ref=HEAD&depth=${depth}`, {}, token);
  },

  /**
   * Fetch a single file's content from GitHub repository (GITHUB-SYNC-01)
   * Uses GET /github/file/:projectId endpoint added in FIX-GITHUB-READ-01
   */
  async getFile(
    projectId: string,
    path: string,
    token: string,
    ref = 'HEAD'
  ): Promise<{
    path: string;
    repo: string;
    ref: string;
    content: string;
    size: number;
    truncated: boolean;
  }> {
    return request(
      `/github/file/${projectId}?path=${encodeURIComponent(path)}&ref=${encodeURIComponent(ref)}`,
      {},
      token
    );
  },
};

// ============================================================================
// Evidence API (PATCH-GITHUB-01)
// ============================================================================

export const evidenceApi = {
  /**
   * Trigger evidence sync from GitHub
   */
  async sync(projectId: string, token: string, sessionId?: string): Promise<{
    project_id: string;
    synced_at: string;
    total_fetched: number;
    by_type: Record<string, number>;
    by_triad: Record<string, number>;
    errors: string[];
  }> {
    return request<{
      project_id: string;
      synced_at: string;
      total_fetched: number;
      by_type: Record<string, number>;
      by_triad: Record<string, number>;
      errors: string[];
    }>(`/evidence/sync/${projectId}`, {
      method: 'POST',
      ...(sessionId && { body: JSON.stringify({ session_id: sessionId }) }),
    }, token);
  },

  /**
   * Get all evidence for a project
   */
  async list(projectId: string, token: string): Promise<{
    project_id: string;
    total: number;
    evidence: GitHubEvidenceRecord[];
  }> {
    return request<{
      project_id: string;
      total: number;
      evidence: GitHubEvidenceRecord[];
    }>(`/evidence/${projectId}`, {}, token);
  },

  /**
   * Get evidence grouped by triad category
   */
  async getTriad(projectId: string, token: string): Promise<{
    project_id: string;
    connection: { repo_owner: string | null; repo_name: string | null; last_sync: string | null } | null;
    counts: { planned: number; claimed: number; verified: number; total: number };
    triad: EvidenceTriad;
  }> {
    return request<{
      project_id: string;
      connection: { repo_owner: string | null; repo_name: string | null; last_sync: string | null } | null;
      counts: { planned: number; claimed: number; verified: number; total: number };
      triad: EvidenceTriad;
    }>(`/evidence/${projectId}/triad`, {}, token);
  },
};

// ============================================================================
// Knowledge Artifacts API (GKDL-01)
// ============================================================================

/**
 * Knowledge artifact types per AIXORD v4.3 GKDL-01
 * Sessions = evidence, Artifacts = authoritative
 */
export type KnowledgeArtifactType =
  | 'FAQ_REFERENCE'
  | 'SYSTEM_OPERATION_MANUAL'
  | 'SYSTEM_DIAGNOSTICS_GUIDE'
  | 'CONSOLIDATED_SESSION_REFERENCE'
  | 'DEFINITION_OF_DONE';

/**
 * Artifact status per GKDL-01
 * AI-derived = DRAFT until Director approves
 */
export type ArtifactStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SUPERSEDED';

/**
 * Knowledge artifact derivation source
 */
export type DerivationSource = 'MANUAL' | 'AI_DERIVED' | 'EXTRACTED' | 'IMPORTED';

/**
 * Knowledge Artifact Record
 * Per L-GKDL1: Derived knowledge is governed
 * Per L-GKDL5: AI-derived = DRAFT until approved
 */
export interface KnowledgeArtifact {
  id: string;
  projectId: string;
  type: KnowledgeArtifactType;
  title: string;
  version: number;
  content: string;
  summary?: string;
  derivationSource: DerivationSource;
  sourceSessionIds?: string[];
  sourceArtifactIds?: string[];
  status: ArtifactStatus;
  approvedBy?: string;
  approvedAt?: string;
  authorityLevel: number;
  supersedes?: string;
  supersededBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend knowledge artifact response type (snake_case from D1 database)
 */
interface BackendKnowledgeArtifact {
  id: string;
  project_id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  summary?: string;
  derivation_source: string;
  source_session_ids?: string;
  source_artifact_ids?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  authority_level: number;
  supersedes?: string;
  superseded_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform backend knowledge artifact to frontend format
 */
function transformKnowledgeArtifact(raw: BackendKnowledgeArtifact): KnowledgeArtifact {
  return {
    id: raw.id,
    projectId: raw.project_id,
    type: raw.type as KnowledgeArtifactType,
    title: raw.title,
    version: raw.version,
    content: raw.content,
    summary: raw.summary,
    derivationSource: raw.derivation_source as DerivationSource,
    sourceSessionIds: raw.source_session_ids ? JSON.parse(raw.source_session_ids) : undefined,
    sourceArtifactIds: raw.source_artifact_ids ? JSON.parse(raw.source_artifact_ids) : undefined,
    status: raw.status as ArtifactStatus,
    approvedBy: raw.approved_by,
    approvedAt: raw.approved_at,
    authorityLevel: raw.authority_level,
    supersedes: raw.supersedes,
    supersededBy: raw.superseded_by,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Authority levels per artifact type (for UI display)
 */
export const ARTIFACT_AUTHORITY_LEVELS: Record<KnowledgeArtifactType, number> = {
  CONSOLIDATED_SESSION_REFERENCE: 100,
  DEFINITION_OF_DONE: 80,
  SYSTEM_OPERATION_MANUAL: 60,
  SYSTEM_DIAGNOSTICS_GUIDE: 40,
  FAQ_REFERENCE: 20,
};

/**
 * Human-readable artifact type labels
 */
export const ARTIFACT_TYPE_LABELS: Record<KnowledgeArtifactType, string> = {
  FAQ_REFERENCE: 'FAQ Reference',
  SYSTEM_OPERATION_MANUAL: 'System Operation Manual',
  SYSTEM_DIAGNOSTICS_GUIDE: 'System Diagnostics Guide',
  CONSOLIDATED_SESSION_REFERENCE: 'Consolidated Session Reference (CSR)',
  DEFINITION_OF_DONE: 'Definition of Done',
};

/**
 * Human-readable status labels
 */
export const ARTIFACT_STATUS_LABELS: Record<ArtifactStatus, string> = {
  DRAFT: 'Draft',
  REVIEW: 'In Review',
  APPROVED: 'Approved',
  SUPERSEDED: 'Superseded',
};

export const knowledgeApi = {
  /**
   * List all knowledge artifacts for a project
   */
  async list(
    projectId: string,
    token: string,
    filters?: { type?: KnowledgeArtifactType; status?: ArtifactStatus }
  ): Promise<{ artifacts: KnowledgeArtifact[]; total: number }> {
    let endpoint = `/projects/${projectId}/knowledge`;
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await request<{ artifacts: BackendKnowledgeArtifact[]; total: number }>(
      endpoint,
      {},
      token
    );
    return {
      artifacts: response.artifacts.map(transformKnowledgeArtifact),
      total: response.total,
    };
  },

  /**
   * Get a specific knowledge artifact
   */
  async get(projectId: string, artifactId: string, token: string): Promise<KnowledgeArtifact> {
    const response = await request<BackendKnowledgeArtifact>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      {},
      token
    );
    return transformKnowledgeArtifact(response);
  },

  /**
   * Create a new knowledge artifact
   */
  async create(
    projectId: string,
    data: {
      type: KnowledgeArtifactType;
      title: string;
      content: string;
      summary?: string;
      derivationSource?: DerivationSource;
      sourceSessionIds?: string[];
      sourceArtifactIds?: string[];
    },
    token: string
  ): Promise<{
    id: string;
    type: KnowledgeArtifactType;
    title: string;
    version: number;
    status: ArtifactStatus;
    authorityLevel: number;
    createdAt: string;
  }> {
    const backendData = {
      type: data.type,
      title: data.title,
      content: data.content,
      summary: data.summary,
      derivation_source: data.derivationSource || 'MANUAL',
      source_session_ids: data.sourceSessionIds,
      source_artifact_ids: data.sourceArtifactIds,
    };
    const response = await request<{
      id: string;
      type: string;
      title: string;
      version: number;
      status: string;
      authority_level: number;
      created_at: string;
    }>(
      `/projects/${projectId}/knowledge`,
      {
        method: 'POST',
        body: JSON.stringify(backendData),
      },
      token
    );
    return {
      id: response.id,
      type: response.type as KnowledgeArtifactType,
      title: response.title,
      version: response.version,
      status: response.status as ArtifactStatus,
      authorityLevel: response.authority_level,
      createdAt: response.created_at,
    };
  },

  /**
   * Update a knowledge artifact
   */
  async update(
    projectId: string,
    artifactId: string,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      status?: ArtifactStatus;
    },
    token: string
  ): Promise<{ id: string; version: number; updatedAt: string }> {
    const response = await request<{ id: string; version: number; updated_at: string }>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
    return {
      id: response.id,
      version: response.version,
      updatedAt: response.updated_at,
    };
  },

  /**
   * Delete (supersede) a knowledge artifact
   */
  async delete(
    projectId: string,
    artifactId: string,
    token: string
  ): Promise<{ success: boolean; status: 'SUPERSEDED' }> {
    return request<{ success: boolean; status: 'SUPERSEDED' }>(
      `/projects/${projectId}/knowledge/${artifactId}`,
      { method: 'DELETE' },
      token
    );
  },

  /**
   * Approve a knowledge artifact (L-GKDL5)
   */
  async approve(
    projectId: string,
    artifactId: string,
    token: string
  ): Promise<{
    id: string;
    status: 'APPROVED';
    approvedBy: string;
    approvedAt: string;
  }> {
    const response = await request<{
      id: string;
      status: string;
      approved_by: string;
      approved_at: string;
    }>(
      `/projects/${projectId}/knowledge/${artifactId}/approve`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      status: 'APPROVED',
      approvedBy: response.approved_by,
      approvedAt: response.approved_at,
    };
  },

  /**
   * Generate a Consolidated Session Reference (CSR)
   * Per L-GCP6: Required for 10+ sessions
   */
  async generateCSR(
    projectId: string,
    token: string
  ): Promise<{
    id: string;
    type: 'CONSOLIDATED_SESSION_REFERENCE';
    title: string;
    status: 'DRAFT';
    sessionCount: number;
    message: string;
  }> {
    const response = await request<{
      id: string;
      type: string;
      title: string;
      status: string;
      session_count: number;
      message: string;
    }>(
      `/projects/${projectId}/knowledge/generate-csr`,
      { method: 'POST' },
      token
    );
    return {
      id: response.id,
      type: 'CONSOLIDATED_SESSION_REFERENCE',
      title: response.title,
      status: 'DRAFT',
      sessionCount: response.session_count,
      message: response.message,
    };
  },
};
