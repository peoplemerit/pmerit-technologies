/**
 * Evidence Fetch Service (HANDOFF-D4-GITHUB-EVIDENCE)
 *
 * Fetches evidence from GitHub and maps to Reconciliation Triad.
 * Evidence INFORMS the triad - it never overrides user decisions.
 *
 * Triad Mapping Rules:
 * - Issues/Milestones → PLANNED (what was planned)
 * - PRs/Commits → CLAIMED (what was done)
 * - Releases/CI → VERIFIED (what was confirmed)
 */

import type {
  Env,
  EvidenceType,
  EvidenceStatus,
  TriadCategory,
  EvidenceSyncResult,
  GitHubEvidenceRecord
} from '../types';

// =============================================================================
// EVIDENCE TYPE → TRIAD MAPPING
// =============================================================================

const EVIDENCE_TO_TRIAD: Record<EvidenceType, TriadCategory> = {
  'ISSUE': 'PLANNED',
  'MILESTONE': 'PLANNED',
  'COMMIT': 'CLAIMED',
  'PR': 'CLAIMED',
  'RELEASE': 'VERIFIED',
  'CI_STATUS': 'VERIFIED'
};

// Evidence staleness thresholds (in hours)
const STALENESS_THRESHOLDS: Record<EvidenceType, number> = {
  'COMMIT': 1,        // Commits are fairly stable
  'PR': 0.5,          // PRs can change frequently
  'RELEASE': 24,      // Releases are stable
  'CI_STATUS': 0.25,  // CI status changes rapidly
  'ISSUE': 1,         // Issues can be updated
  'MILESTONE': 4      // Milestones change less often
};

// =============================================================================
// GITHUB API HELPERS
// =============================================================================

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author?: { login: string } | null;
}

interface GitHubPR {
  number: number;
  title: string;
  state: string;
  user: { login: string };
  created_at: string;
  merged_at: string | null;
  html_url: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  author: { login: string };
  published_at: string;
  html_url: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  user: { login: string };
  created_at: string;
  html_url: string;
  pull_request?: unknown;  // Present if this is a PR
}

interface GitHubMilestone {
  number: number;
  title: string;
  state: string;
  creator: { login: string };
  created_at: string;
  due_on: string | null;
  html_url: string;
}

/**
 * Fetch data from GitHub API with proper headers
 */
