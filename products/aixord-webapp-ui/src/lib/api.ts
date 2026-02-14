/**
 * AIXORD Web App API Client
 *
 * Backward compatibility re-export barrel.
 * All API code lives in ./api/* modules.
 *
 * IMPORTANT: This file MUST only re-export from ./api/index.
 * Do NOT add local functions or variables here — they will break
 * because API_BASE and request() live in ./api/core.ts.
 */

export * from './api/index';
export { default } from './api/index';
