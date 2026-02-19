/**
 * AIXORD Web App API Client - Core Configuration
 *
 * Base types, request helper, error handling, and shared utilities
 */

// Session 6 (API Audit Fix): Import from unified config instead of reading env directly
import { API_BASE } from './config';
export { API_BASE };

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  statusCode: number;
  code: string;
  /** Retry-After header value (seconds) from 429 responses — Phase 1.3 */
  retryAfter: string | null;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryAfter = null;
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
 * Compute retry delay with exponential backoff + jitter.
 *
 * Phase 1.3: Respects Retry-After header from 429 responses, otherwise uses
 * exponential backoff (1s, 2s, 4s) with ±25% jitter to avoid thundering herd.
 *
 * @param attempt - Zero-based retry attempt number (1 = first retry)
 * @param retryAfterHeader - Value of the Retry-After response header (seconds)
 * @returns Delay in milliseconds
 */
function computeRetryDelay(attempt: number, retryAfterHeader?: string | null): number {
  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS = 10_000;

  // If server told us how long to wait, respect it (capped at 10s)
  if (retryAfterHeader) {
    const serverDelay = parseInt(retryAfterHeader, 10);
    if (!isNaN(serverDelay) && serverDelay > 0) {
      return Math.min(serverDelay * 1000, MAX_DELAY_MS);
    }
  }

  // Exponential backoff: 1s, 2s, 4s (capped at 10s)
  const exponentialDelay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);

  // Add ±25% jitter to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);

  return Math.max(0, Math.round(exponentialDelay + jitter));
}

/**
 * Helper to make authenticated requests with retry for transient failures.
 *
 * Phase 1.3: Exponential backoff with jitter + Retry-After header support.
 * Retries on: 429 (rate limit), 5xx (server errors), timeouts, network failures.
 * Does NOT retry: 4xx client errors (except 429), JSON parse errors.
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const MAX_RETRIES = 3;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: APIError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Wait before retry (exponential backoff with jitter)
    if (attempt > 0) {
      const delay = computeRetryDelay(attempt, lastError?.retryAfter);
      console.debug(`[API] Retry ${attempt}/${MAX_RETRIES} for ${endpoint} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 30s timeout for regular API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        lastError = new APIError(408, 'TIMEOUT', 'Request timed out. Please try again.');
        continue; // Retry on timeout
      }
      lastError = new APIError(0, 'NETWORK_ERROR', 'Unable to connect to the server. Check your internet connection.');
      continue; // Retry on network error
    } finally {
      clearTimeout(timeoutId);
    }

    // Safely parse JSON — backend may return non-JSON on Worker-level crashes
    const responseText = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new APIError(
        response.status,
        'PARSE_ERROR',
        `Server returned non-JSON response (${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      // Include validation details in error message when available
      let errorMessage = (data.error as string) || (data.message as string) || 'An unknown error occurred';
      if (data.details && Array.isArray(data.details)) {
        const detailMessages = (data.details as Array<{ message?: string }>)
          .map(d => d.message)
          .filter(Boolean)
          .join('. ');
        if (detailMessages) {
          errorMessage = detailMessages;
        }
      }
      // Include detail field from server errors (e.g., finalization crash diagnostics)
      if (data.detail && typeof data.detail === 'string') {
        errorMessage = `${errorMessage}: ${data.detail}`;
      }

      const apiError = new APIError(
        response.status,
        (data.code as string) || 'UNKNOWN_ERROR',
        errorMessage
      );

      // Capture Retry-After header for 429 responses
      if (response.status === 429) {
        apiError.retryAfter = response.headers.get('Retry-After');
      }

      // Only retry on 429 (rate limit) and 5xx (server errors)
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        lastError = apiError;
        continue;
      }

      throw apiError;
    }

    return data as T;
  }

  // All retries exhausted
  throw lastError || new APIError(0, 'NETWORK_ERROR', 'Request failed after multiple retries.');
}

// ============================================================================
// Core Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  apiKey: string;
  emailVerified?: boolean;
}

export type ProjectType = 'software' | 'general' | 'research' | 'legal' | 'personal';

export interface Project {
  id: string;
  name: string;
  objective: string;
  realityClassification: 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
  projectType: ProjectType;
  createdAt: string;
  updatedAt: string;
}

// AIXORD v4.3 Data Classification Value
export type DataClassificationValue = 'YES' | 'NO' | 'UNKNOWN';

// AIXORD v4.3 AI Exposure Level (L-SPG3, L-SPG4)
export type AIExposureLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PROHIBITED';

// AIXORD v4.3 Data Classification (SPG-01) - Full interface
export interface DataClassification {
  projectId: string;
  pii: DataClassificationValue;
  phi: DataClassificationValue;
  financial: DataClassificationValue;
  legal: DataClassificationValue;
  minorData: DataClassificationValue;
  jurisdiction: string;
  regulations: string[];
  aiExposure: AIExposureLevel;
  declared: boolean;
  declaredBy?: string;
  declaredAt?: string;
}

// AIXORD v4.3 Reconciliation Triad (GCP-01)
export interface ReconciliationTriad {
  planned: string[];
  claimed: string[];
  verified: string[];
  divergences: string[];
}

// AIXORD v4.3 Security Gates (SPG-01)
export interface SecurityGates {
  GS_DC: boolean;  // Data Classification declared
  GS_DP: boolean;  // Data Protection requirements satisfiable
  GS_AC: boolean;  // Access Controls appropriate
  GS_AI: boolean;  // AI usage complies with classification
  GS_JR: boolean;  // Jurisdiction compliance confirmed
  GS_RT: boolean;  // Retention/deletion policy compliant
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
  // AIXORD v4.3 additions (optional for backward compatibility)
  dataClassification?: DataClassification;
  securityGates?: SecurityGates;
  reconciliation?: ReconciliationTriad;
  enhancement?: {
    fs: number;
    hr: number;
    oa: number;
    '2m': number;
  };
  sessionSeq?: {
    seq: number;
    prev: string;
    drift: number;
  };
}

/**
 * Decision record from the governance audit ledger.
 * Uses frontend-friendly camelCase with proper typing.
 */
export interface Decision {
  id: string;
  projectId: string;
  type: 'APPROVAL' | 'REJECTION' | 'DEFERRAL' | 'SCOPE_CHANGE';
  summary: string;
  actor: string;
  phase?: 'B' | 'P' | 'E' | 'R';
  rationale?: string;
  createdAt: string;
}

/**
 * Normalize and validate a date string
 * Returns ISO string if valid, undefined otherwise
 */
export function normalizeDate(dateStr: string | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  } catch {
    return undefined;
  }
}
