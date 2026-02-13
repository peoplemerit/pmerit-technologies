/**
 * GitHub API (HANDOFF-D4-GITHUB-EVIDENCE)
 *
 * OAuth integration for read-only GitHub evidence collection.
 * Evidence augments the Reconciliation Triad - it INFORMS, never overrides.
 *
 * Endpoints:
 * - POST   /api/v1/github/connect        - Initiate OAuth flow
 * - GET    /api/v1/github/callback       - OAuth callback handler
 * - GET    /api/v1/github/status/:projectId - Get connection status
 * - DELETE /api/v1/github/disconnect/:projectId - Remove connection
 * - GET    /api/v1/github/repos          - List user's repos
 */

import { Hono } from 'hono';
import type { Env, GitHubConnection } from '../types';
import { requireAuth } from '../middleware/requireAuth';

const github = new Hono<{ Bindings: Env }>();

// Auth on all routes EXCEPT /callback (GitHub redirects there without a Bearer token)
github.use('/*', async (c, next) => {
  if (c.req.path.endsWith('/callback')) {
    return next();
  }
  return requireAuth(c, next);
});

// =============================================================================
// ENCRYPTION HELPERS
// =============================================================================

/**
 * Encrypt a token for storage
 * Uses AES-GCM with the GITHUB_TOKEN_ENCRYPTION_KEY
 */
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(token)
  );

  // Combine IV + encrypted data and base64 encode
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a stored token
 */
async function decryptToken(encryptedToken: string, key: string): Promise<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));

  // Extract IV and encrypted data
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
    }>();

    const { project_id, repo_owner, repo_name } = body;

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
      created_at: new Date().toISOString()
    });

    // Store state in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      'INSERT INTO oauth_states (state, data, expires_at) VALUES (?, ?, ?)'
    ).bind(state, stateData, expiresAt).run();

    // Build authorization URL
    // Request minimal read-only scopes
    const scopes = ['repo:status', 'read:org', 'public_repo'].join(' ');
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
    console.error('GitHub connect error:', error);
    return c.json({
      error: 'Failed to initiate GitHub connection',
      detail: error instanceof Error ? error.message : String(error)
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
    };

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
      console.error('GitHub token exchange error:', tokenData);
      return c.json({
        error: 'Failed to exchange code for token',
        detail: tokenData.error_description || tokenData.error
      }, 400);
    }

    // Encrypt the access token for storage
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production';
    const encryptedToken = await encryptToken(tokenData.access_token, encryptionKey);

    // If repo not specified, we'll need to prompt user to select one
    // For now, store connection without specific repo
    const now = new Date().toISOString();

    // Upsert connection (one connection per project)
    await c.env.DB.prepare(`
      INSERT INTO github_connections (project_id, user_id, repo_owner, repo_name, access_token_encrypted, scope, connected_at)
      VALUES (?, ?, ?, ?, ?, 'READ_ONLY', ?)
      ON CONFLICT(project_id) DO UPDATE SET
        user_id = excluded.user_id,
        repo_owner = excluded.repo_owner,
        repo_name = excluded.repo_name,
        access_token_encrypted = excluded.access_token_encrypted,
        connected_at = excluded.connected_at
    `).bind(
      stateData.project_id,
      stateData.user_id,
      stateData.repo_owner || 'PENDING',  // Will be updated when user selects repo
      stateData.repo_name || 'PENDING',
      encryptedToken,
      now
    ).run();

    // D12: Redirect to originating project page (not /settings)
    const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.pmerit.com';
    const redirectUrl = new URL(`${frontendUrl}/project/${stateData.project_id}`);
    redirectUrl.searchParams.set('github', 'connected');

    return c.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('GitHub callback error:', error);
    // D12: On error, redirect to dashboard with error param
    const frontendUrl = c.env.FRONTEND_URL || 'https://aixord.pmerit.com';
    const errorUrl = new URL(`${frontendUrl}/dashboard`);
    errorUrl.searchParams.set('github', 'error');
    errorUrl.searchParams.set('error', error instanceof Error ? error.message : 'OAuth callback failed');
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
      SELECT project_id, repo_owner, repo_name, scope, connected_at, last_sync
      FROM github_connections
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first<{
      project_id: string;
      repo_owner: string;
      repo_name: string;
      scope: string;
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
        connected_at: null,
        last_sync: null
      };
      return c.json(status);
    }

    const status: GitHubConnection = {
      project_id: connection.project_id,
      connected: true,
      repo_owner: connection.repo_owner === 'PENDING' ? null : connection.repo_owner,
      repo_name: connection.repo_name === 'PENDING' ? null : connection.repo_name,
      scope: 'READ_ONLY',
      connected_at: connection.connected_at,
      last_sync: connection.last_sync
    };

    return c.json(status);

  } catch (error) {
    console.error('GitHub status error:', error);
    return c.json({
      error: 'Failed to get connection status',
      detail: error instanceof Error ? error.message : String(error)
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
    console.error('GitHub disconnect error:', error);
    return c.json({
      error: 'Failed to disconnect GitHub',
      detail: error instanceof Error ? error.message : String(error)
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

    // Decrypt token
    const encryptionKey = c.env.GITHUB_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production';
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
      console.error('GitHub repos fetch error:', error);
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
    console.error('GitHub repos error:', error);
    return c.json({
      error: 'Failed to fetch repositories',
      detail: error instanceof Error ? error.message : String(error)
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
    console.error('GitHub repo update error:', error);
    return c.json({
      error: 'Failed to update repository',
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default github;
