/**
 * Project Workspace Page (D4-CHAT Three-Panel Layout)
 *
 * Three-panel workspace layout:
 * ┌───────────────┬─────────────────────────────┬───────────────────┐
 * │  GOVERNANCE   │       CHAT INTERFACE        │   PROJECT INFO    │
 * │   (1/4)       │         (2/4)               │      (1/4)        │
 * └───────────────┴─────────────────────────────┴───────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { useProjectState } from '../hooks/useApi';
import { api, phaseToShort, type Project as ProjectType, type Decision, type CCSGateStatus } from '../lib/api';
import { useAIXORDSDK, GateBlockedError, AIExposureBlockedError } from '../lib/sdk';
import { GateTracker } from '../components/GateTracker';
import { PhaseSelector } from '../components/PhaseSelector';
import { DecisionLog } from '../components/DecisionLog';
import { ActivityLog, type ActivityItem } from '../components/ActivityLog';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageBubble } from '../components/chat/MessageBubble';
import { FolderPicker } from '../components/FolderPicker';
import { FileExplorer } from '../components/FileExplorer';
import { FileAttachment, formatAttachmentsForContext, type AttachedFile } from '../components/FileAttachment';
import { DataClassification } from '../components/DataClassification';
import { SecurityGates } from '../components/SecurityGates';
import { ReconciliationTriad } from '../components/ReconciliationTriad';
import { KnowledgeArtifacts } from '../components/KnowledgeArtifacts';
import { useKnowledgeArtifacts } from '../hooks/useKnowledgeArtifacts';
import { CCSIncidentBanner } from '../components/CCSIncidentBanner';
import { CCSIncidentPanel } from '../components/CCSIncidentPanel';
import type { LinkedFolder } from '../lib/fileSystem';
import type { KnowledgeArtifactType, DerivationSource } from '../lib/api';
import type { Message, Conversation } from '../components/chat/types';
import type { DataClassification as DataClassificationType, SecurityGates as SecurityGatesType, ReconciliationTriad as ReconciliationTriadType } from '../lib/api';

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Types for Decision Creation (used by DecisionLog)
// ============================================================================

interface DecisionCreateData {
  type: Decision['type'];
  summary: string;
  phase?: Decision['phase'];
  rationale?: string;
}

// ============================================================================
// Main Project Component
// ============================================================================

export function Project() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const { settings, getActiveApiKey } = useUserSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Project data
  const [project, setProject] = useState<ProjectType | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Project edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', objective: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Clear chat modal state
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Available models state
  const [availableModels, setAvailableModels] = useState<Record<string, Array<{ provider: string; model: string }>> | null>(null);

  // Decisions data
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);

  // Activity log state (generated from decisions, messages, and state changes)
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // View toggle for left panel (governance vs activity log vs knowledge)
  const [leftPanelView, setLeftPanelView] = useState<'governance' | 'activity' | 'knowledge'>('governance');

  // Chat state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Cost estimate state
  // Session cost tracking - accumulates cost from all messages
  const [sessionCost, setSessionCost] = useState<number>(0);

  // Local file system state
  const [linkedFolder, setLinkedFolder] = useState<LinkedFolder | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [rightPanelView, setRightPanelView] = useState<'info' | 'files'>('info');

  // CCS (Credential Compromise & Sanitization) state - PATCH-CCS-01
  const [ccsStatus, setCcsStatus] = useState<CCSGateStatus | null>(null);
  const [, setCcsLoading] = useState(false); // Loading state for future use
  const [showCCSPanel, setShowCCSPanel] = useState(false);

  // Governance state from hook
  const {
    state,
    isLoading: stateLoading,
    error: stateError,
    toggleGate,
    setPhase,
  } = useProjectState(id || null, token);

  // Knowledge artifacts state (GKDL-01)
  const {
    artifacts,
    isLoading: artifactsLoading,
    createArtifact,
    approveArtifact,
    deleteArtifact,
    generateCSR,
  } = useKnowledgeArtifacts({
    projectId: id || null,
    token,
    autoFetch: true,
  });

  // AIXORD SDK Client (D3 Integration - L-FX Binding)
  const {
    send: sdkSend,
    checkGates: _sdkCheckGates,
    isInitialized: _sdkInitialized,
    error: _sdkError,
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

  // Fetch project
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

  // Fetch decisions
  const fetchDecisions = useCallback(async () => {
    if (!id || !token) return;
    setDecisionsLoading(true);
    try {
      const data = await api.decisions.list(id, token);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
    } finally {
      setDecisionsLoading(false);
    }
  }, [id, token]);

  // Fetch CCS status (PATCH-CCS-01)
  const fetchCCSStatus = useCallback(async () => {
    if (!id || !token) return;
    setCcsLoading(true);
    try {
      const status = await api.ccs.getStatus(id, token);
      setCcsStatus(status);
    } catch (err) {
      console.error('Failed to fetch CCS status:', err);
    } finally {
      setCcsLoading(false);
    }
  }, [id, token]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!id || !token || !project) return;
    try {
      const data = await api.messages.list(id, token);
      // Transform backend messages to frontend Message format
      const messages: Message[] = data.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt),
        metadata: m.metadata as Message['metadata']
      }));

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
  }, [id, token, project]);

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
      // Fetch existing messages after initializing conversation
      fetchMessages();
    }
  }, [project, conversation, state, fetchMessages]);

  useEffect(() => {
    fetchProject();
    fetchDecisions();
    fetchCCSStatus(); // PATCH-CCS-01: Fetch CCS status on mount
    // Fetch available models on mount
    api.router.models().then(data => setAvailableModels(data.classes)).catch(console.error);
  }, [fetchProject, fetchDecisions, fetchCCSStatus]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Initialize edit form when project loads
  useEffect(() => {
    if (project) {
      setEditForm({ name: project.name, objective: project.objective });
    }
  }, [project]);

  // Handlers
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
    try {
      await setPhase(phase);
    } catch (err) {
      console.error('Failed to set phase:', err);
    }
  };

  const handleAddDecision = async (decision: DecisionCreateData) => {
    if (!id || !token) return;
    const newDecision = await api.decisions.create(id, decision, token);
    setDecisions((prev) => [...prev, newDecision]);

    // Add activity for the new decision
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'approval',
      action: 'recorded a decision',
      description: `${decision.type}: ${decision.summary}`,
      actor: user?.email || 'User',
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Add activity when phase changes
  const handleSetPhaseWithActivity = async (phase: string) => {
    const oldPhase = state?.session.phase;
    await handleSetPhase(phase);

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'phase_change',
      action: 'changed phase',
      description: `${oldPhase || 'Unknown'} → ${phase}`,
      actor: user?.email || 'User',
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Add activity when gate is toggled
  const handleToggleGateWithActivity = async (gateId: string) => {
    const wasChecked = state?.gates[gateId] || false;
    await handleToggleGate(gateId);

    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'gate_toggle',
      action: wasChecked ? 'unchecked gate' : 'passed gate',
      description: `Gate ${gateId} ${wasChecked ? 'unchecked' : 'passed'}`,
      actor: user?.email || 'User',
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Project edit handler
  const handleEditProject = async () => {
    if (!id || !token || !editForm.name.trim()) return;
    setIsEditing(true);
    setEditError(null);
    try {
      await api.projects.update(id, {
        name: editForm.name,
        objective: editForm.objective
      }, token);
      // Update local state
      setProject(prev => prev ? { ...prev, name: editForm.name, objective: editForm.objective } : prev);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsEditing(false);
    }
  };

  // Clear chat handler
  const handleClearChat = async () => {
    if (!id || !token) return;
    setIsClearing(true);
    try {
      await api.messages.clear(id, token);
      setConversation(prev => prev ? { ...prev, messages: [], updatedAt: new Date() } : prev);
      setSessionCost(0); // Reset session cost
      setShowClearChatModal(false);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // Note: Cost estimate feature (handleEstimateCost) will be added in future iteration
  // with debounced input tracking for real-time cost preview

  // v4.3 Handlers for Data Classification, Security Gates, and Reconciliation
  const handleUpdateDataClassification = async (classification: DataClassificationType) => {
    if (!id || !token || !state) return;
    try {
      await api.state.update(id, {
        capsule: {
          ...state,
          data_classification: classification,
        }
      }, token);
    } catch (err) {
      console.error('Failed to update data classification:', err);
    }
  };

  const handleToggleSecurityGate = async (gateId: keyof SecurityGatesType) => {
    if (!id || !token || !state?.securityGates) return;
    try {
      const newGates = {
        ...state.securityGates,
        [gateId]: !state.securityGates[gateId],
      };
      await api.state.update(id, {
        capsule: {
          ...state,
          security_gates: newGates,
        }
      }, token);
    } catch (err) {
      console.error('Failed to toggle security gate:', err);
    }
  };

  const handleUpdateReconciliation = async (reconciliation: ReconciliationTriadType) => {
    if (!id || !token || !state) return;
    try {
      await api.state.update(id, {
        capsule: {
          ...state,
          reconciliation: reconciliation,
        }
      }, token);
    } catch (err) {
      console.error('Failed to update reconciliation:', err);
    }
  };

  // CCS Handlers (PATCH-CCS-01)
  const handleCCSPanelClose = () => {
    setShowCCSPanel(false);
    // Refresh CCS status after panel closes
    fetchCCSStatus();
  };

  const handleCCSIncidentResolved = () => {
    // Add activity for CCS incident resolution
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type: 'gate_toggle',
      action: 'resolved CCS incident',
      description: `GA:CCS gate released - credential sanitization complete`,
      actor: user?.email || 'User',
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev]);
    // Refresh CCS status
    fetchCCSStatus();
  };

  // File attachment handlers
  const handleFolderLinked = useCallback((folder: LinkedFolder) => {
    setLinkedFolder(folder);
  }, []);

  const handleFolderUnlinked = useCallback(() => {
    setLinkedFolder(null);
    setAttachedFiles([]);
  }, []);

  const handleAttachFiles = useCallback((newFiles: AttachedFile[]) => {
    setAttachedFiles((prev) => {
      // Replace if same file path, otherwise append
      const existingPaths = new Set(prev.map((f) => f.file.path));
      const toAdd = newFiles.filter((f) => !existingPaths.has(f.file.path));
      const toUpdate = newFiles.filter((f) => existingPaths.has(f.file.path));

      return [
        ...prev.map((p) => {
          const update = toUpdate.find((u) => u.file.path === p.file.path);
          return update || p;
        }),
        ...toAdd,
      ];
    });
  }, []);

  const handleRemoveAttachment = useCallback((file: AttachedFile) => {
    setAttachedFiles((prev) => prev.filter((f) => f.file.path !== file.file.path));
  }, []);

  const handleClearAttachments = useCallback(() => {
    setAttachedFiles([]);
  }, []);

  const handleSendMessage = async (content: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => {
    if (!conversation || !user || !id || !project || !token) return;

    // Build full message content with attachments
    const attachmentContext = formatAttachmentsForContext(attachedFiles);
    const fullContent = content + attachmentContext;

    // Add user message to UI immediately (show original content)
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: attachedFiles.length > 0 ? {
        attachments: attachedFiles.map((a) => ({
          name: a.file.name,
          path: a.file.path,
          size: a.file.size,
          includeContent: a.includeContent,
        })),
      } : undefined,
    };

    // Clear attachments after sending
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
        metadata: {}
      }, token);

      // Use AIXORD SDK for governed AI execution (D3 Integration)
      // Per L-FX: Formula binding ensures governance enforcement
      // Per L-SPG3, L-SPG5: Gate checks for data classification and AI exposure
      const sdkResponse = await sdkSend({
        message: fullContent,
        mode,
        objective: project.objective || '',
        phase: state?.session.phase,
        constraints: state?.reality.constraints || [],
        decisions: decisions.map(d => d.summary),
        sessionId: `session_${state?.session.number || 1}`,
        maxOutputTokens: 4096,
      });

      // Create assistant message from SDK response
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
        // SDK governance metadata (D3)
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
        metadata: assistantMetadata
      }, token);

      setConversation((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date()
      } : prev);

      // Update session cost
      setSessionCost(prev => prev + sdkResponse.usage.costUsd);

    } catch (err) {
      console.error('Failed to send message:', err);

      // Handle SDK-specific errors with governance context
      // FIX 3: Plain text only (no markdown) — chat doesn't render markdown
      let errorContent: string;
      if (err instanceof GateBlockedError) {
        const failedGates = err.gateResults.filter(g => !g.passed);
        const gateExplanations = failedGates.map(g => {
          const gateNames: Record<string, string> = {
            'GP': 'General Purpose',
            'GS:DC': 'Data Classification',
            'GS:AI': 'AI Compliance',
            'GS:DP': 'Data Protection',
            'GS:AC': 'Access Control',
            'GS:JR': 'Jurisdiction',
            'GS:RT': 'Retention Policy',
          };
          const friendlyName = gateNames[g.gate] || g.gate;
          return `• ${friendlyName}: ${g.reason || 'Not completed'}`;
        }).join('\n');

        errorContent = `Setup Required\n\n` +
          `Some project setup steps need to be completed before the AI can execute work.\n\n` +
          `Gates that need attention:\n${gateExplanations}\n\n` +
          `Please check the Governance panel on the left to review and complete the required gates.`;
      } else if (err instanceof AIExposureBlockedError) {
        const exposureLevelNames: Record<string, string> = {
          'PUBLIC': 'Public',
          'INTERNAL': 'Internal Only',
          'CONFIDENTIAL': 'Confidential',
          'RESTRICTED': 'Restricted',
          'PROHIBITED': 'Not Allowed',
        };
        const friendlyLevel = exposureLevelNames[err.exposureLevel] || err.exposureLevel;
        errorContent = `AI Access Restricted\n\n` +
          `The current data classification (${friendlyLevel}) restricts AI interaction.\n\n` +
          `${err.reason || 'Please review the Data Classification settings in the Governance panel.'}`;
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

  // Combined loading state
  const isLoading = projectLoading || stateLoading;

  // Error state
  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl text-white mb-4">Project not found</h1>
          <Link to="/dashboard" className="text-violet-400 hover:text-violet-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Projects
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">{project?.name || 'Loading...'}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{project?.name || 'Project'}</h1>
            {project && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Edit project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
          {state && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                Session <span className="text-white font-medium">#{state.session.number}</span>
              </span>
              <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs">
                {state.session.phase}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CCS Incident Banner (PATCH-CCS-01) - Show when GA:CCS is active */}
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

      {/* Loading State */}
      {isLoading && !project && (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {/* Three-Panel Layout */}
      {project && (
        <div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden">
          {/* LEFT PANEL: Governance (1/4) */}
          <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
            {/* Panel Toggle */}
            <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={() => setLeftPanelView('governance')}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  leftPanelView === 'governance'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Governance
              </button>
              <button
                onClick={() => setLeftPanelView('knowledge')}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  leftPanelView === 'knowledge'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Knowledge
              </button>
              <button
                onClick={() => setLeftPanelView('activity')}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  leftPanelView === 'activity'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Activity
              </button>
            </div>

            {leftPanelView === 'governance' ? (
              <>
                {/* Phase Selector */}
                {state ? (
                  <PhaseSelector
                    currentPhase={state.session.phase}
                    onSetPhase={handleSetPhaseWithActivity}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-2">Phase</h3>
                    <p className="text-gray-500 text-sm">
                      {stateError || 'Loading governance state...'}
                    </p>
                  </div>
                )}

                {/* Gate Tracker */}
                {state ? (
                  <GateTracker
                    gates={state.gates}
                    onPassGate={handleToggleGateWithActivity}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-2">Gates</h3>
                    <p className="text-gray-500 text-sm">Loading gates...</p>
                  </div>
                )}

                {/* Enhanced Decision Log */}
                <DecisionLog
                  decisions={decisions}
                  isLoading={decisionsLoading}
                  onAddDecision={handleAddDecision}
                />

                {/* v4.3 Components */}
                {state && (
                  <>
                    {/* Data Classification (SPG-01) */}
                    <DataClassification
                      classification={state.dataClassification}
                      onUpdate={handleUpdateDataClassification}
                      isLoading={stateLoading}
                    />

                    {/* Security Gates (SPG-01) - Show when data classification has sensitive data */}
                    {state.dataClassification && (
                      <SecurityGates
                        gates={state.securityGates}
                        onToggle={handleToggleSecurityGate}
                        isLoading={stateLoading}
                      />
                    )}

                    {/* Reconciliation Triad (GCP-01) - Show in REVIEW phase */}
                    {(state.session.phase === 'REVIEW' || state.reconciliation) && (
                      <ReconciliationTriad
                        reconciliation={state.reconciliation}
                        onUpdate={handleUpdateReconciliation}
                        isLoading={stateLoading}
                        phase={state.session.phase}
                      />
                    )}
                  </>
                )}
              </>
            ) : leftPanelView === 'knowledge' ? (
              /* Knowledge Artifacts View (GKDL-01) */
              <KnowledgeArtifacts
                artifacts={artifacts}
                isLoading={artifactsLoading}
                sessionCount={state?.session.number || 0}
                onCreateArtifact={async (data) => {
                  await createArtifact({
                    type: data.type as KnowledgeArtifactType,
                    title: data.title,
                    content: data.content,
                    summary: data.summary,
                    derivationSource: data.derivationSource as DerivationSource,
                  });
                }}
                onApproveArtifact={async (artifactId) => {
                  await approveArtifact(artifactId);
                }}
                onDeleteArtifact={async (artifactId) => {
                  await deleteArtifact(artifactId);
                }}
                onGenerateCSR={async () => {
                  await generateCSR();
                }}
              />
            ) : (
              /* Activity Log View */
              <ActivityLog
                activities={activities}
                isLoading={false}
                showFilters={true}
                onAddComment={async (comment) => {
                  const newActivity: ActivityItem = {
                    id: `act_${Date.now()}`,
                    type: 'comment',
                    action: 'added a comment',
                    description: comment,
                    actor: user?.email || 'User',
                    timestamp: new Date().toISOString()
                  };
                  setActivities((prev) => [newActivity, ...prev]);
                }}
              />
            )}
          </div>

          {/* CENTER PANEL: Chat Interface (2/4) */}
          <div className="col-span-2 flex flex-col bg-gray-900/30 rounded-xl overflow-hidden border border-gray-700/50">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">AIXORD Chat</h3>
                  <p className="text-xs text-gray-500">
                    {conversation?.messages.length || 0} messages
                    {state && ` • Phase: ${state.session.phase}`}
                    {sessionCost > 0 && ` • Session: $${sessionCost.toFixed(4)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {conversation && conversation.messages.length > 0 && (
                    <button
                      onClick={() => setShowClearChatModal(true)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Clear conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  {state && (
                    <span className="px-2 py-1 text-xs rounded bg-violet-500/20 text-violet-300">
                      {state.session.phase === 'BRAINSTORM' && 'Brainstorm'}
                      {state.session.phase === 'PLAN' && 'Plan'}
                      {state.session.phase === 'EXECUTE' && 'Execute'}
                      {state.session.phase === 'REVIEW' && 'Review'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {(!conversation || conversation.messages.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <h4 className="text-lg font-medium text-white mb-1">Start the conversation</h4>
                  <p className="text-gray-400 text-sm max-w-md">
                    Type your message below. The AI will respond following AIXORD governance rules.
                  </p>
                </div>
              ) : (
                <>
                  {conversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
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

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700/50">
              <ChatInput
                onSend={handleSendMessage}
                disabled={chatLoading}
                placeholder="Type your message... (Shift+Enter for new line)"
                attachmentSlot={
                  <FileAttachment
                    folderHandle={linkedFolder?.handle || null}
                    folderName={linkedFolder?.name || ''}
                    attachedFiles={attachedFiles}
                    onAttach={handleAttachFiles}
                    onRemove={handleRemoveAttachment}
                    onClear={handleClearAttachments}
                  />
                }
              />
            </div>
          </div>

          {/* RIGHT PANEL: Project Info / Files (1/4) */}
          <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
            {/* Panel Toggle */}
            <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={() => setRightPanelView('info')}
                className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
                  rightPanelView === 'info'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setRightPanelView('files')}
                className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
                  rightPanelView === 'files'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Files
              </button>
            </div>

            {rightPanelView === 'info' ? (
              <>
                {/* Project Info Card */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 text-sm">Objective</span>
                  <p className="text-white text-sm">{project.objective}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Reality Classification</span>
                  <p className="text-white text-sm capitalize">{project.realityClassification.toLowerCase()}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created</span>
                  <p className="text-white text-sm">{formatDate(project.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Session Info Card - D-012 FIX: Added empty state, D-009 FIX: Responsive width */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 overflow-hidden">
              <h3 className="text-lg font-semibold text-white mb-4">Session Info</h3>
              {state ? (
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-gray-500">Session Number</span>
                    <span className="text-white">{state.session.number}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-gray-500">Messages</span>
                    {/* RC-7 FIX: Use conversation.messages.length as source of truth */}
                    <span className="text-white">{conversation?.messages.length || 0}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-gray-500 shrink-0">Started</span>
                    <span className="text-white text-xs truncate max-w-[150px]" title={new Date(state.session.startedAt).toLocaleString()}>
                      {new Date(state.session.startedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No session activity yet</p>
                  <p className="text-gray-600 text-xs mt-1">Start a conversation to begin</p>
                </div>
              )}
            </div>

            {/* Reality Constraints */}
            {state && state.reality.constraints.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Constraints</h3>
                <ul className="space-y-2">
                  {state.reality.constraints.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      <span className="text-white">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Models */}
            {availableModels && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Available Models</h3>
                <div className="space-y-3">
                  {Object.entries(availableModels).slice(0, 3).map(([tier, models]) => (
                    <div key={tier}>
                      <span className="text-xs text-gray-500 uppercase">{tier}</span>
                      <div className="mt-1 space-y-1">
                        {models.slice(0, 2).map((m, i) => (
                          <div key={i} className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            {m.provider}/{m.model}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                {/* Quick Actions */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      className="w-full px-3 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                      onClick={() => setShowEditModal(true)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Project
                    </button>
                    <button
                      className="w-full px-3 py-2 bg-gray-900/50 hover:bg-gray-900 text-gray-300 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                      onClick={() => setShowClearChatModal(true)}
                      disabled={!conversation || conversation.messages.length === 0}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Chat
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Files Panel */
              <>
                {/* Folder Picker */}
                <FolderPicker
                  projectId={id}
                  onFolderLinked={handleFolderLinked}
                  onFolderUnlinked={handleFolderUnlinked}
                />

                {/* File Explorer (when folder is linked) */}
                {linkedFolder && (
                  <div className="flex-1 min-h-[300px]">
                    <FileExplorer
                      folderHandle={linkedFolder.handle}
                      folderName={linkedFolder.name}
                      selectedFiles={attachedFiles.map((a) => a.file)}
                      onFilesSelect={(files) => {
                        // Convert selected files to attachments
                        const newAttachments: AttachedFile[] = files.map((f) => ({
                          file: f,
                          includeContent: false,
                        }));
                        setAttachedFiles(newAttachments);
                      }}
                      multiSelect={true}
                      showPreview={false}
                    />
                  </div>
                )}

                {/* Help text when no folder linked */}
                {!linkedFolder && (
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-dashed border-gray-700/50 text-center">
                    <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      Link a local folder to browse and attach files to your chat messages.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && project && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Project</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {editError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{editError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objective
                </label>
                <textarea
                  value={editForm.objective}
                  onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditProject}
                  disabled={isEditing || !editForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      {showClearChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Clear Conversation?</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              All {conversation?.messages.length || 0} messages will be permanently deleted. The project and governance state will be preserved.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearChatModal(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isClearing ? 'Clearing...' : 'Clear Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CCS Incident Management Panel (PATCH-CCS-01) */}
      {showCCSPanel && ccsStatus?.incident_id && id && token && (
        <CCSIncidentPanel
          projectId={id}
          incidentId={ccsStatus.incident_id}
          token={token}
          onClose={handleCCSPanelClose}
          onUpdate={() => {
            handleCCSIncidentResolved();
            fetchCCSStatus();
          }}
        />
      )}
    </div>
  );
}

export default Project;
