/**
 * Shared project ownership verification utility
 *
 * H-6 fix: Centralized from 15+ copy-pasted verifyProjectOwnership functions.
 * Single source of truth — uses `owner_id` column (matches DB schema).
 */

import type { D1Database } from '@cloudflare/workers-types';

/**
 * Verify that a user owns a project.
 * Returns true if the project exists and belongs to the user.
 */
export async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db.prepare(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?'
  ).bind(projectId, userId).first();
  return !!project;
}
