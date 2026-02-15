/**
 * API Configuration — Single source of truth
 *
 * All modules import from here instead of reading env vars directly.
 * This ensures consistent base URLs across the entire frontend.
 *
 * Session 6 (API Audit Fix): Created to unify 4 different env variables
 * into a single VITE_API_BASE configuration.
 */

const WORKER_BASE = import.meta.env.VITE_API_BASE
  || 'https://aixord-router-worker.peoplemerit.workers.dev';

export const API_BASE = `${WORKER_BASE}/api/v1`;
export const ROUTER_BASE = `${WORKER_BASE}/v1/router`;
export const BILLING_BASE = `${WORKER_BASE}/v1/billing`;

export { WORKER_BASE };
