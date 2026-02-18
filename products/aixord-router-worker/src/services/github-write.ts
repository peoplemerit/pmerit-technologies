/**
 * GitHub Write Service (DUAL-MODE-01)
 *
 * Atomic multi-file commits via GitHub Git Trees API.
 * Works from Cloudflare Workers — no git binary needed.
 *
 * Workflow:
 * 1. Get default branch HEAD ref
 * 2. Create/get feature branch (`aixord/{slug}`)
 * 3. Create blobs for each file
 * 4. Create tree from blobs
 * 5. Create commit with tree + parent
 * 6. Update branch ref to new commit
 * 7. (Optional) Create pull request
 *
 * Safety:
 * - ALL writes go to `aixord/*` feature branch, NEVER to main/master
 * - Auto-creates branch from default branch HEAD if it doesn't exist
 */

import { log } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface CommitFile {
  path: string;
  content: string;
}

export interface CommitResult {
  success: boolean;
  commit_sha: string;
  tree_sha: string;
  branch: string;
  files_committed: number;
  commit_url: string;
  pr_number?: number;
  pr_url?: string;
}

interface GitHubRef {
  ref: string;
  object: { sha: string; type: string };
}

interface GitHubBlob {
  sha: string;
  url: string;
}

interface GitHubTree {
  sha: string;
  url: string;
}

interface GitHubCommitObj {
  sha: string;
  html_url: string;
  message: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  owner: { login: string };
  html_url: string;
  default_branch: string;
}

interface GitHubPR {
  number: number;
  html_url: string;
}

// =============================================================================
// GITHUB API HELPER (mirrors evidence-fetch.ts pattern)
// =============================================================================

class GitHubApiError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

/**
 * Make an authenticated GitHub API request.
 * Supports GET, POST, PATCH methods with JSON body.
 */
async function githubApi<T>(
  method: string,
  endpoint: string,
  accessToken: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'AIXORD-Platform',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    log.error('github_write_api_error', { method, endpoint, status: response.status });
    throw new GitHubApiError(response.status, endpoint, `GitHub API ${method} ${endpoint} failed: ${response.status} — ${text.slice(0, 200)}`);
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json() as T;
}

// =============================================================================
// CORE: ATOMIC MULTI-FILE COMMIT
// =============================================================================

/**
 * Commit multiple files to a GitHub repository atomically.
 * Uses the Git Trees API: create blobs → create tree → create commit → update ref.
 *
 * @param accessToken  - Decrypted GitHub OAuth token
 * @param owner        - Repository owner
 * @param repo         - Repository name
 * @param branch       - Target branch (must start with `aixord/`)
 * @param files        - Files to commit
 * @param message      - Commit message
 * @param createPR     - Whether to create a PR after commit (default: true for initial commits)
 */
