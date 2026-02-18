/**
 * Conversations API Endpoint Tests
 *
 * Tests the conversations sub-router mounted at /api/v1/conversations:
 *   GET    /api/v1/conversations                  - List conversations (optional ?project_id=X)
 *   POST   /api/v1/conversations                  - Create conversation
 *   GET    /api/v1/conversations/:id              - Get single conversation
 *   PATCH  /api/v1/conversations/:id              - Update conversation (title, objective, capsule)
 *   DELETE /api/v1/conversations/:id              - Delete conversation
 *   GET    /api/v1/conversations/:id/messages     - Get messages for conversation
 *   POST   /api/v1/conversations/:id/messages     - Add message to conversation
 *
 * The sub-router applies requireAuth internally via conversations.use('/*', requireAuth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types';
import { type MockQueryResult } from '../helpers';
import { createMockEnv, createTestSession, jsonHeaders, authHeaders } from '../test-app';

// Mock crypto for requireAuth middleware's token hashing
vi.mock('../../src/utils/crypto', () => ({
  hashPasswordPBKDF2: vi.fn(),
  verifyPasswordPBKDF2: vi.fn(),
  hashSHA256: vi.fn().mockImplementation(async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }),
}));

let conversationsRouter: any;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('../../src/api/conversations');
  conversationsRouter = mod.default;
});

/**
 * Build a test app with the conversations router.
 * The router has its own requireAuth middleware, so session DB queries are needed.
 */
function buildApp(queries: MockQueryResult[] = []) {
  const env = createMockEnv(queries);
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/v1/conversations', conversationsRouter);

  const req = (path: string, init?: RequestInit) =>
    app.request(path, init, env);

  return { app, env, req };
}

/** Session lookup query for requireAuth -- token_hash based */
function sessionQuery(userId = 'user-1', email = 'user@test.com'): MockQueryResult {
  return {
    pattern: 'token_hash',
    result: { user_id: userId, id: 'sess-1', email },
  };
}

/** Project ownership verification query */
function projectOwnershipQuery(exists = true): MockQueryResult {
  return {
    pattern: 'SELECT id FROM projects WHERE id',
    result: exists ? { id: 'proj-1' } : null,
  };
}

/** Conversation ownership verification query */
function conversationOwnershipQuery(exists = true): MockQueryResult {
  return {
    pattern: 'SELECT id FROM conversations WHERE id = ? AND user_id',
    result: exists ? { id: 'conv-1' } : null,
  };
}

