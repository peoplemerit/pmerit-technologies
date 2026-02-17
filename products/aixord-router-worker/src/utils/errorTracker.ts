/**
 * Error Tracking Utility
 *
 * Lightweight structured error logging for Cloudflare Workers.
 * Outputs JSON-structured logs visible via `wrangler tail`.
 * Designed to be extended with external services (Sentry, LogTail) when needed.
 *
 * D79: Swiss Cheese Model root cause categorization
 *   INTEGRITY     — Type/logic errors (code quality layer)
 *   VALIDATION    — Testing/CI gaps (validation layer)
 *   ISOLATION     — Blast radius / compartmentalization failures
 *   OBSERVABILITY — Monitoring/detection gaps
 *   PROCESS       — Human/workflow errors
 *   DESIGN        — Architectural/specification flaws
 */

export type RootCauseCategory = 'INTEGRITY' | 'VALIDATION' | 'ISOLATION' | 'OBSERVABILITY' | 'PROCESS' | 'DESIGN';

export interface ErrorReport {
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: string;
  stack?: string;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  root_cause_category?: RootCauseCategory;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Track and log an error with structured metadata.
 * All errors are output as structured JSON via console.error for wrangler tail.
 */
export function trackError(
  error: unknown,
  context?: {
    requestId?: string;
    userId?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    root_cause_category?: RootCauseCategory;
    extra?: Record<string, unknown>;
  }
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  const report: ErrorReport = {
    level: 'error',
    message: err.message,
    error: err.name,
    stack: err.stack?.split('\n').slice(0, 5).join('\n'),
    requestId: context?.requestId,
    userId: context?.userId,
    path: context?.path,
    method: context?.method,
    statusCode: context?.statusCode,
    root_cause_category: context?.root_cause_category,
    context: context?.extra,
    timestamp: new Date().toISOString(),
  };

  // Structured JSON log — captured by wrangler tail and Cloudflare log push
  console.error(JSON.stringify(report));
}

/**
 * Track a warning (non-fatal issue).
 */
export function trackWarning(
  message: string,
  context?: {
    requestId?: string;
    userId?: string;
    path?: string;
    extra?: Record<string, unknown>;
  }
): void {
  const report: ErrorReport = {
    level: 'warn',
    message,
    requestId: context?.requestId,
    userId: context?.userId,
    path: context?.path,
    context: context?.extra,
    timestamp: new Date().toISOString(),
  };

  console.warn(JSON.stringify(report));
}
