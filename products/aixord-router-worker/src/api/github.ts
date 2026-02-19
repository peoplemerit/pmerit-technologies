/**
 * GitHub API (HANDOFF-D4-GITHUB-EVIDENCE + DUAL-MODE-01)
 *
 * OAuth integration for GitHub evidence + optional workspace sync.
 * Evidence augments the Reconciliation Triad - it INFORMS, never overrides.
 *
 * Two modes:
 * - READ_ONLY:      Evidence sync only (commits, PRs, releases → triad)
 * - WORKSPACE_SYNC: Full read-write (create repos, commit scaffold, push code)
 *
 * Endpoints:
 * - POST   /api/v1/github/connect             - Initiate OAuth flow (mode-aware)
 * - GET    /api/v1/github/callback            - OAuth callback handler
 * - GET    /api/v1/github/status/:projectId   - Get connection status
 * - DELETE /api/v1/github/disconnect/:projectId - Remove connection
 * - GET    /api/v1/github/repos               - List user's repos
 * - PUT    /api/v1/github/repo/:projectId     - Select repo
 * - PUT    /api/v1/github/mode/:projectId     - Switch mode
 * - POST   /api/v1/github/commit/:projectId   - Commit files (WORKSPACE_SYNC)
 * - GET    /api/v1/github/commits/:projectId  - List platform commits
 * - POST   /api/v1/github/create-repo/:projectId - Create new repo (WORKSPACE_SYNC)
 */

import { Hono } from 'hono';
import type { Env, GitHubConnection, GitHubMode } from '../types';
import { requireAuth } from '../middleware/requireAuth';
import { encryptAESGCM, decryptAESGCM } from '../utils/crypto';
import { log } from '../utils/logger';

// =============================================================================
// MODE-DEPENDENT OAUTH SCOPES (DUAL-MODE-01)
// =============================================================================

/** OAuth scopes per GitHub mode */
const GITHUB_SCOPES: Record<GitHubMode, string[]> = {
  'READ_ONLY': ['repo:status', 'read:org', 'public_repo'],
  'WORKSPACE_SYNC': ['repo', 'read:org'],   // 'repo' grants full read-write
};

/** Validate mode string */
function parseGitHubMode(mode?: string): GitHubMode {
  if (mode === 'WORKSPACE_SYNC') return 'WORKSPACE_SYNC';
  return 'READ_ONLY';
}

const github = new Hono<{ Bindings: Env }>();

// Auth on all routes EXCEPT /callback (GitHub redirects there without a Bearer token)
github.use('/*', async (c, next) => {
  if (c.req.path.endsWith('/callback')) {
    return next();
  }
  return requireAuth(c, next);
});

// =============================================================================
// ENCRYPTION HELPERS (delegates to shared utils/crypto.ts)
// =============================================================================

/** Encrypt a token for storage — delegates to shared AES-GCM utility */
async function encryptToken(token: string, key: string): Promise<string> {
  return encryptAESGCM(token, key);
}

/** Decrypt a stored token — delegates to shared AES-GCM utility */
async function decryptToken(encryptedToken: string, key: string): Promise<string> {
  return decryptAESGCM(encryptedToken, key);
}

// =============================================================================
// OAUTH ENDPOINTS
// =============================================================================

/**
 * POST /api/v1/github/connect
 *
 * Initiates GitHub OAuth flow for a project.
 * Returns the authorization URL to redirect the user to.
 *
 * Body: { project_id: string, repo_owner?: string, repo_name?: string }
 */
