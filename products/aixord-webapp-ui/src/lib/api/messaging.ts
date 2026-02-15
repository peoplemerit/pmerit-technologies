/**
 * AIXORD Web App API Client - Messaging & Router
 */

import { APIError, request } from './core';

// ============================================================================
// Messages API (Conversation Persistence)
// ============================================================================

/**
 * Chat message record for persistence.
 */
export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Backend message response type (snake_case from D1 database)
 */
interface BackendMessage {
  id: string;
  project_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Transform backend message to frontend ChatMessage format
 */
function transformMessage(raw: BackendMessage): ChatMessage {
  return {
    id: raw.id,
    projectId: raw.project_id,
    role: raw.role as ChatMessage['role'],
    content: raw.content,
    metadata: raw.metadata,
    createdAt: raw.created_at,
  };
}

export const messagesApi = {
  /**
   * List messages for a project
   */
  async list(projectId: string, token: string, limit = 100, offset = 0, sessionId?: string): Promise<ChatMessage[]> {
    let url = `/projects/${projectId}/messages?limit=${limit}&offset=${offset}`;
    if (sessionId) url += `&session_id=${sessionId}`;
    const response = await request<{ messages: BackendMessage[] }>(
      url,
      {},
      token
    );
    return response.messages.map(transformMessage);
  },

  /**
   * Create a single message
   */
  async create(
    projectId: string,
    data: {
      role: ChatMessage['role'];
      content: string;
      metadata?: Record<string, unknown>;
      session_id?: string;
    },
    token: string
  ): Promise<ChatMessage> {
    const response = await request<BackendMessage>(
      `/projects/${projectId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
    return transformMessage(response);
  },

  /**
   * Create multiple messages at once (batch save)
   */
  async createBatch(
    projectId: string,
    messages: Array<{
      role: ChatMessage['role'];
      content: string;
      metadata?: Record<string, unknown>;
      created_at?: string;
    }>,
    token: string
  ): Promise<ChatMessage[]> {
    const response = await request<{ messages: BackendMessage[] }>(
      `/projects/${projectId}/messages/batch`,
      {
        method: 'POST',
        body: JSON.stringify({ messages }),
      },
      token
    );
    return response.messages.map(transformMessage);
  },

  /**
   * Clear all messages for a project
   */
  async clear(projectId: string, token: string): Promise<void> {
    await request<{ success: boolean }>(
      `/projects/${projectId}/messages`,
      { method: 'DELETE' },
      token
    );
  },
};

// ============================================================================
// Router API (Model Router for AI Chat)
// ============================================================================

/**
 * Router base URL (same worker, different endpoint path)
 * Session 6 (API Audit Fix): Import from unified config
 */
import { ROUTER_BASE } from './config';

/**
 * Router request types
 */
export type RouterMode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';
export type RouterPhase = 'B' | 'P' | 'E' | 'R';
export type RouterIntent = 'CHAT' | 'VERIFY' | 'EXTRACT' | 'CLASSIFY' | 'RAG_VERIFY';

export interface RouterRequest {
  product: 'AIXORD_COPILOT' | 'PMERIT_CHATBOT';
  intent: RouterIntent;
  mode: RouterMode;
  subscription: {
    tier: 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
    key_mode: 'PLATFORM' | 'BYOK';
    user_api_key?: string;
  };
  capsule: {
    objective: string;
    phase: RouterPhase;
    constraints?: string[];
    decisions?: string[];
    open_questions?: string[];
    session_graph?: {
      current: { number: number; type: string; messageCount: number };
      lineage: Array<{ number: number; type: string; edgeType: string; summary?: string }>;
      total: number;
    };
    workspace?: {
      bound: boolean;
      folder_name?: string;
      template?: string;
      permission_level?: string;
      scaffold_generated?: boolean;
      github_connected?: boolean;
      github_repo?: string;
    };
    // AI-Governance Integration — Phase 1
    gates?: {
      setup: Record<string, boolean>;
      work: Record<string, boolean>;
      security: Record<string, boolean>;
    };
    blueprint_summary?: {
      scopes: number;
      deliverables: number;
      deliverables_with_dod: number;
      integrity_passed: boolean | null;
    };
    phase_exit?: {
      current_phase: string;
      required_gates: string[];
      satisfied_gates: string[];
      missing_gates: string[];
      can_advance: boolean;
    };
  };
  delta: {
    user_input: string;
    selection_ids?: string[];
    changed_constraints?: string[];
    artifact_refs?: string[];
  };
  budget?: {
    max_cost_usd?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    max_latency_ms?: number;
  };
  policy_flags?: {
    require_citations?: boolean;
    strict_mode?: boolean;
    allow_retry?: boolean;
  };
  trace: {
    project_id: string;
    session_id: string;
    request_id: string;
    user_id: string;
  };
}

export interface RouterResponse {
  status: 'OK' | 'BLOCKED' | 'RETRIED' | 'ERROR';
  content: string;
  model_used: {
    provider: string;
    model: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    latency_ms: number;
  };
  verification?: {
    verdict: 'PASS' | 'WARN' | 'FAIL';
    flags: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      detail?: string;
    }>;
  };
  error?: string;
}

export const routerApi = {
  /**
   * Execute a chat request through the model router
   * Session 6 (API Audit): Added optional token parameter for authentication
   */
  async execute(request: RouterRequest, token?: string): Promise<RouterResponse> {
    // Session 6 (API Audit): CRITICAL FIX - Send JWT auth token in Authorization header
    const authToken = token || localStorage.getItem('aixord_token') || '';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${ROUTER_BASE}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    // Safely parse JSON — backend may return non-JSON on Worker-level crashes
    const responseText = await response.text();
    let data: RouterResponse;
    try {
      data = JSON.parse(responseText) as RouterResponse;
    } catch {
      throw new APIError(
        response.status,
        'ROUTER_ERROR',
        `Router returned non-JSON response (${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    // Session 4 Fix: Always throw on non-OK responses, even if error field exists
    if (!response.ok) {
      throw new APIError(
        response.status,
        data.error ? 'ROUTER_ERROR' : 'UNKNOWN_ERROR',
        (data.error as string) || `Router request failed with status ${response.status}`
      );
    }

    return data;
  },

  /**
   * Get a cost quote without executing
   */
  async quote(request: RouterRequest): Promise<{
    model_class: string;
    primary_model: { provider: string; model: string };
    estimated: {
      input_tokens: number;
      output_tokens: number;
      cost_usd: number;
    };
  }> {
    const response = await fetch(`${ROUTER_BASE}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(response.status, 'ROUTER_ERROR', data.error || 'Failed to get quote');
    }

    return data;
  },

  /**
   * Check router health
   */
  async health(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${ROUTER_BASE}/health`);
    return response.json();
  },

  /**
   * List available models
   */
  async models(): Promise<{
    classes: Record<string, Array<{ provider: string; model: string }>>;
    timestamp: string;
  }> {
    const response = await fetch(`${ROUTER_BASE}/models`);
    return response.json();
  },
};
