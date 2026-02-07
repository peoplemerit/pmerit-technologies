/**
 * useBlueprint Hook — AIXORD v4.5 Post-Blueprint Governance (L-BPX, L-IVL)
 *
 * Manages blueprint scopes, deliverables, integrity validation, and summary.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  blueprintApi,
  type BlueprintScope,
  type BlueprintDeliverable,
  type IntegrityReport,
  type BlueprintSummary,
} from '../lib/api';

interface UseBlueprintOptions {
  projectId: string | null;
  token: string | null;
}

interface UseBlueprintReturn {
  // Data
  scopes: BlueprintScope[];
  deliverables: BlueprintDeliverable[];
  integrityReport: IntegrityReport | null;
  summary: BlueprintSummary | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Load functions
  loadScopes: () => Promise<void>;
  loadDeliverables: (scopeId?: string) => Promise<void>;
  loadSummary: () => Promise<void>;
  loadIntegrity: () => Promise<void>;

  // CRUD
  createScope: (data: { name: string; parent_scope_id?: string; purpose?: string; boundary?: string; assumptions?: string[]; assumption_status?: string }) => Promise<BlueprintScope | null>;
  updateScope: (scopeId: string, data: Partial<{ name: string; purpose: string; boundary: string; assumptions: string[]; assumption_status: string; status: string }>) => Promise<boolean>;
  deleteScope: (scopeId: string) => Promise<boolean>;
  createDeliverable: (data: { scope_id: string; name: string; description?: string; dod_evidence_spec?: string; dod_verification_method?: string; dod_quality_bar?: string; dod_failure_modes?: string; upstream_deps?: string[]; dependency_type?: string }) => Promise<BlueprintDeliverable | null>;
  updateDeliverable: (deliverableId: string, data: Partial<{ name: string; description: string; dod_evidence_spec: string; dod_verification_method: string; dod_quality_bar: string; dod_failure_modes: string; upstream_deps: string[]; downstream_deps: string[]; dependency_type: string; status: string }>) => Promise<boolean>;
  deleteDeliverable: (deliverableId: string) => Promise<boolean>;

  // Validation
  runValidation: () => Promise<IntegrityReport | null>;
}

export function useBlueprint({ projectId, token }: UseBlueprintOptions): UseBlueprintReturn {
  const [scopes, setScopes] = useState<BlueprintScope[]>([]);
  const [deliverables, setDeliverables] = useState<BlueprintDeliverable[]>([]);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [summary, setSummary] = useState<BlueprintSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const result = await blueprintApi.getSummary(projectId, token);
      setSummary(result);
    } catch (err) {
      console.error('Failed to load blueprint summary:', err);
    }
  }, [projectId, token]);

  const loadScopes = useCallback(async () => {
    if (!projectId || !token) return;
    setIsLoading(true);
    try {
      const result = await blueprintApi.listScopes(projectId, token);
      setScopes(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scopes');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  const loadDeliverables = useCallback(async (scopeId?: string) => {
    if (!projectId || !token) return;
    setIsLoading(true);
    try {
      const result = await blueprintApi.listDeliverables(projectId, token, scopeId);
      setDeliverables(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliverables');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  const loadIntegrity = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const result = await blueprintApi.getIntegrity(projectId, token);
      setIntegrityReport(result);
    } catch (err) {
      console.error('Failed to load integrity report:', err);
    }
  }, [projectId, token]);

  // Auto-load summary on mount
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // CRUD operations
  const createScope = useCallback(async (data: { name: string; parent_scope_id?: string; purpose?: string; boundary?: string; assumptions?: string[]; assumption_status?: string }): Promise<BlueprintScope | null> => {
    if (!projectId || !token) return null;
    try {
      const result = await blueprintApi.createScope(projectId, data, token);
      await loadScopes();
      await loadSummary();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scope');
      return null;
    }
  }, [projectId, token, loadScopes, loadSummary]);

  const updateScope = useCallback(async (scopeId: string, data: Partial<{ name: string; purpose: string; boundary: string; assumptions: string[]; assumption_status: string; status: string }>): Promise<boolean> => {
    if (!projectId || !token) return false;
    try {
      await blueprintApi.updateScope(projectId, scopeId, data, token);
      await loadScopes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scope');
      return false;
    }
  }, [projectId, token, loadScopes]);

  const deleteScope = useCallback(async (scopeId: string): Promise<boolean> => {
    if (!projectId || !token) return false;
    try {
      await blueprintApi.deleteScope(projectId, scopeId, token);
      await loadScopes();
      await loadDeliverables();
      await loadSummary();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scope');
      return false;
    }
  }, [projectId, token, loadScopes, loadDeliverables, loadSummary]);

  const createDeliverable = useCallback(async (data: { scope_id: string; name: string; description?: string; dod_evidence_spec?: string; dod_verification_method?: string; dod_quality_bar?: string; dod_failure_modes?: string; upstream_deps?: string[]; dependency_type?: string }): Promise<BlueprintDeliverable | null> => {
    if (!projectId || !token) return null;
    try {
      const result = await blueprintApi.createDeliverable(projectId, data, token);
      await loadDeliverables();
      await loadSummary();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deliverable');
      return null;
    }
  }, [projectId, token, loadDeliverables, loadSummary]);

  const updateDeliverable = useCallback(async (deliverableId: string, data: Partial<{ name: string; description: string; dod_evidence_spec: string; dod_verification_method: string; dod_quality_bar: string; dod_failure_modes: string; upstream_deps: string[]; downstream_deps: string[]; dependency_type: string; status: string }>): Promise<boolean> => {
    if (!projectId || !token) return false;
    try {
      await blueprintApi.updateDeliverable(projectId, deliverableId, data, token);
      await loadDeliverables();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
      return false;
    }
  }, [projectId, token, loadDeliverables]);

  const deleteDeliverable = useCallback(async (deliverableId: string): Promise<boolean> => {
    if (!projectId || !token) return false;
    try {
      await blueprintApi.deleteDeliverable(projectId, deliverableId, token);
      await loadDeliverables();
      await loadSummary();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deliverable');
      return false;
    }
  }, [projectId, token, loadDeliverables, loadSummary]);

  const runValidation = useCallback(async (): Promise<IntegrityReport | null> => {
    if (!projectId || !token) return null;
    setIsLoading(true);
    try {
      const result = await blueprintApi.runValidation(projectId, token);
      setIntegrityReport(result);
      await loadSummary();
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Integrity validation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token, loadSummary]);

  return {
    scopes, deliverables, integrityReport, summary,
    isLoading, error,
    loadScopes, loadDeliverables, loadSummary, loadIntegrity,
    createScope, updateScope, deleteScope,
    createDeliverable, updateDeliverable, deleteDeliverable,
    runValidation,
  };
}