// ============================================================================
// List Conversations Tests — GET /api/v1/conversations
// ============================================================================
describe('GET /api/v1/conversations', () => {
  it('returns all conversations for the authenticated user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT * FROM conversations WHERE user_id',
        result: [
          { id: 'conv-1', project_id: 'proj-1', user_id: 'user-1', title: 'Chat 1', objective: null, capsule: '{}', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
          { id: 'conv-2', project_id: 'proj-1', user_id: 'user-1', title: 'Chat 2', objective: null, capsule: '{}', created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
        ],
      },
    ]);

    const res = await req('/api/v1/conversations', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { conversations: Array<{ id: string; title: string }> };
    expect(body.conversations).toHaveLength(2);
    expect(body.conversations[0].title).toBe('Chat 1');
    expect(body.conversations[1].title).toBe('Chat 2');
  });

  it('returns empty array when user has no conversations', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT * FROM conversations WHERE user_id', result: [] },
    ]);

    const res = await req('/api/v1/conversations', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { conversations: unknown[] };
    expect(body.conversations).toEqual([]);
  });

  it('filters by project_id when query param is provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // verifyProjectOwnership lookup
      projectOwnershipQuery(true),
      // Filtered query includes project_id
      {
        pattern: 'AND project_id',
        result: [
          { id: 'conv-1', project_id: 'proj-1', user_id: 'user-1', title: 'Filtered Chat', objective: null, capsule: '{}', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
        ],
      },
    ]);

    const res = await req('/api/v1/conversations?project_id=proj-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { conversations: Array<{ id: string; title: string }> };
    expect(body.conversations).toHaveLength(1);
    expect(body.conversations[0].title).toBe('Filtered Chat');
  });

  it('returns 404 when filtering by project_id user does not own', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // verifyProjectOwnership returns null (not owned)
      projectOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations?project_id=other-proj', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Project not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Create Conversation Tests — POST /api/v1/conversations
// ============================================================================
describe('POST /api/v1/conversations', () => {
  it('creates a conversation and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      // verifyProjectOwnership
      projectOwnershipQuery(true),
      // INSERT conversation
      { pattern: 'INSERT INTO conversations', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ project_id: 'proj-1', title: 'My Chat' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as {
      id: string;
      project_id: string;
      user_id: string;
      title: string;
      objective: null;
      capsule: string;
      created_at: string;
      updated_at: string;
    };
    expect(body.id).toBeDefined();
    expect(body.project_id).toBe('proj-1');
    expect(body.user_id).toBe('user-1');
    expect(body.title).toBe('My Chat');
    expect(body.capsule).toBe('{}');
    expect(body.created_at).toBeDefined();
    expect(body.updated_at).toBeDefined();
  });

  it('defaults title to "New Conversation" when not provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      projectOwnershipQuery(true),
      { pattern: 'INSERT INTO conversations', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ project_id: 'proj-1' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { title: string };
    expect(body.title).toBe('New Conversation');
  });

  it('accepts optional objective and capsule fields', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      projectOwnershipQuery(true),
      { pattern: 'INSERT INTO conversations', runResult: { success: true, changes: 1 } },
    ]);

    const capsuleData = JSON.stringify({ context: 'test' });
    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        project_id: 'proj-1',
        title: 'Objective Chat',
        objective: 'Solve the problem',
        capsule: capsuleData,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { title: string; objective: string; capsule: string };
    expect(body.title).toBe('Objective Chat');
    expect(body.objective).toBe('Solve the problem');
    expect(body.capsule).toBe(capsuleData);
  });

  it('returns 400 when project_id is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([sessionQuery()]);

    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'No project' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('project_id is required');
  });

  it('returns 404 when project does not belong to user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      projectOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ project_id: 'someone-elses-proj', title: 'Sneaky' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Project not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ project_id: 'proj-1', title: 'Test' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Single Conversation Tests — GET /api/v1/conversations/:id
// ============================================================================
describe('GET /api/v1/conversations/:id', () => {
  it('returns conversation for valid ID owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      {
        pattern: 'SELECT * FROM conversations WHERE id',
        result: {
          id: 'conv-1',
          project_id: 'proj-1',
          user_id: 'user-1',
          title: 'My Conversation',
          objective: 'Talk about stuff',
          capsule: '{}',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      },
    ]);

    const res = await req('/api/v1/conversations/conv-1', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string; objective: string };
    expect(body.id).toBe('conv-1');
    expect(body.title).toBe('My Conversation');
    expect(body.objective).toBe('Talk about stuff');
  });

  it('returns 404 for non-existent conversation', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT * FROM conversations WHERE id', result: null },
    ]);

    const res = await req('/api/v1/conversations/nonexistent', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 404 when conversation belongs to another user (ownership check)', async () => {
    const { token } = await createTestSession();

    // The query binds both conversation ID and user_id, so if user_id doesn't match
    // the .first() returns null
    const { req } = buildApp([
      sessionQuery(),
      { pattern: 'SELECT * FROM conversations WHERE id', result: null },
    ]);

    const res = await req('/api/v1/conversations/other-users-conv', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations/conv-1');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Update Conversation Tests — PATCH /api/v1/conversations/:id
// ============================================================================
describe('PATCH /api/v1/conversations/:id', () => {
  it('updates conversation title', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'UPDATE conversations SET', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; updated_at: string };
    expect(body.success).toBe(true);
    expect(body.updated_at).toBeDefined();
  });

  it('updates conversation capsule', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'UPDATE conversations SET', runResult: { success: true, changes: 1 } },
    ]);

    const newCapsule = JSON.stringify({ summary: 'Updated context' });
    const res = await req('/api/v1/conversations/conv-1', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ capsule: newCapsule }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('updates conversation objective', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'UPDATE conversations SET', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ objective: 'New objective' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 400 when no fields are provided', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
    ]);

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('No fields to update');
  });

  it('returns 404 for conversation not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations/other-conv', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ title: 'Hijack' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ title: 'No Auth' }),
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Delete Conversation Tests — DELETE /api/v1/conversations/:id
// ============================================================================
describe('DELETE /api/v1/conversations/:id', () => {
  it('deletes conversation and returns success', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'DELETE FROM conversations WHERE id', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 404 for conversation not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations/other-conv', {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations/conv-1', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Get Messages Tests — GET /api/v1/conversations/:id/messages
// ============================================================================
describe('GET /api/v1/conversations/:id/messages', () => {
  it('returns messages for a conversation owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      {
        pattern: 'SELECT * FROM conversation_messages WHERE conversation_id',
        result: [
          { id: 'msg-1', conversation_id: 'conv-1', role: 'user', content: 'Hello', metadata: '{}', created_at: '2026-01-01T00:00:00Z' },
          { id: 'msg-2', conversation_id: 'conv-1', role: 'assistant', content: 'Hi there!', metadata: '{}', created_at: '2026-01-01T00:00:01Z' },
        ],
      },
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { messages: Array<{ id: string; role: string; content: string }> };
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages[0].content).toBe('Hello');
    expect(body.messages[1].role).toBe('assistant');
    expect(body.messages[1].content).toBe('Hi there!');
  });

  it('returns empty array when conversation has no messages', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'SELECT * FROM conversation_messages WHERE conversation_id', result: [] },
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { messages: unknown[] };
    expect(body.messages).toEqual([]);
  });

  it('returns 404 when conversation is not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations/other-conv/messages', {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations/conv-1/messages');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Add Message Tests — POST /api/v1/conversations/:id/messages
// ============================================================================
describe('POST /api/v1/conversations/:id/messages', () => {
  it('adds a user message and returns 201', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      // INSERT message
      { pattern: 'INSERT INTO conversation_messages', runResult: { success: true, changes: 1 } },
      // UPDATE conversation updated_at
      { pattern: 'UPDATE conversations SET updated_at', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'user', content: 'Hello, world!' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as {
      id: string;
      conversation_id: string;
      role: string;
      content: string;
      metadata: string;
      created_at: string;
    };
    expect(body.id).toBeDefined();
    expect(body.conversation_id).toBe('conv-1');
    expect(body.role).toBe('user');
    expect(body.content).toBe('Hello, world!');
    expect(body.metadata).toBe('{}');
    expect(body.created_at).toBeDefined();
  });

  it('adds an assistant message with metadata', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'INSERT INTO conversation_messages', runResult: { success: true, changes: 1 } },
      { pattern: 'UPDATE conversations SET updated_at', runResult: { success: true, changes: 1 } },
    ]);

    const metadata = JSON.stringify({ model: 'claude-3', tokens: 150 });
    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'assistant', content: 'I can help with that.', metadata }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { role: string; content: string; metadata: string };
    expect(body.role).toBe('assistant');
    expect(body.content).toBe('I can help with that.');
    expect(body.metadata).toBe(metadata);
  });

  it('adds a system message', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
      { pattern: 'INSERT INTO conversation_messages', runResult: { success: true, changes: 1 } },
      { pattern: 'UPDATE conversations SET updated_at', runResult: { success: true, changes: 1 } },
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'system', content: 'You are a helpful assistant.' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { role: string };
    expect(body.role).toBe('system');
  });

  it('returns 400 when role is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ content: 'No role provided' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('role and content are required');
  });

  it('returns 400 when content is missing', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'user' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('role and content are required');
  });

  it('returns 400 for invalid role value', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(true),
    ]);

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'admin', content: 'Invalid role' }),
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('role must be user, assistant, or system');
  });

  it('returns 404 when conversation is not owned by user', async () => {
    const { token } = await createTestSession();

    const { req } = buildApp([
      sessionQuery(),
      conversationOwnershipQuery(false),
    ]);

    const res = await req('/api/v1/conversations/other-conv/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ role: 'user', content: 'Sneaky message' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('Conversation not found');
  });

  it('returns 401 without auth', async () => {
    const { req } = buildApp();

    const res = await req('/api/v1/conversations/conv-1/messages', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ role: 'user', content: 'No auth' }),
    });

    expect(res.status).toBe(401);
  });
});
