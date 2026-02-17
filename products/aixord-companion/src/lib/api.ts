/**
 * D4-CHAT API Client for AIXORD Companion
 *
 * Enables the browser extension to sync with the D4-CHAT platform.
 * - Authentication via stored token
 * - Project sync (create, list, update)
 * - State sync (phase, gates)
 * - Session notes persistence
 */

/**
 * API base URL — defaults to production, override via Chrome storage
 * key 'apiBaseOverride' for development/staging.
 */
const API_BASE_DEFAULT = 'https://aixord-router-worker.peoplemerit.workers.dev/api/v1';
let API_BASE = API_BASE_DEFAULT;

// Allow runtime override for dev/staging (checked once on module load)
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.get('apiBaseOverride', (result) => {
    if (result.apiBaseOverride) {
      API_BASE = result.apiBaseOverride;
      console.debug('[API] Using override base:', API_BASE);
    }
  });
}

export interface ApiError {
  error: string;
  detail?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string | null;
  reality_classification: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectState {
  project_id: string;
  phase: string;
  gates: Record<string, boolean>;
  capsule: {
    session: {
      number: number;
      phase: string;
      messageCount: number;
    };
    project: {
      name: string;
      objective: string | null;
    };
  };
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

/**
 * D4-CHAT API Client
 */
export class D4ChatApi {
  private token: string | null = null;

  constructor() {
    // Token will be loaded from Chrome storage
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // =========================================================================
  // Auth Endpoints
  // =========================================================================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = result.token;
    return result;
  }

  /**
   * Get current user info
   */
  async me(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
  }

  // =========================================================================
  // Projects Endpoints
  // =========================================================================

  /**
   * List all projects
   */
  async listProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/projects');
  }

  /**
   * Get a single project
   */
  async getProject(projectId: string): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`);
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    objective?: string;
    reality_classification?: string;
  }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    data: { name?: string; objective?: string }
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =========================================================================
  // State Endpoints
  // =========================================================================

  /**
   * Get project state
   */
  async getState(projectId: string): Promise<ProjectState> {
    return this.request<ProjectState>(`/state/${projectId}`);
  }

  /**
   * Update project phase
   */
  async updatePhase(
    projectId: string,
    phase: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/state/${projectId}/phase`, {
      method: 'PUT',
      body: JSON.stringify({ phase }),
    });
  }

  /**
   * Update a gate status
   */
  async updateGate(
    projectId: string,
    gateId: string,
    passed: boolean
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/state/${projectId}/gates/${gateId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ passed }),
      }
    );
  }

  /**
   * Update full state
   */
  async updateState(
    projectId: string,
    data: {
      phase?: string;
      gates?: Record<string, boolean>;
      capsule?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/state/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =========================================================================
  // Decisions Endpoints
  // =========================================================================

  /**
   * Log a decision
   */
  async logDecision(
    projectId: string,
    data: {
      decision_type: string;
      description: string;
      actor?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get decisions for a project
   */
  async getDecisions(projectId: string): Promise<{ decisions: unknown[] }> {
    return this.request<{ decisions: unknown[] }>(
      `/projects/${projectId}/decisions`
    );
  }
}

// Singleton instance
export const api = new D4ChatApi();
