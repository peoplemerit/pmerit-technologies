/**
 * AIXORD Companion - Chrome Storage Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { CompanionState } from '../../types';
import { createDefaultState } from '../../types';

type MessageResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      if (!response.ok) {
        reject(new Error((response as { error: string }).error));
        return;
      }
      resolve((response as { data: T }).data);
    });
  });
}

export function useStorage() {
  const [state, setState] = useState<CompanionState>(createDefaultState());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sendMessage<CompanionState>('GET_STATE');
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load state');
      console.error('[AIXORD Companion] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveState = useCallback(async (newState: CompanionState) => {
    try {
      setError(null);
      await sendMessage('SAVE_STATE', newState);
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save state');
      console.error('[AIXORD Companion] Save error:', err);
    }
  }, []);

  const resetState = useCallback(async () => {
    try {
      setError(null);
      const data = await sendMessage<CompanionState>('RESET_STATE');
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset state');
      console.error('[AIXORD Companion] Reset error:', err);
    }
  }, []);

  const generateHandoff = useCallback(async (): Promise<string> => {
    try {
      const handoff = await sendMessage<string>('GENERATE_HANDOFF', state);
      return handoff;
    } catch (err) {
      console.error('[AIXORD Companion] Handoff error:', err);
      throw err;
    }
  }, [state]);

  return {
    state,
    loading,
    error,
    saveState,
    resetState,
    generateHandoff,
    refresh: loadState,
  };
}
