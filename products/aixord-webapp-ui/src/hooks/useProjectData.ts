/**
 * useProjectData Hook
 * 
 * Centralized data fetching for project, decisions, evidence, images, and CCS status.
 * Manages all GET requests to backend APIs with loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type Project, type Decision, type CCSGateStatus } from '../lib/api';

interface EvidenceItem {
  id: string;
  url: string;
  filename: string;
  evidenceType: string;
}

interface GitHubConnection {
  connected: boolean;
  repo_owner?: string;
  repo_name?: string;
  last_sync?: string;
}

interface GitHubRepo {
  owner: string;
  name: string;
  full_name: string;
  private: boolean;
}

interface UseProjectDataOptions {
  projectId: string | null;
  token: string | null;
  autoFetch?: boolean;
}

export function useProjectData({ projectId, token, autoFetch = true }: UseProjectDataOptions) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [githubConnection, setGithubConnection] = useState<GitHubConnection | null>(null);
  const [recentEvidence, setRecentEvidence] = useState<EvidenceItem[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [ccsStatus, setCcsStatus] = useState<CCSGateStatus | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId || !token) return;
    setProjectLoading(true);
    setProjectError(null);
    try {
      const data = await api.projects.get(projectId, token);
      setProject(data);
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setProjectLoading(false);
    }
  }, [projectId, token]);

  const fetchDecisions = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await api.decisions.list(projectId, token);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
    }
  }, [projectId, token]);

  const fetchEvidence = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const data = await api.evidence.getTriad(projectId, token);
      if (data.connection) {
        setGithubConnection({
          connected: true,
          repo_owner: data.connection.repo_owner,
          repo_name: data.connection.repo_name,
          last_sync: data.connection.last_sync,
        });
      }
    } catch {
      // Evidence fetch is non-critical
    }
  }, [projectId, token]);

  const fetchImages = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      // Fetch both user-uploaded images and GitHub evidence
      const [images, evidence] = await Promise.allSettled([
        api.images.list(projectId, token),
        api.evidence.list(projectId, token),
      ]);

      const evidenceItems: EvidenceItem[] = [];

      if (images.status === 'fulfilled') {
        const imgList = (images.value as any).images || [];
        // Fetch each image as blob with auth header to create displayable URLs
        const blobResults = await Promise.allSettled(
          imgList.map(async (img: any) => {
            const res = await fetch(api.images.getUrl(projectId, img.id), {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) return null;
            const blob = await res.blob();
            return { img, blobUrl: URL.createObjectURL(blob) };
          })
        );
        for (const result of blobResults) {
          if (result.status === 'fulfilled' && result.value) {
            evidenceItems.push({
              id: result.value.img.id,
              url: result.value.blobUrl,
              filename: result.value.img.filename,
              evidenceType: result.value.img.evidence_type || 'SCREENSHOT',
            });
          }
        }
      }

      if (evidence.status === 'fulfilled') {
        const evList = (evidence.value as any).evidence || [];
        for (const ev of evList) {
          if (!evidenceItems.find(e => e.id === ev.id)) {
            evidenceItems.push({
              id: ev.id,
              url: ev.url || '',
              filename: ev.title || ev.filename || 'evidence',
              evidenceType: ev.evidence_type || ev.type || 'GITHUB',
            });
          }
        }
      }

      setRecentEvidence(evidenceItems);
    } catch {
      // Non-critical
    }
  }, [projectId, token]);

  const fetchGithubRepos = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const result = await api.github.listRepos(projectId, token);
      setGithubRepos((result as any).repos || []);
    } catch {
      // May not have GitHub connected
    }
  }, [projectId, token]);

  const fetchCCSStatus = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const status = await api.ccs.getStatus(projectId, token);
      setCcsStatus(status);
    } catch (err) {
      console.error('Failed to fetch CCS status:', err);
    }
  }, [projectId, token]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchProject();
      fetchDecisions();
      fetchCCSStatus();
      fetchEvidence();
      fetchImages();
      fetchGithubRepos();
    }
  }, [autoFetch, fetchProject, fetchDecisions, fetchCCSStatus, fetchEvidence, fetchImages, fetchGithubRepos]);

  // Cleanup blob URLs for evidence images on unmount
  useEffect(() => {
    return () => {
      recentEvidence.forEach((e) => {
        if (e.url.startsWith('blob:')) URL.revokeObjectURL(e.url);
      });
    };
  }, [recentEvidence]);

  return {
    project,
    projectLoading,
    projectError,
    decisions,
    githubConnection,
    recentEvidence,
    githubRepos,
    ccsStatus,
    // Refetch functions
    refetchProject: fetchProject,
    refetchDecisions: fetchDecisions,
    refetchEvidence: fetchEvidence,
    refetchImages: fetchImages,
    refetchGithubRepos: fetchGithubRepos,
    refetchCCSStatus: fetchCCSStatus,
    // State setters (for optimistic updates)
    setProject,
    setGithubConnection,
    setRecentEvidence,
    setCcsStatus,
  };
}
