/**
 * useKnowledgeArtifacts Hook (GKDL-01)
 *
 * Manages knowledge artifacts state and API operations.
 * Implements L-GKDL1-7 from AIXORD v4.3.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  knowledgeApi,
  type KnowledgeArtifact,
  type KnowledgeArtifactType,
  type ArtifactStatus,
  type DerivationSource,
} from '../lib/api';

interface UseKnowledgeArtifactsOptions {
  projectId: string | null;
  token: string | null;
  autoFetch?: boolean;
}

interface UseKnowledgeArtifactsReturn {
  artifacts: KnowledgeArtifact[];
  isLoading: boolean;
  error: string | null;
  // Operations
  fetchArtifacts: (filters?: { type?: KnowledgeArtifactType; status?: ArtifactStatus }) => Promise<void>;
  createArtifact: (data: CreateArtifactData) => Promise<KnowledgeArtifact | null>;
  updateArtifact: (artifactId: string, data: UpdateArtifactData) => Promise<boolean>;
  deleteArtifact: (artifactId: string) => Promise<boolean>;
  approveArtifact: (artifactId: string) => Promise<boolean>;
  generateCSR: () => Promise<{ id: string; title: string } | null>;
  // Utilities
  getArtifactById: (id: string) => KnowledgeArtifact | undefined;
  getArtifactsByType: (type: KnowledgeArtifactType) => KnowledgeArtifact[];
  getApprovedArtifacts: () => KnowledgeArtifact[];
}

interface CreateArtifactData {
  type: KnowledgeArtifactType;
  title: string;
  content: string;
  summary?: string;
  derivationSource?: DerivationSource;
  sourceSessionIds?: string[];
  sourceArtifactIds?: string[];
}

interface UpdateArtifactData {
  title?: string;
  content?: string;
  summary?: string;
  status?: ArtifactStatus;
}

export function useKnowledgeArtifacts({
  projectId,
  token,
  autoFetch = true,
}: UseKnowledgeArtifactsOptions): UseKnowledgeArtifactsReturn {
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all artifacts for the project
  const fetchArtifacts = useCallback(
    async (filters?: { type?: KnowledgeArtifactType; status?: ArtifactStatus }) => {
      if (!projectId || !token) {
        setArtifacts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await knowledgeApi.list(projectId, token, filters);
        setArtifacts(response.artifacts);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch artifacts';
        setError(message);
        console.error('Failed to fetch knowledge artifacts:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, token]
  );

  // Create a new artifact
  const createArtifact = useCallback(
    async (data: CreateArtifactData): Promise<KnowledgeArtifact | null> => {
      if (!projectId || !token) {
        setError('No project selected');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await knowledgeApi.create(projectId, data, token);

        // Fetch the full artifact to add to state
        const fullArtifact = await knowledgeApi.get(projectId, response.id, token);
        setArtifacts((prev) => [fullArtifact, ...prev]);

        return fullArtifact;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create artifact';
        setError(message);
        console.error('Failed to create knowledge artifact:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, token]
  );

  // Update an existing artifact
  const updateArtifact = useCallback(
    async (artifactId: string, data: UpdateArtifactData): Promise<boolean> => {
      if (!projectId || !token) {
        setError('No project selected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        await knowledgeApi.update(projectId, artifactId, data, token);

        // Fetch updated artifact
        const updatedArtifact = await knowledgeApi.get(projectId, artifactId, token);
        setArtifacts((prev) =>
          prev.map((a) => (a.id === artifactId ? updatedArtifact : a))
        );

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update artifact';
        setError(message);
        console.error('Failed to update knowledge artifact:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, token]
  );

  // Delete (supersede) an artifact
  const deleteArtifact = useCallback(
    async (artifactId: string): Promise<boolean> => {
      if (!projectId || !token) {
        setError('No project selected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        await knowledgeApi.delete(projectId, artifactId, token);

        // Update artifact status in state
        setArtifacts((prev) =>
          prev.map((a) =>
            a.id === artifactId ? { ...a, status: 'SUPERSEDED' as ArtifactStatus } : a
          )
        );

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete artifact';
        setError(message);
        console.error('Failed to delete knowledge artifact:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, token]
  );

  // Approve an artifact (L-GKDL5)
  const approveArtifact = useCallback(
    async (artifactId: string): Promise<boolean> => {
      if (!projectId || !token) {
        setError('No project selected');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await knowledgeApi.approve(projectId, artifactId, token);

        // Update artifact in state
        setArtifacts((prev) =>
          prev.map((a) =>
            a.id === artifactId
              ? {
                  ...a,
                  status: 'APPROVED' as ArtifactStatus,
                  approvedBy: response.approvedBy,
                  approvedAt: response.approvedAt,
                }
              : a
          )
        );

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve artifact';
        setError(message);
        console.error('Failed to approve knowledge artifact:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, token]
  );

  // Generate CSR (L-GCP6, L-GKDL7)
  const generateCSR = useCallback(async (): Promise<{ id: string; title: string } | null> => {
    if (!projectId || !token) {
      setError('No project selected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await knowledgeApi.generateCSR(projectId, token);

      // Fetch the full artifact and add to state
      const fullArtifact = await knowledgeApi.get(projectId, response.id, token);
      setArtifacts((prev) => [fullArtifact, ...prev]);

      return { id: response.id, title: response.title };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate CSR';
      setError(message);
      console.error('Failed to generate CSR:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  // Utility: Get artifact by ID
  const getArtifactById = useCallback(
    (id: string): KnowledgeArtifact | undefined => {
      return artifacts.find((a) => a.id === id);
    },
    [artifacts]
  );

  // Utility: Get artifacts by type
  const getArtifactsByType = useCallback(
    (type: KnowledgeArtifactType): KnowledgeArtifact[] => {
      return artifacts.filter((a) => a.type === type);
    },
    [artifacts]
  );

  // Utility: Get approved artifacts only
  const getApprovedArtifacts = useCallback((): KnowledgeArtifact[] => {
    return artifacts.filter((a) => a.status === 'APPROVED');
  }, [artifacts]);

  // Auto-fetch on mount or when projectId/token changes
  useEffect(() => {
    if (autoFetch && projectId && token) {
      fetchArtifacts();
    }
  }, [autoFetch, projectId, token, fetchArtifacts]);

  return {
    artifacts,
    isLoading,
    error,
    fetchArtifacts,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    approveArtifact,
    generateCSR,
    getArtifactById,
    getArtifactsByType,
    getApprovedArtifacts,
  };
}

export default useKnowledgeArtifacts;
