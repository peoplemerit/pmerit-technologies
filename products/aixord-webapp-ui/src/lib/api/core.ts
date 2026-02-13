/**
 * AIXORD Web App API Client - Core Configuration
 *
 * Base types, request helper, error handling, and shared utilities
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'https://aixord-router-worker.peoplemerit.workers.dev/api/v1';

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
export async function request<T>(
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
    throw new APIError(
      response.status,
      (data.code as string) || 'UNKNOWN_ERROR',
      (data.error as string) || 'An unknown error occurred'
    );
  }

  return data as T;
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