github.post('/connect', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json<{
      project_id: string;
      repo_owner?: string;
      repo_name?: string;
      mode?: string;   // 'READ_ONLY' | 'WORKSPACE_SYNC'
    }>();

    const { project_id, repo_owner, repo_name } = body;
    const mode = parseGitHubMode(body.mode);

    if (!project_id) {
      return c.json({ error: 'project_id required' }, 400);
    }

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(project_id, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Verify GitHub OAuth is configured
    if (!c.env.GITHUB_CLIENT_ID || !c.env.GITHUB_CLIENT_SECRET) {
      return c.json({ error: 'GitHub OAuth not configured' }, 500);
    }

    // Generate state token for CSRF protection
    const state = crypto.randomUUID();
    const stateData = JSON.stringify({
      project_id,
      user_id: userId,
      repo_owner: repo_owner || null,
      repo_name: repo_name || null,
      github_mode: mode,
      created_at: new Date().toISOString()
    });

    // Store state in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      'INSERT INTO oauth_states (state, data, expires_at) VALUES (?, ?, ?)'
    ).bind(state, stateData, expiresAt).run();

    // Build authorization URL — scopes depend on requested mode
    const scopes = GITHUB_SCOPES[mode].join(' ');
    const redirectUri = c.env.GITHUB_REDIRECT_URI || 'https://aixord-router.pmerit.workers.dev/api/v1/github/callback';

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', c.env.GITHUB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);

    return c.json({
      authorization_url: authUrl.toString(),
      state,
      expires_in: 600 // 10 minutes
    });

  } catch (error) {
    log.error('github_connect_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to initiate GitHub connection',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

/**
 * GET /api/v1/github/callback
 *
 * OAuth callback handler. Exchanges code for access token.
 * This is typically called by the frontend after GitHub redirect.
 *
 * Query: code, state
 */
github.get('/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const state = c.req.query('state');

    if (!code || !state) {
      return c.json({ error: 'Missing code or state parameter' }, 400);
    }

    // Verify and retrieve state
    const stateRecord = await c.env.DB.prepare(
      'SELECT data FROM oauth_states WHERE state = ? AND expires_at > datetime("now")'
    ).bind(state).first<{ data: string }>();

    if (!stateRecord) {
      return c.json({ error: 'Invalid or expired state' }, 400);
    }

    // Parse state data
    const stateData = JSON.parse(stateRecord.data) as {
      project_id: string;
      user_id: string;
      repo_owner: string | null;
      repo_name: string | null;
      github_mode?: string;
    };
    const mode = parseGitHubMode(stateData.github_mode);

    // Delete used state
    await c.env.DB.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run();

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: c.env.GITHUB_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      log.error('github_token_exchange_failed', { error: tokenData.error });
      return c.json({
        error: 'Failed to exchange code for token',
        detail: tokenData.error_description || tokenData.error
      }, 400);
    }

    // Encrypt the access token for storage — fail-closed if secret not configured
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error', error_code: 'CONFIG_MISSING' }, 500);
    }
    const encryptedToken = await encryptToken(tokenData.access_token, encryptionKey);

    // If repo not specified, we'll need to prompt user to select one
    // For now, store connection without specific repo
    const now = new Date().toISOString();

    // UPGRADE-UX-01: Check if this is a mode upgrade (existing READ_ONLY → WORKSPACE_SYNC)
    const existingConnection = await c.env.DB.prepare(
      'SELECT github_mode, repo_owner, repo_name FROM github_connections WHERE project_id = ?'
    ).bind(stateData.project_id).first<{ github_mode: string; repo_owner: string; repo_name: string }>();

    const isUpgrade = existingConnection
      && existingConnection.github_mode === 'READ_ONLY'
      && mode === 'WORKSPACE_SYNC';

    // Upsert connection (one connection per project) — includes mode
    // On upgrade: preserve existing repo_owner/repo_name instead of resetting to PENDING
    const repoOwner = isUpgrade ? existingConnection.repo_owner : (stateData.repo_owner || 'PENDING');
    const repoName = isUpgrade ? existingConnection.repo_name : (stateData.repo_name || 'PENDING');

    await c.env.DB.prepare(`
      INSERT INTO github_connections (project_id, user_id, repo_owner, repo_name, access_token_encrypted, scope, github_mode, connected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        user_id = excluded.user_id,
        repo_owner = excluded.repo_owner,
        repo_name = excluded.repo_name,
        access_token_encrypted = excluded.access_token_encrypted,
        scope = excluded.scope,
        github_mode = excluded.github_mode,
        connected_at = excluded.connected_at
    `).bind(
      stateData.project_id,
      stateData.user_id,
      repoOwner,
      repoName,
      encryptedToken,
      mode,   // 'READ_ONLY' or 'WORKSPACE_SYNC'
      mode,
      now
    ).run();

    // D12: Redirect to originating project page (not /settings)
    // UPGRADE-UX-01: Set ?github_upgraded=true on actual mode upgrades for success toast
    const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.pmerit.com';
    const redirectUrl = new URL(`${frontendUrl}/project/${stateData.project_id}`);
    if (isUpgrade) {
      redirectUrl.searchParams.set('github_upgraded', 'true');
    } else {
      redirectUrl.searchParams.set('github', 'connected');
    }

    return c.redirect(redirectUrl.toString());

  } catch (error) {
    log.error('github_callback_failed', { error: error instanceof Error ? error.message : String(error) });
    // D12: On error, redirect to dashboard with error param
    const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.pmerit.com';
    const errorUrl = new URL(`${frontendUrl}/dashboard`);
    errorUrl.searchParams.set('github', 'error');
    errorUrl.searchParams.set('error', 'OAuth callback failed');
    return c.redirect(errorUrl.toString());
  }
});

