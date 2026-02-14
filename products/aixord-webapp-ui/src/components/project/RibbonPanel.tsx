/**
 * RibbonPanel Component
 * 
 * Renders the appropriate ribbon content based on the active tab.
 * Wraps all ribbon types (Governance, Blueprint, Security, Evidence, Engineering, Info).
 */

import { GovernanceRibbon } from '../ribbon/GovernanceRibbon';
import { InfoRibbon } from '../ribbon/InfoRibbon';
import { EvidenceRibbon } from '../ribbon/EvidenceRibbon';
import { EngineeringRibbon } from '../ribbon/EngineeringRibbon';
import { SecurityRibbon } from '../ribbon/SecurityRibbon';
import BlueprintRibbon from '../ribbon/BlueprintRibbon';
import { TaskBoard } from '../TaskBoard';
import { EscalationBanner } from '../EscalationBanner';
import { ProjectMemoryPanel } from '../ProjectMemoryPanel';
import { GovernanceDashboard } from '../GovernanceDashboard';
import { Ribbon } from '../layout/Ribbon';
import type { Project } from '../../lib/api';

interface RibbonPanelProps {
  activeTab: string | null;
  onClose: () => void;
  
  // Common props
  projectId: string;
  token: string;
  project: Project | null;
  isLoading: boolean;
  
  // Governance ribbon
  currentPhase: string;
  onSetPhase: (phase: string) => void;
  gates: Record<string, boolean>;
  onToggleGate: (gateId: string, currentValue: boolean) => void;
  phaseError: string | null;
  onOpenWorkspaceSetup: () => void;
  onFinalizePhase: (phase: string) => void;
  isFinalizing: boolean;
  finalizeReady: boolean;
  
  // Blueprint ribbon
  blueprint: {
    summary: any;
    scopes: any[];
    deliverables: any[];
    integrityReport: any;
    isLoading: boolean;
    loadScopes: () => Promise<void>;
    loadDeliverables: () => Promise<void>;
    loadSummary: () => Promise<void>;
    runValidation: () => Promise<void>;
    deleteScope: (id: string) => Promise<void>;
    deleteDeliverable: (id: string) => Promise<void>;
  };
  onOpenBlueprintPanel: () => void;
  
  // Evidence ribbon
  githubConnection: any;
  recentEvidence: Array<{ id: string; url: string; filename: string; evidenceType: string }>;
  githubRepos: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
  onGitHubConnect: () => void;
  onGitHubDisconnect: () => void;
  onGitHubSelectRepo: (owner: string, name: string) => void;
  onEvidenceSync: () => void;
  onDeleteImage: (id: string) => void;
  
  // Engineering ribbon
  engineering: {
    compliance: any;
    isLoading: boolean;
  };
  onOpenEngineeringPanel: (section: string) => void;
  
  // Tasks tab
  tdl: {
    taskBoard: any;
    assignments: any[];
    escalations: any[];
    isLoading: boolean;
    startAssignment: (id: string) => Promise<void>;
    submitAssignment: (id: string, data: any) => Promise<void>;
    acceptAssignment: (id: string) => Promise<void>;
    rejectAssignment: (id: string, data: any) => Promise<void>;
    blockAssignment: (id: string, data: any) => Promise<void>;
    resolveEscalation: (id: string, data: any) => Promise<void>;
  };
  
  // Memory tab
  continuity: {
    capsule: any;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    pinItem: (type: string, id: string) => Promise<void>;
    unpinItem: (type: string, id: string) => Promise<void>;
  };
  
  // Info tab
  sessionNumber: number;
  sessionCost: number;
  sessionTokens: number;
  messageCount: number;
  sessionMetrics: any;
  availableModels?: Record<string, Array<{ provider: string; model: string }>>;
  sessions: any[];
  activeSessionId?: string;
  onSwitchSession: (id: string) => void;
  onUpdateProject: (data: { name?: string; objective?: string }) => Promise<any>;
}

