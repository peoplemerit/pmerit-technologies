/**
 * AIXORD Web App API Client
 *
 * Connects to D4 Web App at https://aixord-webapp.peoplemerit.workers.dev
 */

const API_BASE = 'https://aixord-webapp.peoplemerit.workers.dev/api/v1';

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }
}

/**
 * Helper to make authenticated requests
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.error || 'An unknown error occurred'
    );
  }

  return data;
}

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  apiKey: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
  createdAt: string;
  updatedAt: string;
}

export interface AIXORDState {
  project: {
    name: string;
    objective: string;
  };
  session: {
    number: number;
    phase: string;
    messageCount: number;
    startedAt: string;
    lastCheckpoint?: string;
  };
  gates: Record<string, boolean>;
  reality: {
    class: string;
    constraints: string[];
  };
}

export interface Decision {
  id: string;
  type: string;
  description: string;
  rationale: string;
  approved: boolean;
  locked: boolean;
  createdAt: string;
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string): Promise<User> {
    const response = await request<{ user: { id: string; email: string; name: string | null }; api_key: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name || undefined,
      apiKey: response.api_key,
    };
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    const response = await request<{ id: string; email: string; name: string | null; apiKey: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      id: response.id,
      email: response.email,
      name: response.name || undefined,
      apiKey: response.apiKey,
    };
  },

  /**
   * Get current user info (validates API key)
   */
  async me(token: string): Promise<User> {
    const response = await request<{ id: string; email: string; name: string | null }>('/auth/me', {}, token);
    return {
      id: response.id,
      email: response.email,
      name: response.name || undefined,
      apiKey: token, // We already have the token/apiKey
    };
  },
};

// ============================================================================
// Projects API
// ============================================================================

export const projectsApi = {
  /**
   * List all projects for the authenticated user
   */
  async list(token: string): Promise<Project[]> {
    const response = await request<{ projects: Project[] }>('/projects', {}, token);
    return response.projects;
  },

  /**
   * Get a specific project
   */
  async get(id: string, token: string): Promise<Project> {
    const response = await request<{ project: Project }>(`/projects/${id}`, {}, token);
    return response.project;
  },

  /**
   * Create a new project
   */
  async create(
    data: {
      name: string;
      objective: string;
      realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
    },
    token: string
  ): Promise<Project> {
    const response = await request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
    return response.project;
  },

  /**
   * Update a project
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      objective: string;
    }>,
    token: string
  ): Promise<Project> {
    const response = await request<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
    return response.project;
  },

  /**
   * Delete a project
   */
  async delete(id: string, token: string): Promise<void> {
    await request<void>(`/projects/${id}`, {
      method: 'DELETE',
    }, token);
  },
};

// ============================================================================
// State API
// ============================================================================

export const stateApi = {
  /**
   * Get project state
   */
  async get(projectId: string, token: string): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(`/state/${projectId}`, {}, token);
    return response.state;
  },

  /**
   * Update full state
   */
  async update(projectId: string, state: AIXORDState, token: string): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(`/state/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ state }),
    }, token);
    return response.state;
  },

  /**
   * Patch state at specific path
   */
  async patch(
    projectId: string,
    path: string,
    value: unknown,
    token: string
  ): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(`/state/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify({ path, value }),
    }, token);
    return response.state;
  },

  /**
   * Pass a gate
   */
  async passGate(projectId: string, gateId: string, token: string): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(
      `/state/${projectId}/gates/${gateId}`,
      { method: 'POST' },
      token
    );
    return response.state;
  },

  /**
   * Set current phase
   */
  async setPhase(projectId: string, phase: string, token: string): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(
      `/state/${projectId}/phase`,
      {
        method: 'PUT',
        body: JSON.stringify({ phase }),
      },
      token
    );
    return response.state;
  },

  /**
   * Increment session number
   */
  async incrementSession(projectId: string, token: string): Promise<AIXORDState> {
    const response = await request<{ state: AIXORDState }>(
      `/state/${projectId}/session`,
      { method: 'POST' },
      token
    );
    return response.state;
  },
};

// ============================================================================
// Decisions API
// ============================================================================

export const decisionsApi = {
  /**
   * List decisions for a project
   */
  async list(projectId: string, token: string): Promise<Decision[]> {
    const response = await request<{ decisions: Decision[] }>(
      `/projects/${projectId}/decisions`,
      {},
      token
    );
    return response.decisions;
  },

  /**
   * Create a decision
   */
  async create(
    projectId: string,
    data: {
      type: string;
      description: string;
      rationale: string;
    },
    token: string
  ): Promise<Decision> {
    const response = await request<{ decision: Decision }>(
      `/projects/${projectId}/decisions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
    return response.decision;
  },

  /**
   * Lock a decision
   */
  async lock(projectId: string, decisionId: string, token: string): Promise<Decision> {
    const response = await request<{ decision: Decision }>(
      `/projects/${projectId}/decisions/${decisionId}/lock`,
      { method: 'POST' },
      token
    );
    return response.decision;
  },
};

// ============================================================================
// Combined API object
// ============================================================================

export const api = {
  auth: authApi,
  projects: projectsApi,
  state: stateApi,
  decisions: decisionsApi,
};

export default api;
