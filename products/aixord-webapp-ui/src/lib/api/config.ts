/**
 * API Configuration — Single source of truth
 *
 * All modules import from here instead of reading env vars directly.
 * This ensures consistent base URLs across the entire frontend.
 *
 * Session 6 (API Audit Fix): Created to unify 4 different env variables
 * into a single VITE_API_BASE configuration.
 */

const envBase = import.meta.env.VITE_API_BASE;

// In development, fail loudly if VITE_API_BASE is missing so devs notice immediately.
// In production, fall back to the known worker URL as a safety net.
if (!envBase && import.meta.env.DEV) {
  throw new Error(
    'VITE_API_BASE is not set. Create a .env file with:\n  VITE_API_BASE=https://aixord-router-worker.peoplemerit.workers.dev'
  );
}

const WORKER_BASE = envBase || 'https://aixord-router-worker.peoplemerit.workers.dev';

export const API_BASE = `${WORKER_BASE}/api/v1`;
export const ROUTER_BASE = `${WORKER_BASE}/v1/router`;
export const BILLING_BASE = `${WORKER_BASE}/v1/billing`;

export { WORKER_BASE };
