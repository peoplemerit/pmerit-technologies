/**
 * useEngineering Hook — AIXORD v4.5 Part XIV Engineering Governance
 *
 * Manages engineering governance artifacts: compliance summary,
 * and lazy-loading of individual artifact types on demand.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  engineeringApi,
  type EngineeringCompliance,
  type SAR,
  type InterfaceContract,
  type FitnessFunction,
  type IntegrationTestRecord,
  type IterationBudget,
  type OperationalReadiness,
  type RollbackStrategy,
  type AlertConfiguration,
  type KnowledgeTransfer,
} from '../lib/api';

interface UseEngineeringOptions {
  projectId: string | null;
  token: string | null;
}

interface UseEngineeringReturn {
  // Compliance summary (auto-loaded)
  compliance: EngineeringCompliance | null;
  isLoading: boolean;
  error: string | null;

  // Artifact data (lazy-loaded on demand)
  sars: SAR[];
  contracts: InterfaceContract[];
  fitness: FitnessFunction[];
  tests: IntegrationTestRecord[];
  budgets: IterationBudget[];
  readiness: OperationalReadiness[];
  rollback: RollbackStrategy[];
  alerts: AlertConfiguration[];
  knowledge: KnowledgeTransfer[];

  // Load functions (call to populate artifact arrays)
  loadCompliance: () => Promise<void>;
  loadSARs: () => Promise<void>;
  loadContracts: () => Promise<void>;
  loadFitness: () => Promise<void>;
  loadTests: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  loadReadiness: () => Promise<void>;
  loadRollback: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  loadKnowledge: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export function useEngineering({ projectId, token }: UseEngineeringOptions): UseEngineeringReturn {
  const [compliance, setCompliance] = useState<EngineeringCompliance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Artifact state (lazy-loaded)
  const [sars, setSars] = useState<SAR[]>([]);
  const [contracts, setContracts] = useState<InterfaceContract[]>([]);
  const [fitness, setFitness] = useState<FitnessFunction[]>([]);
  const [tests, setTests] = useState<IntegrationTestRecord[]>([]);
  const [budgets, setBudgets] = useState<IterationBudget[]>([]);
  const [readiness, setReadiness] = useState<OperationalReadiness[]>([]);
  const [rollback, setRollback] = useState<RollbackStrategy[]>([]);
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeTransfer[]>([]);

  // Load compliance summary
  const loadCompliance = useCallback(async () => {
    if (!projectId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await engineeringApi.getCompliance(projectId, token);
      setCompliance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  // Load individual artifact types
  const loadSARs = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listSAR(projectId, token);
      setSars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SARs');
    }
  }, [projectId, token]);

  const loadContracts = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listContracts(projectId, token);
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
    }
  }, [projectId, token]);

  const loadFitness = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listFitness(projectId, token);
      setFitness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fitness functions');
    }
  }, [projectId, token]);

  const loadTests = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listTests(projectId, token);
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    }
  }, [projectId, token]);

  const loadBudgets = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listBudget(projectId, token);
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    }
  }, [projectId, token]);

  const loadReadiness = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listReadiness(projectId, token);
      setReadiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load readiness');
    }
  }, [projectId, token]);

  const loadRollback = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listRollback(projectId, token);
      setRollback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rollback strategies');
    }
  }, [projectId, token]);

  const loadAlerts = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listAlerts(projectId, token);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    }
  }, [projectId, token]);

  const loadKnowledge = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await engineeringApi.listKnowledge(projectId, token);
      setKnowledge(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge transfers');
    }
  }, [projectId, token]);

  // Load all artifacts at once
  const loadAll = useCallback(async () => {
    if (!projectId || !token) return;
    setIsLoading(true);
    try {
      await Promise.all([
        loadCompliance(),
        loadSARs(),
        loadContracts(),
        loadFitness(),
        loadTests(),
        loadBudgets(),
        loadReadiness(),
        loadRollback(),
        loadAlerts(),
        loadKnowledge(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    projectId, token, loadCompliance, loadSARs, loadContracts,
    loadFitness, loadTests, loadBudgets, loadReadiness,
    loadRollback, loadAlerts, loadKnowledge,
  ]);

  // Auto-load compliance on mount
  useEffect(() => {
    loadCompliance();
  }, [loadCompliance]);

  return {
    compliance,
    isLoading,
    error,
    sars,
    contracts,
    fitness,
    tests,
    budgets,
    readiness,
    rollback,
    alerts,
    knowledge,
    loadCompliance,
    loadSARs,
    loadContracts,
    loadFitness,
    loadTests,
    loadBudgets,
    loadReadiness,
    loadRollback,
    loadAlerts,
    loadKnowledge,
    loadAll,
  };
}