/**
 * GET /api/v1/github/status/:projectId
 *
 * Get GitHub connection status for a project.
 */
github.get('/status/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get connection
    const connection = await c.env.DB.prepare(`
      SELECT project_id, repo_owner, repo_name, scope, github_mode, connected_at, last_sync
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      project_id: string;
      repo_owner: string;
      repo_name: string;
      scope: string;
      github_mode: string;
      connected_at: string;
      last_sync: string | null;
    }>();

    if (!connection) {
      const status: GitHubConnection = {
        project_id: projectId,
        connected: false,
        repo_owner: null,
        repo_name: null,
        scope: 'READ_ONLY',
        github_mode: 'READ_ONLY',
        connected_at: null,
        last_sync: null
      };
      return c.json(status);
    }

    const connMode = parseGitHubMode(connection.github_mode);
    const status: GitHubConnection = {
      project_id: connection.project_id,
      connected: true,
      repo_owner: connection.repo_owner === 'PENDING' ? null : connection.repo_owner,
      repo_name: connection.repo_name === 'PENDING' ? null : connection.repo_name,
      scope: connMode,
      github_mode: connMode,
      connected_at: connection.connected_at,
      last_sync: connection.last_sync
    };

    return c.json(status);

  } catch (error) {
    log.error('github_status_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to get connection status',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

/**
 * DELETE /api/v1/github/disconnect/:projectId
 *
 * Remove GitHub connection for a project.
 * Also deletes all associated evidence records.
 */
github.delete('/disconnect/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Delete connection (cascade will delete evidence)
    const result = await c.env.DB.prepare(
      'DELETE FROM github_connections WHERE project_id = ? AND user_id = ?'
    ).bind(projectId, userId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'No connection to disconnect' }, 404);
    }

    // Also explicitly delete evidence records (in case cascade doesn't work)
    await c.env.DB.prepare(
      'DELETE FROM github_evidence WHERE project_id = ?'
    ).bind(projectId).run();

    return c.json({
      success: true,
      message: 'GitHub disconnected successfully'
    });

  } catch (error) {
    log.error('github_disconnect_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to disconnect GitHub',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

/**
 * GET /api/v1/github/repos
 *
 * List repositories the user has access to.
 * Used for selecting which repo to connect to a project.
 *
 * Query: project_id (required to get the stored token)
 */
github.get('/repos', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.query('project_id');

    if (!projectId) {
      return c.json({ error: 'project_id query parameter required' }, 400);
    }

    // Get connection with token
    const connection = await c.env.DB.prepare(`
      SELECT access_token_encrypted
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{ access_token_encrypted: string }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    // Decrypt token — fail-closed if secret not configured
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error', error_code: 'CONFIG_MISSING' }, 500);
    }
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);

    // Fetch repos from GitHub
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AIXORD-Platform'
      }
    });

    if (!reposResponse.ok) {
      const error = await reposResponse.text();
      log.error('github_repos_fetch_failed');
      return c.json({ error: 'Failed to fetch repositories' }, 502);
    }

    const repos = await reposResponse.json() as Array<{
      id: number;
      name: string;
      full_name: string;
      owner: { login: string };
      private: boolean;
      description: string | null;
      updated_at: string;
      html_url: string;
    }>;

    // Return simplified repo list
    const repoList = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      updated_at: repo.updated_at,
      url: repo.html_url
    }));

    return c.json({ repos: repoList });

  } catch (error) {
    log.error('github_repos_fetch_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to fetch repositories',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

/**
 * PUT /api/v1/github/repo/:projectId
 *
 * Update the connected repository for a project.
 * Used after initial OAuth when user selects a specific repo.
 */
github.put('/repo/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const body = await c.req.json<{ repo_owner: string; repo_name: string }>();

    const { repo_owner, repo_name } = body;

    if (!repo_owner || !repo_name) {
      return c.json({ error: 'repo_owner and repo_name required' }, 400);
    }

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Update connection
    const result = await c.env.DB.prepare(`
      UPDATE github_connections
      SET repo_owner = ?, repo_name = ?, last_sync = NULL
      WHERE project_id = ? AND user_id = ?
    `).bind(repo_owner, repo_name, projectId, userId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    // Clear existing evidence for this project (new repo = new evidence)
    await c.env.DB.prepare(
      'DELETE FROM github_evidence WHERE project_id = ?'
    ).bind(projectId).run();

    return c.json({
      success: true,
      repo_owner,
      repo_name,
      message: 'Repository updated successfully'
    });

  } catch (error) {
    log.error('github_repo_update_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to update repository',
      error_code: 'INTERNAL_ERROR'
    }, 500);
  }
});

