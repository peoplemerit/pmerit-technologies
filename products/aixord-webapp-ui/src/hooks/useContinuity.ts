/**
 * useContinuity Hook (HANDOFF-PCC-01 Task 8)
 *
 * Manages Project Continuity Capsule state:
 * - Fetches and caches the full capsule
 * - Pin/unpin management
 * - Auto-refresh on pin changes
 */

import { useState, useCallback, useEffect } from 'react';
import { continuityApi, type ContinuityCapsule, type ContinuityPin } from '../lib/api';

interface UseContinuityOptions {
  projectId: string | null;
  token: string | null;
  enabled?: boolean;
}

interface UseContinuityReturn {
  capsule: ContinuityCapsule | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pinItem: (pinType: string, targetId: string, label?: string) => Promise<void>;
  unpinItem: (pinId: string) => Promise<void>;
}

export function useContinuity({ projectId, token, enabled = true }: UseContinuityOptions): UseContinuityReturn {
  const [capsule, setCapsule] = useState<ContinuityCapsule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapsule = useCallback(async () => {
    if (!projectId || !token || !enabled) return;

    setLoading(true);
    setError(null);
    try {
      const data = await continuityApi.getCapsule(projectId, token);
      setCapsule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load continuity');
    } finally {
      setLoading(false);
    }
  }, [projectId, token, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  const pinItem = useCallback(async (pinType: string, targetId: string, label?: string) => {
    if (!projectId || !token) return;
    try {
      await continuityApi.createPin(projectId, { pin_type: pinType, target_id: targetId, label }, token);
      await fetchCapsule(); // Refresh capsule to include new pin
    } catch (err) {
      console.error('Failed to pin item:', err);
    }
  }, [projectId, token, fetchCapsule]);

  const unpinItem = useCallback(async (pinId: string) => {
    if (!projectId || !token) return;
    try {
      await continuityApi.deletePin(projectId, pinId, token);
      await fetchCapsule(); // Refresh capsule to remove pin
    } catch (err) {
      console.error('Failed to unpin item:', err);
    }
  }, [projectId, token, fetchCapsule]);

  return {
    capsule,
    loading,
    error,
    refresh: fetchCapsule,
    pinItem,
    unpinItem,
  };
}