export function RibbonPanel(props: RibbonPanelProps) {
  return (
    <Ribbon activeTab={props.activeTab} onClose={props.onClose}>
      {props.activeTab === 'governance' && (
        <GovernanceRibbon
          currentPhase={props.currentPhase}
          onSetPhase={props.onSetPhase}
          gates={props.gates}
          onToggleGate={(gateId) => props.onToggleGate(gateId, props.gates[gateId] || false)}
          isLoading={props.isLoading}
          phaseError={props.phaseError}
          onOpenWorkspaceSetup={props.onOpenWorkspaceSetup}
          onFinalizePhase={props.onFinalizePhase}
          isFinalizing={props.isFinalizing}
          finalizeReady={props.finalizeReady}
        />
      )}
      {props.activeTab === 'security' && (
        <SecurityRibbon
          projectId={props.projectId}
          token={props.token}
          isLoading={props.isLoading}
        />
      )}
      {props.activeTab === 'evidence' && (
        <EvidenceRibbon
          isConnected={!!props.githubConnection?.connected}
          repoOwner={props.githubConnection?.repo_owner}
          repoName={props.githubConnection?.repo_name}
          lastSync={props.githubConnection?.last_sync}
          onConnect={props.onGitHubConnect}
          onDisconnect={props.onGitHubDisconnect}
          onSelectRepo={props.onGitHubSelectRepo}
          onSync={props.onEvidenceSync}
          repos={props.githubRepos}
          needsRepoSelection={props.githubConnection?.connected && (!props.githubConnection?.repo_name || props.githubConnection?.repo_name === 'PENDING')}
          recentEvidence={props.recentEvidence}
          onDeleteImage={props.onDeleteImage}
          isLoading={props.isLoading}
        />
      )}
      {props.activeTab === 'blueprint' && (
        <BlueprintRibbon
          summary={props.blueprint.summary}
          scopes={props.blueprint.scopes}
          deliverables={props.blueprint.deliverables}
          integrityReport={props.blueprint.integrityReport}
          isLoading={props.blueprint.isLoading}
          onOpenPanel={props.onOpenBlueprintPanel}
          onRunValidation={async () => {
            await props.blueprint.runValidation();
            await props.blueprint.loadSummary();
          }}
          onDeleteScope={props.blueprint.deleteScope}
          onDeleteDeliverable={props.blueprint.deleteDeliverable}
        />
      )}
      {props.activeTab === 'engineering' && (
        <EngineeringRibbon
          compliance={props.engineering.compliance}
          isLoading={props.engineering.isLoading}
          onOpenPanel={props.onOpenEngineeringPanel}
        />
      )}
      {props.activeTab === 'math-governance' && (
        <GovernanceDashboard
          projectId={props.projectId}
          token={props.token}
        />
      )}
      {props.activeTab === 'tasks' && (
        <div className="p-4">
          <EscalationBanner
            escalations={props.tdl.escalations}
            onResolve={async (escalationId, resolution) => {
              await props.tdl.resolveEscalation(escalationId, { resolution });
            }}
          />
          <TaskBoard
            taskBoard={props.tdl.taskBoard}
            assignments={props.tdl.assignments}
            isLoading={props.tdl.isLoading}
            onStart={props.tdl.startAssignment}
            onSubmit={async (assignmentId) => {
              const a = props.tdl.assignments.find(x => x.id === assignmentId);
              if (a) await props.tdl.submitAssignment(assignmentId, { submission_summary: a.progress_notes || 'Submitted for review' });
            }}
            onAccept={props.tdl.acceptAssignment}
            onReject={async (assignmentId) => {
              await props.tdl.rejectAssignment(assignmentId, { review_notes: 'Needs revision' });
            }}
            onBlock={async (assignmentId) => {
              await props.tdl.blockAssignment(assignmentId, { blocked_reason: 'Blocked by Director' });
            }}
          />
        </div>
      )}
      {props.activeTab === 'memory' && (
        <ProjectMemoryPanel
          capsule={props.continuity.capsule}
          loading={props.continuity.loading}
          error={props.continuity.error}
          onRefresh={props.continuity.refresh}
          onPin={props.continuity.pinItem}
          onUnpin={(pinId) => props.continuity.unpinItem('pin', pinId)}
        />
      )}
      {props.activeTab === 'info' && props.project && (
        <InfoRibbon
          projectId={props.projectId}
          token={props.token}
          projectName={props.project.name}
          objective={props.project.objective}
          realityClassification={props.project.realityClassification}
          createdAt={props.project.createdAt}
          sessionNumber={props.sessionNumber}
          sessionCost={props.sessionCost}
          sessionTokens={props.sessionTokens}
          messageCount={props.messageCount}
          sessionMetrics={props.sessionMetrics}
          availableModels={props.availableModels}
          sessions={props.sessions}
          activeSessionId={props.activeSessionId}
          onSwitchSession={props.onSwitchSession}
          onUpdateProject={props.onUpdateProject}
        />
      )}
    </Ribbon>
  );
}