// =============================================================================
// DUAL-MODE: MODE SWITCH (DUAL-MODE-01)
// =============================================================================

/**
 * PUT /api/v1/github/mode/:projectId
 *
 * Switch GitHub mode for a project.
 * Upgrading READ_ONLY → WORKSPACE_SYNC requires re-OAuth (different scopes).
 * Downgrading WORKSPACE_SYNC → READ_ONLY is instant (token still works).
 */
github.put('/mode/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const body = await c.req.json<{ mode: string }>();
    const newMode = parseGitHubMode(body.mode);

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get current connection
    const connection = await c.env.DB.prepare(
      'SELECT github_mode FROM github_connections WHERE project_id = ? AND user_id = ?'
    ).bind(projectId, userId).first<{ github_mode: string }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    const currentMode = parseGitHubMode(connection.github_mode);

    // Upgrading from READ_ONLY to WORKSPACE_SYNC requires re-OAuth (broader scopes)
    if (currentMode === 'READ_ONLY' && newMode === 'WORKSPACE_SYNC') {
      return c.json({
        requires_reauth: true,
        message: 'Upgrading to WORKSPACE_SYNC requires re-authorization with write permissions. Call POST /github/connect with mode=WORKSPACE_SYNC.',
        current_mode: currentMode,
        requested_mode: newMode
      });
    }

    // Downgrading WORKSPACE_SYNC → READ_ONLY is instant
    await c.env.DB.prepare(
      'UPDATE github_connections SET scope = ?, github_mode = ? WHERE project_id = ? AND user_id = ?'
    ).bind(newMode, newMode, projectId, userId).run();

    return c.json({
      success: true,
      github_mode: newMode,
      message: `Mode switched to ${newMode}`
    });

  } catch (error) {
    log.error('github_mode_switch_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Failed to switch mode', error_code: 'INTERNAL_ERROR' }, 500);
  }
});

// =============================================================================
// WRITE OPERATIONS (WORKSPACE_SYNC mode only) — DUAL-MODE-01
// =============================================================================

/**
 * POST /api/v1/github/commit/:projectId
 *
 * Commit files to GitHub using Git Trees API (atomic multi-file commit).
 * Only available in WORKSPACE_SYNC mode.
 * All writes go to feature branch `aixord/{slug}`, never main.
 */
github.post('/commit/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const body = await c.req.json<{
      files: Array<{ path: string; content: string }>;
      message: string;
      branch?: string;
      scope_name?: string;
    }>();

    if (!body.files?.length || !body.message) {
      return c.json({ error: 'files array and message required' }, 400);
    }

    // Get connection and verify mode
    const connection = await c.env.DB.prepare(`
      SELECT repo_owner, repo_name, access_token_encrypted, github_mode
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      repo_owner: string;
      repo_name: string;
      access_token_encrypted: string;
      github_mode: string;
    }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    if (connection.github_mode !== 'WORKSPACE_SYNC') {
      return c.json({
        error: 'Write operations require WORKSPACE_SYNC mode',
        current_mode: connection.github_mode,
        hint: 'Switch to WORKSPACE_SYNC mode via PUT /github/mode/:projectId'
      }, 403);
    }

    if (connection.repo_owner === 'PENDING' || connection.repo_name === 'PENDING') {
      return c.json({ error: 'No repository selected. Select a repo first.' }, 400);
    }

    // Decrypt token
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error', error_code: 'CONFIG_MISSING' }, 500);
    }
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);

    // Determine branch name
    const projectRow = await c.env.DB.prepare(
      'SELECT name FROM projects WHERE id = ?'
    ).bind(projectId).first<{ name: string }>();
    const slug = (projectRow?.name || projectId).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const branch = body.branch || `aixord/${slug}`;

    // Import and call the write service
    const { commitFilesToGitHub } = await import('../services/github-write');
    const result = await commitFilesToGitHub(
      accessToken,
      connection.repo_owner,
      connection.repo_name,
      branch,
      body.files,
      body.message
    );

    // Record commit in DB (ENV-SYNC-01: includes scope_name)
    const now = new Date().toISOString();
    await c.env.DB.prepare(`
      INSERT INTO github_commits (id, project_id, branch, commit_sha, tree_sha, message, files_count, committed_by, committed_at, pr_number, pr_url, scope_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      projectId,
      result.branch,
      result.commit_sha,
      result.tree_sha,
      body.message.slice(0, 500),
      result.files_committed,
      userId,
      now,
      result.pr_number || null,
      result.pr_url || null,
      body.scope_name || null
    ).run();

    return c.json(result);

  } catch (error) {
    log.error('github_commit_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({
      error: 'Failed to commit files to GitHub',
      error_code: 'COMMIT_FAILED'
    }, 500);
  }
});