export async function commitFilesToGitHub(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
  files: CommitFile[],
  message: string,
  createPR = true
): Promise<CommitResult> {
  // Safety: enforce feature branch pattern
  if (!branch.startsWith('aixord/')) {
    throw new Error(`Safety: branch must start with 'aixord/'. Got: ${branch}`);
  }

  if (files.length === 0) {
    throw new Error('No files to commit');
  }

  const repoPath = `${owner}/${repo}`;

  // Step 1: Get default branch HEAD
  const repoInfo = await githubApi<GitHubRepo>('GET', `/repos/${repoPath}`, accessToken);
  const defaultBranch = repoInfo.default_branch;

  const defaultRef = await githubApi<GitHubRef>(
    'GET',
    `/repos/${repoPath}/git/ref/heads/${defaultBranch}`,
    accessToken
  );
  const baseSha = defaultRef.object.sha;

  // Step 2: Create or get feature branch
  let branchSha = baseSha;
  let branchIsNew = false;
  try {
    const existingRef = await githubApi<GitHubRef>(
      'GET',
      `/repos/${repoPath}/git/ref/heads/${branch}`,
      accessToken
    );
    branchSha = existingRef.object.sha;
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) {
      // Branch doesn't exist — create from default branch HEAD
      const newRef = await githubApi<GitHubRef>(
        'POST',
        `/repos/${repoPath}/git/refs`,
        accessToken,
        { ref: `refs/heads/${branch}`, sha: baseSha }
      );
      branchSha = newRef.object.sha;
      branchIsNew = true;
      log.info('github_branch_created', { repo: repoPath, branch });
    } else {
      throw err;
    }
  }

  // Step 3: Create blobs for each file
  const blobShas: Array<{ path: string; sha: string }> = [];
  for (const file of files) {
    const blob = await githubApi<GitHubBlob>(
      'POST',
      `/repos/${repoPath}/git/blobs`,
      accessToken,
      {
        content: file.content,
        encoding: 'utf-8',
      }
    );
    blobShas.push({ path: file.path, sha: blob.sha });
  }

  // Step 4: Create tree from blobs
  const tree = await githubApi<GitHubTree>(
    'POST',
    `/repos/${repoPath}/git/trees`,
    accessToken,
    {
      base_tree: branchSha,
      tree: blobShas.map(({ path, sha }) => ({
        path,
        mode: '100644',  // Regular file
        type: 'blob',
        sha,
      })),
    }
  );

  // Step 5: Create commit
  const commit = await githubApi<GitHubCommitObj>(
    'POST',
    `/repos/${repoPath}/git/commits`,
    accessToken,
    {
      message,
      tree: tree.sha,
      parents: [branchSha],
    }
  );

  // Step 6: Update branch ref to point to new commit
  await githubApi<GitHubRef>(
    'PATCH',
    `/repos/${repoPath}/git/refs/heads/${branch}`,
    accessToken,
    { sha: commit.sha }
  );

  log.info('github_commit_success', {
    repo: repoPath,
    branch,
    sha: commit.sha,
    files: files.length,
  });

  // Step 7: Create PR if this is a new branch
  let prNumber: number | undefined;
  let prUrl: string | undefined;

  if (createPR && branchIsNew) {
    try {
      const pr = await githubApi<GitHubPR>(
        'POST',
        `/repos/${repoPath}/pulls`,
        accessToken,
        {
          title: message,
          head: branch,
          base: defaultBranch,
          body: `## AIXORD Platform Commit\n\nThis PR was created by the AIXORD platform.\n\n**Files:** ${files.length}\n**Branch:** \`${branch}\`\n\n---\n*Auto-generated by D4-CHAT Workspace Sync*`,
          draft: true,
        }
      );
      prNumber = pr.number;
      prUrl = pr.html_url;
      log.info('github_pr_created', { repo: repoPath, pr: pr.number });
    } catch (prErr) {
      // PR creation is best-effort — don't fail the commit
      log.warn('github_pr_creation_failed', {
        error: prErr instanceof Error ? prErr.message : String(prErr),
      });
    }
  }

  return {
    success: true,
    commit_sha: commit.sha,
    tree_sha: tree.sha,
    branch,
    files_committed: files.length,
    commit_url: commit.html_url,
    pr_number: prNumber,
    pr_url: prUrl,
  };
}

// =============================================================================
// CREATE REPOSITORY
// =============================================================================

/**
 * Create a new GitHub repository.
 * Uses POST /user/repos for personal repos.
 */
export async function createGitHubRepo(
  accessToken: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<{ owner: string; name: string; full_name: string; html_url: string }> {
  const repo = await githubApi<GitHubRepo>(
    'POST',
    '/user/repos',
    accessToken,
    {
      name,
      description: description || `AIXORD managed project: ${name}`,
      private: isPrivate,
      auto_init: true,  // Create with README so we have a default branch
      gitignore_template: 'Node',
    }
  );

  log.info('github_repo_created', { repo: repo.full_name, private: isPrivate });

  return {
    owner: repo.owner.login,
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
  };
}