async function fetchGitHub<T>(
  endpoint: string,
  accessToken: string
): Promise<T | null> {
  try {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AIXORD-Platform'
      }
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} for ${endpoint}`);
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`GitHub fetch error for ${endpoint}:`, error);
    return null;
  }
}

// =============================================================================
// ENCRYPTION HELPERS (duplicated from github.ts for service isolation)
// =============================================================================

async function decryptToken(encryptedToken: string, key: string): Promise<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );

  return decoder.decode(decrypted);
}

// =============================================================================
// EVIDENCE FETCH SERVICE
// =============================================================================

/**
 * Calculate stale_after timestamp for an evidence type
 */
function calculateStaleAfter(evidenceType: EvidenceType): string {
  const hours = STALENESS_THRESHOLDS[evidenceType];
  const staleAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return staleAt.toISOString();
}

/**
 * Fetch and sync all evidence for a project
 */
export async function syncProjectEvidence(
  projectId: string,
  db: D1Database,
  encryptionKey: string
): Promise<EvidenceSyncResult> {
  const errors: string[] = [];
  const byType: Record<EvidenceType, number> = {
    'COMMIT': 0, 'PR': 0, 'RELEASE': 0, 'CI_STATUS': 0, 'ISSUE': 0, 'MILESTONE': 0
  };
  const byTriad: Record<TriadCategory, number> = {
    'PLANNED': 0, 'CLAIMED': 0, 'VERIFIED': 0
  };

  try {
    // Get connection details
    const connection = await db.prepare(`
      SELECT repo_owner, repo_name, access_token_encrypted
      FROM github_connections
      WHERE project_id = ?
    `).bind(projectId).first<{
      repo_owner: string;
      repo_name: string;
      access_token_encrypted: string;
    }>();

    if (!connection) {
      return {
        project_id: projectId,
        synced_at: new Date().toISOString(),
        total_fetched: 0,
        by_type: byType,
        by_triad: byTriad,
        errors: ['No GitHub connection found for project']
      };
    }

    if (connection.repo_owner === 'PENDING' || connection.repo_name === 'PENDING') {
      return {
        project_id: projectId,
        synced_at: new Date().toISOString(),
        total_fetched: 0,
        by_type: byType,
        by_triad: byTriad,
        errors: ['Repository not selected yet']
      };
    }

    // Decrypt access token
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);
    const repoPath = `${connection.repo_owner}/${connection.repo_name}`;

    // Fetch evidence in parallel
    const [commits, prs, releases, issues, milestones] = await Promise.all([
      fetchGitHub<GitHubCommit[]>(`/repos/${repoPath}/commits?per_page=30`, accessToken),
      fetchGitHub<GitHubPR[]>(`/repos/${repoPath}/pulls?state=all&per_page=30`, accessToken),
      fetchGitHub<GitHubRelease[]>(`/repos/${repoPath}/releases?per_page=20`, accessToken),
      fetchGitHub<GitHubIssue[]>(`/repos/${repoPath}/issues?state=all&per_page=30`, accessToken),
      fetchGitHub<GitHubMilestone[]>(`/repos/${repoPath}/milestones?state=all&per_page=20`, accessToken)
    ]);

    const now = new Date().toISOString();

    // Process commits → CLAIMED
    if (commits) {
      for (const commit of commits) {
        await upsertEvidence(db, {
          project_id: projectId,
          evidence_type: 'COMMIT',
          triad_category: 'CLAIMED',
          ref_id: commit.sha,
          ref_url: commit.html_url,
          title: commit.commit.message.split('\n')[0].slice(0, 200),
          author: commit.author?.login || commit.commit.author.name,
          evidence_timestamp: commit.commit.author.date,
          stale_after: calculateStaleAfter('COMMIT'),
          updated_at: now
        });
        byType['COMMIT']++;
        byTriad['CLAIMED']++;
      }
    } else {
      errors.push('Failed to fetch commits');
    }

    // Process PRs → CLAIMED
    if (prs) {
      for (const pr of prs) {
        await upsertEvidence(db, {
          project_id: projectId,
          evidence_type: 'PR',
          triad_category: 'CLAIMED',
          ref_id: String(pr.number),
          ref_url: pr.html_url,
          title: pr.title.slice(0, 200),
          author: pr.user.login,
          evidence_timestamp: pr.merged_at || pr.created_at,
          stale_after: calculateStaleAfter('PR'),
          updated_at: now
        });
        byType['PR']++;
        byTriad['CLAIMED']++;
      }
    } else {
      errors.push('Failed to fetch PRs');
    }

    // Process releases → VERIFIED
    if (releases) {
      for (const release of releases) {
        await upsertEvidence(db, {
          project_id: projectId,
          evidence_type: 'RELEASE',
          triad_category: 'VERIFIED',
          ref_id: release.tag_name,
          ref_url: release.html_url,
          title: release.name || release.tag_name,
          author: release.author.login,
          evidence_timestamp: release.published_at,
          stale_after: calculateStaleAfter('RELEASE'),
          updated_at: now
        });
        byType['RELEASE']++;
        byTriad['VERIFIED']++;
      }
    } else {
      errors.push('Failed to fetch releases');
    }

    // Process issues (filter out PRs) → PLANNED
    if (issues) {
      for (const issue of issues) {
        // Skip if this is actually a PR (GitHub returns PRs in issues endpoint)
        if (issue.pull_request) continue;

        await upsertEvidence(db, {
          project_id: projectId,
          evidence_type: 'ISSUE',
          triad_category: 'PLANNED',
          ref_id: String(issue.number),
          ref_url: issue.html_url,
          title: issue.title.slice(0, 200),
          author: issue.user.login,
          evidence_timestamp: issue.created_at,
          stale_after: calculateStaleAfter('ISSUE'),
          updated_at: now
        });
        byType['ISSUE']++;
        byTriad['PLANNED']++;
      }
    } else {
      errors.push('Failed to fetch issues');
    }

    // Process milestones → PLANNED
    if (milestones) {
      for (const milestone of milestones) {
        await upsertEvidence(db, {
          project_id: projectId,
          evidence_type: 'MILESTONE',
          triad_category: 'PLANNED',
          ref_id: String(milestone.number),
          ref_url: milestone.html_url,
          title: milestone.title.slice(0, 200),
          author: milestone.creator.login,
          evidence_timestamp: milestone.created_at,
          stale_after: calculateStaleAfter('MILESTONE'),
          updated_at: now
        });
        byType['MILESTONE']++;
        byTriad['PLANNED']++;
      }
    } else {
      errors.push('Failed to fetch milestones');
    }

    // Update last_sync timestamp
    await db.prepare(
      'UPDATE github_connections SET last_sync = ? WHERE project_id = ?'
    ).bind(now, projectId).run();

    const totalFetched = Object.values(byType).reduce((a, b) => a + b, 0);

    console.log(`[EvidenceSync] Synced ${totalFetched} evidence items for project ${projectId}`);

    return {
      project_id: projectId,
      synced_at: now,
      total_fetched: totalFetched,
      by_type: byType,
      by_triad: byTriad,
      errors
    };

  } catch (error) {
    console.error('Evidence sync error:', error);
    return {
      project_id: projectId,
      synced_at: new Date().toISOString(),
      total_fetched: 0,
      by_type: byType,
      by_triad: byTriad,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Upsert a single evidence record
 */
async function upsertEvidence(
  db: D1Database,
  evidence: {
    project_id: string;
    evidence_type: EvidenceType;
    triad_category: TriadCategory;
    ref_id: string;
    ref_url: string;
    title: string;
    author: string;
    evidence_timestamp: string;
    stale_after: string;
    updated_at: string;
  }
): Promise<void> {
  await db.prepare(`
    INSERT INTO github_evidence (
      project_id, source, evidence_type, triad_category, ref_id, ref_url,
      status, stale_after, title, author, evidence_timestamp, updated_at
    ) VALUES (?, 'GITHUB', ?, ?, ?, ?, 'VERIFIED', ?, ?, ?, ?, ?)
    ON CONFLICT(project_id, source, evidence_type, ref_id) DO UPDATE SET
      title = excluded.title,
      author = excluded.author,
      evidence_timestamp = excluded.evidence_timestamp,
      stale_after = excluded.stale_after,
      status = 'VERIFIED',
      verified_at = datetime('now'),
      updated_at = excluded.updated_at
  `).bind(
    evidence.project_id,
    evidence.evidence_type,
    evidence.triad_category,
    evidence.ref_id,
    evidence.ref_url,
    evidence.stale_after,
    evidence.title,
    evidence.author,
    evidence.evidence_timestamp,
    evidence.updated_at
  ).run();
}

/**
 * Get evidence for a project, grouped by triad category
 */
export async function getProjectEvidence(
  projectId: string,
  db: D1Database
): Promise<{
  planned: GitHubEvidenceRecord[];
  claimed: GitHubEvidenceRecord[];
  verified: GitHubEvidenceRecord[];
}> {
  const result = await db.prepare(`
    SELECT * FROM github_evidence
    WHERE project_id = ?
    ORDER BY evidence_timestamp DESC
  `).bind(projectId).all<{
    id: number;
    project_id: string;
    source: string;
    evidence_type: EvidenceType;
    triad_category: TriadCategory;
    ref_id: string;
    ref_url: string;
    status: EvidenceStatus;
    verified_at: string | null;
    stale_after: string;
    title: string;
    author: string;
    evidence_timestamp: string;
    deliverable_id: string | null;
    created_at: string;
    updated_at: string;
  }>();

  const planned: GitHubEvidenceRecord[] = [];
  const claimed: GitHubEvidenceRecord[] = [];
  const verified: GitHubEvidenceRecord[] = [];

  for (const row of result.results) {
    const record: GitHubEvidenceRecord = {
      id: String(row.id),
      project_id: row.project_id,
      source: 'GITHUB',
      repo_owner: '',  // Not stored per-record, get from connection
      repo_name: '',
      evidence_type: row.evidence_type,
      ref_id: row.ref_id,
      ref_url: row.ref_url,
      triad_category: row.triad_category,
      status: row.status,
      verified_at: row.verified_at,
      stale_after: row.stale_after,
      title: row.title,
      author: row.author,
      timestamp: row.evidence_timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    switch (row.triad_category) {
      case 'PLANNED':
        planned.push(record);
        break;
      case 'CLAIMED':
        claimed.push(record);
        break;
      case 'VERIFIED':
        verified.push(record);
        break;
    }
  }

  return { planned, claimed, verified };
}

/**
 * Check if evidence is stale and needs refresh
 */
export async function getStaleEvidence(
  projectId: string,
  db: D1Database
): Promise<GitHubEvidenceRecord[]> {
  const result = await db.prepare(`
    SELECT * FROM github_evidence
    WHERE project_id = ? AND stale_after < datetime('now')
    ORDER BY stale_after ASC
    LIMIT 100
  `).bind(projectId).all();

  return result.results as unknown as GitHubEvidenceRecord[];
}

/**
 * Mark evidence as stale (needs re-fetch)
 */
export async function markEvidenceStale(
  evidenceId: string,
  db: D1Database
): Promise<void> {
  await db.prepare(
    'UPDATE github_evidence SET status = ? WHERE id = ?'
  ).bind('STALE', evidenceId).run();
}