/**
 * GET /api/v1/github/commits/:projectId
 *
 * List platform-made commits for a project.
 */
github.get('/commits/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '20'), 100);
    const offset = (page - 1) * perPage;

    const commits = await c.env.DB.prepare(`
      SELECT id, branch, commit_sha, tree_sha, message, files_count, committed_by, committed_at, pr_number, pr_url
      FROM github_commits
      WHERE project_id = ?
      ORDER BY committed_at DESC
      LIMIT ? OFFSET ?
    `).bind(projectId, perPage, offset).all();

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM github_commits WHERE project_id = ?'
    ).bind(projectId).first<{ total: number }>();

    return c.json({
      commits: commits.results,
      total: countResult?.total ?? 0,
      page,
      per_page: perPage
    });

  } catch (error) {
    log.error('github_commits_list_failed', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Failed to list commits', error_code: 'INTERNAL_ERROR' }, 500);
  }
});

/**
 * POST /api/v1/github/create-repo/:projectId
 *
 * Create a new GitHub repository and auto-select it for the project.
 * Only available in WORKSPACE_SYNC mode.
 */
github.post('/create-repo/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const body = await c.req.json<{
      name: string;
      description?: string;
      private?: boolean;
    }>();

    if (!body.name) {
      return c.json({ error: 'Repository name required' }, 400);
    }

    // Get connection and verify mode
    const connection = await c.env.DB.prepare(`
      SELECT access_token_encrypted, github_mode
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      access_token_encrypted: string;
      github_mode: string;
    }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    if (connection.github_mode !== 'WORKSPACE_SYNC') {
      return c.json({
        error: 'Creating repos requires WORKSPACE_SYNC mode',
        current_mode: connection.github_mode
      }, 403);
    }

    // Decrypt token
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error', error_code: 'CONFIG_MISSING' }, 500);
    }
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);

    // Import and call the write service
    const { createGitHubRepo } = await import('../services/github-write');
    const repo = await createGitHubRepo(
      accessToken,
      body.name,
      body.description || '',
      body.private ?? true  // Default to private for safety
    );

    // Auto-select the created repo
    const now = new Date().toISOString();
    await c.env.DB.prepare(`
      UPDATE github_connections
      SET repo_owner = ?, repo_name = ?, last_sync = NULL
      WHERE project_id = ? AND user_id = ?
    `).bind(repo.owner, repo.name, projectId, userId).run();

    // Clear any old evidence (new repo = fresh start)
    await c.env.DB.prepare(
      'DELETE FROM github_evidence WHERE project_id = ?'
    ).bind(projectId).run();

    return c.json({
      success: true,
      repo,
      message: `Repository ${repo.full_name} created and selected`
    });

  } catch (error) {
    log.error('github_create_repo_failed', { error: error instanceof Error ? error.message : String(error) });

    // Pass through GitHub API status codes (e.g., 422 for name collision)
    // so the frontend can detect and retry with a suffix
    const ghStatus = (error as { status?: number })?.status;
    if (ghStatus === 422) {
      return c.json({
        error: 'Repository name already exists',
        error_code: 'REPO_NAME_TAKEN'
      }, 422);
    }

    return c.json({
      error: 'Failed to create repository',
      error_code: 'CREATE_REPO_FAILED',
      detail: error instanceof Error ? error.message : undefined
    }, 500);
  }
});

// =============================================================================
// ON-DEMAND FILE READING (FIX-GITHUB-READ-01)
// Enables frontend/AI to read specific files from the connected GitHub repo.
// =============================================================================

/**
 * GET /api/v1/github/file/:projectId
 *
 * Read a specific file from the connected GitHub repository.
 * Used for on-demand file viewing in the UI and AI context enrichment.
 *
 * Query: path (required) - File path relative to repo root (e.g., "src/App.tsx")
 *        ref (optional)  - Git ref (branch/tag/sha). Default: HEAD
 */
github.get('/file/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const filePath = c.req.query('path');
    const ref = c.req.query('ref') || 'HEAD';

    if (!filePath) {
      return c.json({ error: 'path query parameter required' }, 400);
    }

    // Sanitize path: no directory traversal
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return c.json({ error: 'Invalid file path' }, 400);
    }

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get connection with token
    const connection = await c.env.DB.prepare(`
      SELECT repo_owner, repo_name, access_token_encrypted
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      repo_owner: string;
      repo_name: string;
      access_token_encrypted: string;
    }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected for this project' }, 404);
    }

    if (connection.repo_owner === 'PENDING' || connection.repo_name === 'PENDING') {
      return c.json({ error: 'No repository selected' }, 400);
    }

    // Decrypt token
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error' }, 500);
    }
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);

    const repoPath = `${connection.repo_owner}/${connection.repo_name}`;

    // Fetch file content from GitHub
    const fileResp = await fetch(
      `https://api.github.com/repos/${repoPath}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(ref)}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'AIXORD-Platform',
        },
      }
    );

    if (!fileResp.ok) {
      if (fileResp.status === 404) {
        return c.json({ error: 'File not found', path: filePath }, 404);
      }
      return c.json({ error: 'Failed to fetch file from GitHub' }, 502);
    }

    const content = await fileResp.text();

    // Cap at 50KB for safety (binary file protection)
    const MAX_FILE_SIZE = 50_000;
    const truncated = content.length > MAX_FILE_SIZE;

    return c.json({
      path: filePath,
      repo: repoPath,
      ref,
      content: content.slice(0, MAX_FILE_SIZE),
      size: content.length,
      truncated,
    });

  } catch (error) {
    log.error('github_file_read_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json({
      error: 'Failed to read file from GitHub',
      error_code: 'FILE_READ_FAILED',
    }, 500);
  }
});

/**
 * GET /api/v1/github/tree/:projectId
 *
 * Fetch the full recursive file tree for the connected repository.
 * Used by the frontend file browser component.
 *
 * Query: ref (optional)   - Git ref. Default: HEAD
 *        depth (optional)  - Max directory depth. Default: 5
 */
github.get('/tree/:projectId', async (c) => {
  try {
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const ref = c.req.query('ref') || 'HEAD';
    const maxDepth = Math.min(parseInt(c.req.query('depth') || '5', 10) || 5, 8);

    // Verify project ownership
    const project = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get connection
    const connection = await c.env.DB.prepare(`
      SELECT repo_owner, repo_name, access_token_encrypted
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      repo_owner: string;
      repo_name: string;
      access_token_encrypted: string;
    }>();

    if (!connection) {
      return c.json({ error: 'GitHub not connected' }, 404);
    }

    if (connection.repo_owner === 'PENDING' || connection.repo_name === 'PENDING') {
      return c.json({ error: 'No repository selected' }, 400);
    }

    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return c.json({ error: 'Server configuration error' }, 500);
    }
    const accessToken = await decryptToken(connection.access_token_encrypted, encryptionKey);

    const repoPath = `${connection.repo_owner}/${connection.repo_name}`;

    const treeResp = await fetch(
      `https://api.github.com/repos/${repoPath}/git/trees/${encodeURIComponent(ref)}?recursive=true`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'AIXORD-Platform',
        },
      }
    );

    if (!treeResp.ok) {
      return c.json({ error: 'Failed to fetch tree from GitHub' }, 502);
    }

    const treeData = await treeResp.json() as {
      sha: string;
      tree: Array<{ path: string; type: string; size?: number; sha: string }>;
      truncated: boolean;
    };

    // Filter by depth
    const filtered = treeData.tree.filter(t => t.path.split('/').length <= maxDepth);

    return c.json({
      repo: repoPath,
      ref,
      sha: treeData.sha,
      entries: filtered.map(t => ({
        path: t.path,
        type: t.type === 'tree' ? 'dir' : 'file',
        size: t.size,
      })),
      total: treeData.tree.length,
      shown: filtered.length,
      truncated_by_github: treeData.truncated,
    });

  } catch (error) {
    log.error('github_tree_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json({ error: 'Failed to fetch tree', error_code: 'TREE_FETCH_FAILED' }, 500);
  }
});

export default github;
