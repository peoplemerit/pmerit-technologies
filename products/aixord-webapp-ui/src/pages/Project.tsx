/**
 * Project Workspace Page (Ribbon-Style Layout)
 *
 * Ribbon layout with maximized chat area:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ [A] AIXORD     [Governance] [Evidence] [Info]        user@email [Logout] │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ [Ribbon content - visible ONLY when tab is active]                       │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │                            CHAT AREA (85%+ of screen)                    │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ ● BRAINSTORM │ Gates: 2/10 │ $0.0034 │ 61 msgs │ [📎] [input] [Balanced] │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { useProjectState } from '../hooks/useApi';
import { api, APIError, phaseToShort, type Project as ProjectType, type Decision, type CCSGateStatus, type SessionType, type EdgeType } from '../lib/api';
import { useAIXORDSDK, GateBlockedError, AIExposureBlockedError } from '../lib/sdk';
import { useSessions } from '../hooks/useSessions';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ImageUpload, type PendingImage } from '../components/chat/ImageUpload';
import { formatAttachmentsForContext, type AttachedFile } from '../components/FileAttachment';
import { CCSIncidentBanner } from '../components/CCSIncidentBanner';
import { CCSIncidentPanel } from '../components/CCSIncidentPanel';
import { CCSCreateIncidentModal } from '../components/CCSCreateIncidentModal';
import { TabBar } from '../components/layout/TabBar';
import { Ribbon } from '../components/layout/Ribbon';
import { StatusBar } from '../components/layout/StatusBar';
import { GovernanceRibbon } from '../components/ribbon/GovernanceRibbon';
import { InfoRibbon } from '../components/ribbon/InfoRibbon';
import { EvidenceRibbon } from '../components/ribbon/EvidenceRibbon';
import { EngineeringRibbon } from '../components/ribbon/EngineeringRibbon';
import { SecurityRibbon } from '../components/ribbon/SecurityRibbon';
import { EngineeringPanel, type EngineeringSection } from '../components/EngineeringPanel';
import { BlueprintPanel } from '../components/BlueprintPanel';
import BlueprintRibbon from '../components/ribbon/BlueprintRibbon';
import { useEngineering } from '../hooks/useEngineering';
import { useBlueprint } from '../hooks/useBlueprint';
import { NewSessionModal } from '../components/session/NewSessionModal';
import { WorkspaceSetupWizard, type WorkspaceBindingData } from '../components/WorkspaceSetupWizard';
import type { Message, Conversation } from '../components/chat/types';

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Main Project Component
// ============================================================================

export function Project() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const { settings, getActiveApiKey } = useUserSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ribbon state
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Project data
  const [project, setProject] = useState<ProjectType | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Available models state
  const [availableModels, setAvailableModels] = useState<Record<string, Array<{ provider: string; model: string }>> | null>(null);

  // Decisions data
  const [decisions, setDecisions] = useState<Decision[]>([]);

  // Chat state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Session cost tracking
  const [sessionCost, setSessionCost] = useState<number>(0);
  const [sessionTokens, setSessionTokens] = useState<number>(0);

  // Local file system state
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Image upload modal state
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Evidence state
  const [githubConnection, setGithubConnection] = useState<any>(null);
  const [recentEvidence, setRecentEvidence] = useState<Array<{ id: string; url: string; filename: string; evidenceType: string }>>([]);
  const [githubRepos, setGithubRepos] = useState<Array<{ owner: string; name: string; full_name: string; private: boolean }>>([]);

  // CCS state
  const [ccsStatus, setCcsStatus] = useState<CCSGateStatus | null>(null);
  const [showCCSPanel, setShowCCSPanel] = useState(false);
  const [showCCSCreate, setShowCCSCreate] = useState(false);

  // Phase transition error (Tier 1 enforcement)
  const [phaseError, setPhaseError] = useState<string | null>(null);

  // Governance state from hook
  const {
    state,
    isLoading: stateLoading,
    fetchState,
    toggleGate,
    setPhase,
  } = useProjectState(id || null, token);

  // AIXORD SDK Client
  const {
    send: sdkSend,
  } = useAIXORDSDK({
    projectId: id || null,
    token: token || null,
    userId: user?.id || null,
    tier: settings.subscription.tier,
    keyMode: settings.subscription.keyMode,
    userApiKey: settings.subscription.keyMode === 'BYOK' ? getActiveApiKey()?.key : undefined,
    userApiProvider: settings.subscription.keyMode === 'BYOK' ? getActiveApiKey()?.provider : undefined,
    autoInit: true,
  });

  // Session Graph Model (AIXORD v4.4)
  const {
    sessions,
    activeSession,
    createSession,
    switchSession,
  } = useSessions({
    projectId: id || null,
    token: token || null,
    userId: user?.id || null,
  });

  // D10-D11: Session metrics from backend
  const [sessionMetrics, setSessionMetrics] = useState<import('../lib/api').SessionMetrics | null>(null);

  // Engineering governance (Part XIV)
  const engineering = useEngineering({
    projectId: id || null,
    token: token || null,
  });
  const [engineeringPanelOpen, setEngineeringPanelOpen] = useState(false);
  const [engineeringPanelSection, setEngineeringPanelSection] = useState<EngineeringSection>('sar');

  // Blueprint governance (L-BPX, L-IVL)
  const blueprint = useBlueprint({
    projectId: id || null,
    token: token || null,
  });
  const [blueprintPanelOpen, setBlueprintPanelOpen] = useState(false);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [workspaceChecked, setWorkspaceChecked] = useState(false);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchProject = useCallback(async () => {
    if (!id || !token) return;
    setProjectLoading(true);
    setProjectError(null);
    try {
      const data = await api.projects.get(id, token);
      setProject(data);
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setProjectLoading(false);
    }
  }, [id, token]);

  const fetchDecisions = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await api.decisions.list(id, token);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
    }
  }, [id, token]);

  const fetchEvidence = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await api.evidence.getTriad(id, token);
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
  }, [id, token]);

  const fetchImages = useCallback(async () => {
    if (!id || !token) return;
    try {
      // Fetch both user-uploaded images and GitHub evidence
      const [images, evidence] = await Promise.allSettled([
        api.images.list(id, token),
        api.evidence.list(id, token),
      ]);

      const evidenceItems: typeof recentEvidence = [];

      if (images.status === 'fulfilled') {
        const imgList = (images.value as any).images || [];
        // Fetch each image as blob with auth header to create displayable URLs
        const blobResults = await Promise.allSettled(
          imgList.map(async (img: any) => {
            const res = await fetch(api.images.getUrl(id, img.id), {
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
  }, [id, token]);

  const fetchGithubRepos = useCallback(async () => {
    if (!id || !token) return;
    try {
      const result = await api.github.listRepos(id, token);
      setGithubRepos((result as any).repos || []);
    } catch {
      // May not have GitHub connected
    }
  }, [id, token]);

  const fetchCCSStatus = useCallback(async () => {
    if (!id || !token) return;
    try {
      const status = await api.ccs.getStatus(id, token);
      setCcsStatus(status);
    } catch (err) {
      console.error('Failed to fetch CCS status:', err);
    }
  }, [id, token]);

  const fetchMessages = useCallback(async () => {
    if (!id || !token || !project) return;
    try {
      // Filter messages by active session if available
      const data = await api.messages.list(id, token, 100, 0, activeSession?.id);
      const messages: Message[] = data.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
        metadata: m.metadata as Message['metadata']
      }));

      // Calculate session totals from messages
      let totalCost = 0;
      let totalTokens = 0;
      messages.forEach(m => {
        if (m.metadata?.usage) {
          totalCost += m.metadata.usage.costUsd || 0;
          totalTokens += (m.metadata.usage.inputTokens || 0) + (m.metadata.usage.outputTokens || 0);
        }
      });
      setSessionCost(totalCost);
      setSessionTokens(totalTokens);

      setConversation(prev => prev ? {
        ...prev,
        messages,
        updatedAt: new Date()
      } : {
        id: `conv_${project.id}`,
        projectId: project.id,
        title: project.name,
        messages,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [id, token, project, activeSession]);

  // Re-fetch messages and metrics when active session changes
  useEffect(() => {
    if (project && activeSession) {
      fetchMessages();
      // D10: Fetch session metrics from backend
      if (id && token) {
        api.sessions.getMetrics(id, activeSession.id, token)
          .then(setSessionMetrics)
          .catch(() => setSessionMetrics(null));
      }
    }
  }, [activeSession?.id]);

  // Initialize conversation when project loads
  useEffect(() => {
    if (project && !conversation) {
      setConversation({
        id: `conv_${project.id}`,
        projectId: project.id,
        title: project.name,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        capsule: state ? {
          objective: state.project.objective || '',
          phase: state.session.phase as 'B' | 'P' | 'E' | 'R',
          constraints: state.reality.constraints,
          decisions: [],
          openQuestions: []
        } : undefined
      });
      fetchMessages();
    }
  }, [project, conversation, state, fetchMessages]);

  useEffect(() => {
    fetchProject();
    fetchDecisions();
    fetchCCSStatus();
    fetchEvidence();
    fetchImages();
    fetchGithubRepos();
    api.router.models().then(data => setAvailableModels(data.classes)).catch(console.error);
  }, [fetchProject, fetchDecisions, fetchCCSStatus, fetchEvidence, fetchImages, fetchGithubRepos]);

  // Auto-detect first-time workspace setup: show wizard if GA:ENV not passed
  useEffect(() => {
    if (state && id && token && !workspaceChecked) {
      setWorkspaceChecked(true);
      const envPassed = state.gates?.['GA:ENV'];
      if (!envPassed) {
        // Check if there's already a workspace binding server-side
        api.workspace.getStatus(id, token)
          .then(status => {
            if (!status.confirmed) {
              setShowWorkspaceWizard(true);
            }
          })
          .catch(() => {
            // No binding exists — show wizard for new projects
            setShowWorkspaceWizard(true);
          });
      }
    }
  }, [state, id, token, workspaceChecked]);

  // Cleanup blob URLs for evidence images on unmount
  useEffect(() => {
    return () => {
      recentEvidence.forEach((e) => {
        if (e.url.startsWith('blob:')) URL.revokeObjectURL(e.url);
      });
    };
  }, [recentEvidence]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Load blueprint data when tab is activated
  useEffect(() => {
    if (activeTab === 'blueprint' && id && token) {
      blueprint.loadScopes();
      blueprint.loadDeliverables();
      blueprint.loadSummary();
      blueprint.loadIntegrity();
    }
  }, [activeTab]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleTabClick = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const handleToggleGate = async (gateId: string) => {
    if (!state) return;
    try {
      const currentValue = state.gates[gateId] || false;
      await toggleGate(gateId, !currentValue);
    } catch (err) {
      console.error('Failed to toggle gate:', err);
    }
  };

  const handleSetPhase = async (phase: string) => {
    setPhaseError(null);
    try {
      await setPhase(phase);
    } catch (err) {
      if (err instanceof APIError && err.statusCode === 403) {
        const missing = (err as any).missingGates as string[] | undefined;
        setPhaseError(missing
          ? `${err.message} (missing: ${missing.join(', ')})`
          : err.message);
      } else {
        console.error('Failed to set phase:', err);
      }
    }
  };

  const handleWorkspaceComplete = useCallback(async (binding: WorkspaceBindingData) => {
    if (!id || !token) return;
    try {
      // Save binding to backend (convert null to undefined for API compatibility)
      await api.workspace.updateBinding(id, {
        folder_name: binding.folder_name ?? undefined,
        folder_template: binding.folder_template ?? undefined,
        permission_level: binding.permission_level,
        scaffold_generated: binding.scaffold_generated,
        github_connected: binding.github_connected,
        github_repo: binding.github_repo ?? undefined,
        binding_confirmed: binding.binding_confirmed,
      }, token);
      // Toggle GA:ENV and GA:FLD gates
      if (binding.folder_name) {
        await toggleGate('GA:FLD', true);
      }
      if (binding.binding_confirmed) {
        await toggleGate('GA:ENV', true);
      }
      setShowWorkspaceWizard(false);
    } catch (err) {
      console.error('Workspace setup failed:', err);
      // Still close wizard — binding was saved even if gate toggle failed
      setShowWorkspaceWizard(false);
    }
  }, [id, token, toggleGate]);

  const handleGitHubConnect = useCallback(async () => {
    if (!id || !token) return;
    try {
      const result = await api.github.connect(id, token);
      if (result.authorization_url) window.location.href = result.authorization_url;
    } catch (err) {
      console.error('GitHub connect failed:', err);
    }
  }, [id, token]);

  const handleGitHubDisconnect = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.github.disconnect(id, token);
      setGithubConnection(null);
    } catch (err) {
      console.error('GitHub disconnect failed:', err);
    }
  }, [id, token]);

  const handleCreateCCSIncident = useCallback(async (data: {
    credentialType: import('../lib/api').CredentialType;
    credentialName: string;
    exposureSource: import('../lib/api').ExposureSource;
    exposureDescription: string;
    impactAssessment: string;
    affectedSystems?: string[];
  }) => {
    if (!id || !token) return;
    try {
      await api.ccs.createIncident(id, data, token);
      setShowCCSCreate(false);
      await fetchCCSStatus();
    } catch (err) {
      console.error('Failed to create CCS incident:', err);
    }
  }, [id, token, fetchCCSStatus]);

  const handleGitHubSelectRepo = useCallback(async (repoOwner: string, repoName: string) => {
    if (!id || !token) return;
    try {
      await api.github.selectRepo(id, repoOwner, repoName, token);
      setGithubConnection({ connected: true, repo_owner: repoOwner, repo_name: repoName });
      await fetchEvidence();
    } catch (err) {
      console.error('Failed to select repo:', err);
    }
  }, [id, token, fetchEvidence]);

  const handleEvidenceSync = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.evidence.sync(id, token);
      await fetchEvidence();
      await fetchImages();
    } catch (err) {
      console.error('Evidence sync failed:', err);
    }
  }, [id, token, fetchEvidence, fetchImages]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (!id || !token) return;
    try {
      await api.images.delete(id, imageId, token);
      setRecentEvidence(prev => prev.filter(e => e.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }, [id, token]);

  // Bridge: api.messages.clear
  const handleClearMessages = useCallback(async () => {
    if (!id || !token) return;
    try {
      await api.messages.clear(id, token);
      setConversation(prev => prev ? { ...prev, messages: [], updatedAt: new Date() } : prev);
      setSessionCost(0);
      setSessionTokens(0);
    } catch (err) {
      console.error('Failed to clear messages:', err);
    }
  }, [id, token]);

  // Bridge: api.projects.update
  const handleUpdateProject = useCallback(async (data: { name?: string; objective?: string }) => {
    if (!id || !token) return;
    try {
      const updated = await api.projects.update(id, data, token);
      setProject(updated);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  }, [id, token]);

  // D9: Clipboard image paste handler
  const handlePasteImage = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    const image: PendingImage = {
      file,
      preview,
      evidenceType: 'SCREENSHOT',
      caption: '',
    };
    setPendingImages((prev) => [...prev, image]);
  }, []);

  // Image upload handlers
  const handleAddImage = useCallback((image: PendingImage) => {
    setPendingImages((prev) => [...prev, image]);
    setShowImageUpload(false);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleClearImages = useCallback(() => {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  // Send message handler
  const handleSendMessage = async (content: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => {
    if (!conversation || !user || !id || !project || !token) return;

    // Build full message content with attachments
    const attachmentContext = formatAttachmentsForContext(attachedFiles);
    const fullContent = content + attachmentContext;

    // Upload pending images
    const uploadedImages: Array<{ id: string; url: string; filename: string; evidenceType: string; caption?: string }> = [];
    if (pendingImages.length > 0) {
      for (const img of pendingImages) {
        try {
          const result = await api.images.upload(id, img.file, {
            evidenceType: img.evidenceType,
            caption: img.caption || undefined,
          }, token);
          uploadedImages.push({
            id: result.id,
            url: api.images.getUrl(id, result.id),
            filename: result.filename,
            evidenceType: result.evidence_type,
            caption: img.caption || undefined,
          });
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setPendingImages([]);
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: (attachedFiles.length > 0 || uploadedImages.length > 0) ? {
        attachments: attachedFiles.length > 0 ? attachedFiles.map((a) => ({
          name: a.file.name,
          path: a.file.path,
          size: a.file.size,
          includeContent: a.includeContent,
        })) : undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      } : undefined,
    };

    setAttachedFiles([]);

    setConversation((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date()
    } : prev);

    setChatLoading(true);

    try {
      // Save user message to backend
      await api.messages.create(id, {
        role: 'user',
        content,
        metadata: {},
        session_id: activeSession?.id,
      }, token);

      // Use AIXORD SDK for governed AI execution
      // Build session graph context for capsule enrichment (v4.4)
      const sessionGraph = activeSession ? {
        current: {
          number: activeSession.session_number,
          type: activeSession.session_type,
          messageCount: activeSession.message_count,
        },
        lineage: sessions
          .filter(s => s.id !== activeSession.id)
          .slice(-5)  // Last 5 prior sessions for context
          .map(s => ({
            number: s.session_number,
            type: s.session_type,
            edgeType: 'CONTINUES' as const,  // Simplified — Phase D+ will resolve actual edges
            summary: s.summary || undefined,
          })),
        total: sessions.length,
      } : undefined;

      const sdkResponse = await sdkSend({
        message: fullContent,
        mode,
        objective: project.objective || '',
        phase: state?.session.phase,
        constraints: state?.reality.constraints || [],
        decisions: decisions.map(d => d.summary),
        sessionId: activeSession?.id || `session_${state?.session.number || 1}`,
        maxOutputTokens: 4096,
        imageRefs: uploadedImages.length > 0 ? uploadedImages.map(i => ({
          id: i.id,
          filename: i.filename,
          evidenceType: i.evidenceType,
          projectId: id,
        })) : undefined,
        sessionGraph,
      });

      // Create assistant message
      const assistantMetadata = {
        model: sdkResponse.model,
        usage: {
          inputTokens: sdkResponse.usage.inputTokens,
          outputTokens: sdkResponse.usage.outputTokens,
          costUsd: sdkResponse.usage.costUsd,
          latencyMs: sdkResponse.usage.latencyMs
        },
        verification: sdkResponse.verification,
        phase: phaseToShort(state?.session.phase),
        enforcement: {
          gatesPassed: sdkResponse.enforcement.gatesPassed,
          gatesFailed: sdkResponse.enforcement.gatesFailed,
          aiExposureLevel: sdkResponse.enforcement.aiExposureLevel,
          wasRedacted: sdkResponse.enforcement.wasRedacted,
        }
      };

      const assistantContent = sdkResponse.status === 'SUCCESS'
        ? sdkResponse.content
        : `Error: ${sdkResponse.error || 'Unknown error'}`;

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: assistantMetadata
      };

      // Save assistant message to backend
      await api.messages.create(id, {
        role: 'assistant',
        content: assistantContent,
        metadata: assistantMetadata,
        session_id: activeSession?.id,
      }, token);

      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date()
      } : prev);

      // Update session metrics
      setSessionCost(prev => prev + sdkResponse.usage.costUsd);
      setSessionTokens(prev => prev + sdkResponse.usage.inputTokens + sdkResponse.usage.outputTokens);

    } catch (err) {
      console.error('Failed to send message:', err);

      let errorContent: string;
      if (err instanceof GateBlockedError) {
        const failedGates = err.gateResults.filter(g => !g.passed);
        const gateExplanations = failedGates.map(g => `- ${g.gate}: ${g.reason || 'Not completed'}`).join('\n');
        errorContent = `Setup Required\n\nSome project setup steps need to be completed before the AI can execute work.\n\nGates that need attention:\n${gateExplanations}\n\nOpen the Governance tab to review and complete the required gates.`;
      } else if (err instanceof AIExposureBlockedError) {
        errorContent = `AI Access Restricted\n\nThe current data classification restricts AI interaction.\n\n${err.reason || 'Please review the Data Classification settings.'}`;
      } else {
        errorContent = `Failed to get response: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }

      const errorMessage: Message = {
        id: generateId(),
        role: 'system',
        content: errorContent,
        timestamp: new Date()
      };

      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date()
      } : prev);
    } finally {
      setChatLoading(false);
    }
  };

  // New Session handler — uses Session Graph API
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const handleNewSession = () => {
    setShowNewSessionModal(true);
  };

  const handleCreateSession = async (opts: {
    sessionType: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => {
    const newSession = await createSession({
      sessionType: opts.sessionType,
      parentSessionId: opts.parentSessionId,
      edgeType: opts.edgeType,
    });

    if (newSession) {
      // Reset local conversation state for the new session
      setConversation({
        id: `conv_${id}_s${newSession.session_number}`,
        projectId: id || '',
        title: project?.name || '',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSessionCost(0);
      setSessionTokens(0);
      setShowNewSessionModal(false);

      // Refresh governance state from backend
      await fetchState();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isLoading = projectLoading || stateLoading;
  const currentPhase = state?.session.phase || 'BRAINSTORM';

  // Count completed gates
  const gatesComplete = state ? Object.values(state.gates).filter(Boolean).length : 0;
  const gatesTotal = state ? Object.keys(state.gates).length : 0;

  // ============================================================================
  // Render
  // ============================================================================

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Project not found</h1>
          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        projectName={project?.name}
        userEmail={user?.email}
        onLogout={handleLogout}
        onNewSession={handleNewSession}
        projectId={id}
        sessionNumber={activeSession?.session_number || state?.session.number}
      />

      {/* Ribbon */}
      <Ribbon activeTab={activeTab} onClose={() => setActiveTab(null)}>
        {activeTab === 'governance' && state && (
          <GovernanceRibbon
            currentPhase={currentPhase}
            onSetPhase={handleSetPhase}
            gates={state.gates}
            onToggleGate={handleToggleGate}
            isLoading={isLoading}
            phaseError={phaseError}
            onOpenWorkspaceSetup={() => setShowWorkspaceWizard(true)}
          />
        )}
        {activeTab === 'security' && id && token && (
          <SecurityRibbon
            projectId={id}
            token={token}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceRibbon
            isConnected={!!githubConnection?.connected}
            repoOwner={githubConnection?.repo_owner}
            repoName={githubConnection?.repo_name}
            lastSync={githubConnection?.last_sync}
            onConnect={handleGitHubConnect}
            onDisconnect={handleGitHubDisconnect}
            onSelectRepo={handleGitHubSelectRepo}
            onSync={handleEvidenceSync}
            repos={githubRepos}
            needsRepoSelection={githubConnection?.connected && (!githubConnection?.repo_name || githubConnection?.repo_name === 'PENDING')}
            recentEvidence={recentEvidence}
            onDeleteImage={handleDeleteImage}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'blueprint' && (
          <BlueprintRibbon
            summary={blueprint.summary}
            scopes={blueprint.scopes}
            deliverables={blueprint.deliverables}
            integrityReport={blueprint.integrityReport}
            isLoading={blueprint.isLoading}
            onOpenPanel={() => setBlueprintPanelOpen(true)}
            onRunValidation={async () => {
              await blueprint.runValidation();
              await blueprint.loadSummary();
            }}
            onDeleteScope={async (scopeId) => {
              await blueprint.deleteScope(scopeId);
            }}
            onDeleteDeliverable={async (deliverableId) => {
              await blueprint.deleteDeliverable(deliverableId);
            }}
          />
        )}
        {activeTab === 'engineering' && (
          <EngineeringRibbon
            compliance={engineering.compliance}
            isLoading={engineering.isLoading}
            onOpenPanel={(section) => {
              setEngineeringPanelSection((section as EngineeringSection) || 'sar');
              setEngineeringPanelOpen(true);
            }}
          />
        )}
        {activeTab === 'info' && project && id && token && (
          <InfoRibbon
            projectId={id}
            token={token}
            projectName={project.name}
            objective={project.objective}
            realityClassification={project.realityClassification}
            createdAt={project.createdAt}
            sessionNumber={activeSession?.session_number || state?.session.number || 1}
            sessionCost={sessionCost}
            sessionTokens={sessionTokens}
            messageCount={conversation?.messages.length || 0}
            sessionMetrics={sessionMetrics}
            availableModels={availableModels || undefined}
            sessions={sessions}
            activeSessionId={activeSession?.id}
            onSwitchSession={switchSession}
            onUpdateProject={handleUpdateProject}
          />
        )}
      </Ribbon>

      {/* CCS Report Button (when no active incident) */}
      {(!ccsStatus?.active_incident || ccsStatus?.GA_CCS === 0) && (
        <div className="px-4 py-1 flex justify-end">
          <button
            onClick={() => setShowCCSCreate(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Report Credential Incident
          </button>
        </div>
      )}

      {/* CCS Incident Banner */}
      {ccsStatus?.GA_CCS === 1 && ccsStatus.active_incident && (
        <CCSIncidentBanner
          incidentNumber={ccsStatus.active_incident.incident_number}
          phase={ccsStatus.active_incident.phase}
          credentialName={ccsStatus.active_incident.credential_name}
          credentialType={ccsStatus.active_incident.credential_type}
          onViewDetails={() => setShowCCSPanel(true)}
        />
      )}

      {/* Error Display */}
      {projectError && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{projectError}</p>
        </div>
      )}

      {/* Chat Area (Maximized) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Loading State */}
        {isLoading && !project && (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {/* Chat Messages */}
        {project && (
          <div className="flex-1 overflow-y-auto p-4">
            {(!conversation || conversation.messages.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h4 className="text-xl font-medium text-white mb-2">Start the conversation</h4>
                <p className="text-gray-400 text-sm max-w-md mb-4">
                  Type your message below. The AI will respond following AIXORD governance rules.
                </p>
                <div className="text-gray-500 text-xs">
                  Tip: Click the tabs above to access Governance, Evidence, and Project Info
                </div>
              </div>
            ) : (
              <>
                {conversation.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    token={token || undefined}
                  />
                ))}

                {/* Loading indicator */}
                {chatLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Pending Images Display */}
        {pendingImages.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-gray-400 text-xs shrink-0">Attached:</span>
              {pendingImages.map((img, index) => (
                <div key={index} className="relative group shrink-0">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-12 h-12 rounded object-cover border border-gray-700"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearImages}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar with Input */}
      <StatusBar
        phase={currentPhase}
        gatesComplete={gatesComplete}
        gatesTotal={gatesTotal}
        sessionCost={sessionCost}
        messageCount={conversation?.messages.length || 0}
        isLoading={chatLoading}
        onSendMessage={handleSendMessage}
        onImageClick={() => setShowImageUpload(true)}
        onPasteImage={handlePasteImage}
        onClearMessages={handleClearMessages}
        pendingImageCount={pendingImages.length}
        assistanceMode={settings.preferences.assistanceMode}
      />

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Attach Image</h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ImageUpload
              images={pendingImages}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
              onClear={handleClearImages}
              disabled={chatLoading}
            />
          </div>
        </div>
      )}

      {/* CCS Incident Panel */}
      {showCCSPanel && ccsStatus?.incident_id && id && token && (
        <CCSIncidentPanel
          projectId={id}
          incidentId={ccsStatus.incident_id}
          token={token}
          onClose={() => setShowCCSPanel(false)}
          onUpdate={() => fetchCCSStatus()}
        />
      )}

      {/* Engineering Governance Panel (Part XIV) */}
      {engineeringPanelOpen && id && token && (
        <EngineeringPanel
          projectId={id}
          token={token}
          initialSection={engineeringPanelSection}
          onClose={() => setEngineeringPanelOpen(false)}
          onUpdate={() => engineering.loadCompliance()}
        />
      )}

      {/* Blueprint Governance Panel (L-BPX, L-IVL) */}
      {blueprintPanelOpen && id && token && (
        <BlueprintPanel
          projectId={id}
          token={token}
          onClose={() => setBlueprintPanelOpen(false)}
          onUpdate={async () => {
            await blueprint.loadScopes();
            await blueprint.loadDeliverables();
            await blueprint.loadSummary();
          }}
        />
      )}

      {/* Workspace Setup Wizard (Unified GA:ENV + GA:FLD) */}
      {showWorkspaceWizard && id && token && (
        <WorkspaceSetupWizard
          projectId={id}
          onComplete={handleWorkspaceComplete}
          onSkip={() => setShowWorkspaceWizard(false)}
          githubConnection={githubConnection}
          onGitHubConnect={handleGitHubConnect}
          onGitHubDisconnect={handleGitHubDisconnect}
          onGitHubSelectRepo={handleGitHubSelectRepo}
          githubRepos={githubRepos}
        />
      )}

      {/* CCS Create Incident Modal */}
      {showCCSCreate && (
        <CCSCreateIncidentModal
          onConfirm={handleCreateCCSIncident}
          onCancel={() => setShowCCSCreate(false)}
        />
      )}

      {/* New Session Modal (AIXORD v4.4 Session Graph) */}
      {showNewSessionModal && (
        <NewSessionModal
          currentSession={activeSession}
          sessions={sessions}
          onConfirm={handleCreateSession}
          onCancel={() => setShowNewSessionModal(false)}
        />
      )}
    </div>
  );
}

export default Project;
