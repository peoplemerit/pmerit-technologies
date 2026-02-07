/**
 * useLayers Hook (Path B: Proactive Debugging)
 *
 * Manages the state and operations for execution layers.
 * Handles fetching, creating, and transitioning layers.
 */

import { useState, useCallback, useEffect } from 'react';
import { api, type ExecutionLayer, type CreateLayerInput, type VerifyLayerInput } from '../lib/api';

interface UseLayersOptions {
  projectId: string | null;
  token: string | null;
  sessionNumber?: number;
  autoFetch?: boolean;
}

interface UseLayersReturn {
  layers: ExecutionLayer[];
  isLoading: boolean;
  error: string | null;
  activeLayer: ExecutionLayer | null;
  executedLayer: ExecutionLayer | null;

  // CRUD operations
  fetchLayers: () => Promise<void>;
  createLayer: (data: CreateLayerInput) => Promise<ExecutionLayer | null>;
  createBatchLayers: (layers: CreateLayerInput[]) => Promise<ExecutionLayer[] | null>;
  updateLayer: (layerId: string, data: Partial<CreateLayerInput>) => Promise<ExecutionLayer | null>;
  deleteLayer: (layerId: string) => Promise<boolean>;

  // Lifecycle operations
  startLayer: (layerId: string) => Promise<ExecutionLayer | null>;
  completeLayer: (layerId: string, actualOutputs?: Record<string, unknown>) => Promise<ExecutionLayer | null>;
  verifyLayer: (layerId: string, data: VerifyLayerInput) => Promise<ExecutionLayer | null>;
  failLayer: (layerId: string, reason: string) => Promise<ExecutionLayer | null>;
  retryLayer: (layerId: string) => Promise<ExecutionLayer | null>;

  // Helpers
  clearError: () => void;
}

export function useLayers({
  projectId,
  token,
  sessionNumber,
  autoFetch = true,
}: UseLayersOptions): UseLayersReturn {
  const [layers, setLayers] = useState<ExecutionLayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const activeLayer = layers.find((l) => l.status === 'ACTIVE') || null;
  const executedLayer = layers.find((l) => l.status === 'EXECUTED') || null;

  const clearError = useCallback(() => setError(null), []);

  // Fetch layers
  const fetchLayers = useCallback(async () => {
    if (!projectId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const { layers: fetchedLayers } = await api.layers.list(projectId, token, sessionNumber);
      setLayers(fetchedLayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch layers');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token, sessionNumber]);

  // Create single layer
  const createLayer = useCallback(async (data: CreateLayerInput): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const layer = await api.layers.create(projectId, data, token);
      setLayers((prev) => [...prev, layer].sort((a, b) => a.layer_number - b.layer_number));
      return layer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create layer');
      return null;
    }
  }, [projectId, token]);

  // Create batch layers
  const createBatchLayers = useCallback(async (layersData: CreateLayerInput[]): Promise<ExecutionLayer[] | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const { layers: createdLayers } = await api.layers.createBatch(projectId, layersData, token);
      setLayers((prev) => [...prev, ...createdLayers].sort((a, b) => a.layer_number - b.layer_number));
      return createdLayers;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create layers');
      return null;
    }
  }, [projectId, token]);

  // Update layer
  const updateLayer = useCallback(async (layerId: string, data: Partial<CreateLayerInput>): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.update(projectId, layerId, data, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update layer');
      return null;
    }
  }, [projectId, token]);

  // Delete layer
  const deleteLayer = useCallback(async (layerId: string): Promise<boolean> => {
    if (!projectId || !token) return false;

    setError(null);

    try {
      await api.layers.delete(projectId, layerId, token);
      setLayers((prev) => prev.filter((l) => l.id !== layerId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete layer');
      return false;
    }
  }, [projectId, token]);

  // Start layer (PENDING → ACTIVE)
  const startLayer = useCallback(async (layerId: string): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.start(projectId, layerId, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start layer');
      return null;
    }
  }, [projectId, token]);

  // Complete layer (ACTIVE → EXECUTED)
  const completeLayer = useCallback(async (layerId: string, actualOutputs?: Record<string, unknown>): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.complete(projectId, layerId, actualOutputs, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete layer');
      return null;
    }
  }, [projectId, token]);

  // Verify layer (EXECUTED → LOCKED)
  const verifyLayer = useCallback(async (layerId: string, data: VerifyLayerInput): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.verify(projectId, layerId, data, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify layer');
      return null;
    }
  }, [projectId, token]);

  // Fail layer (ACTIVE/EXECUTED → FAILED)
  const failLayer = useCallback(async (layerId: string, reason: string): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.fail(projectId, layerId, reason, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fail layer');
      return null;
    }
  }, [projectId, token]);

  // Retry layer (FAILED → ACTIVE)
  const retryLayer = useCallback(async (layerId: string): Promise<ExecutionLayer | null> => {
    if (!projectId || !token) return null;

    setError(null);

    try {
      const updated = await api.layers.retry(projectId, layerId, token);
      setLayers((prev) => prev.map((l) => (l.id === layerId ? updated : l)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry layer');
      return null;
    }
  }, [projectId, token]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && projectId && token) {
      fetchLayers();
    }
  }, [autoFetch, fetchLayers, projectId, token]);

  return {
    layers,
    isLoading,
    error,
    activeLayer,
    executedLayer,
    fetchLayers,
    createLayer,
    createBatchLayers,
    updateLayer,
    deleteLayer,
    startLayer,
    completeLayer,
    verifyLayer,
    failLayer,
    retryLayer,
    clearError,
  };
}

export default useLayers;
