/**
 * WorkspaceSetupWizard — 3-step unified GA:ENV + GA:FLD workspace binding
 *
 * Step 1: Local Workspace — folder selection + template + scaffold generation
 * Step 2: Version Control — optional GitHub linkage
 * Step 3: Confirmation — summary + confirm environment
 *
 * Reuses FolderPicker.tsx and GitHubConnect.tsx components.
 */

import { useState, useCallback } from 'react';
import { FolderPicker } from './FolderPicker';
import { GitHubConnect } from './GitHubConnect';
import { FOLDER_TEMPLATES, getTemplateById, type FolderTemplate } from '../lib/workspaceTemplates';
import { generateScaffold, type ScaffoldResult } from '../lib/scaffoldGenerator';
import {
  isFileSystemAccessSupported,
  fileSystemStorage,
  type LinkedFolder,
} from '../lib/fileSystem';
import type { GitHubConnection, GitHubMode } from '../lib/api';

interface WorkspaceSetupWizardProps {
  projectId: string;
  onComplete: (binding: WorkspaceBindingData) => void;
  onSkip: () => void;
  // GitHub integration props (from Project.tsx)
  githubConnection: GitHubConnection | null;
  onGitHubConnect: () => void;
  onGitHubDisconnect: () => void;
  onGitHubSelectRepo?: (repoOwner: string, repoName: string) => void;
  githubRepos?: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
}

export interface WorkspaceBindingData {
  folder_name: string | null;
  folder_template: string | null;
  permission_level: string;
  scaffold_generated: boolean;
  github_connected: boolean;
  github_repo: string | null;
  binding_confirmed: boolean;
  // Scaffold count reporting (Gap 2)
  scaffold_item_count?: number;
  scaffold_skipped_count?: number;
  scaffold_error_count?: number;
  scaffold_paths_written?: string[];
}

const STEPS = [
  { id: 1, label: 'Workspace', icon: '📁' },
  { id: 2, label: 'Version Control', icon: '🔗' },
  { id: 3, label: 'Confirm', icon: '✓' },
];

export function WorkspaceSetupWizard({
  projectId,
  onComplete,
  onSkip,
  githubConnection,
  onGitHubConnect,
  onGitHubDisconnect,
  onGitHubSelectRepo,
  githubRepos = [],
}: WorkspaceSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [linkedFolder, setLinkedFolder] = useState<LinkedFolder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [scaffoldResult, setScaffoldResult] = useState<ScaffoldResult | null>(null);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [scaffoldError, setScaffoldError] = useState<string | null>(null);

  // Step 1 handlers
  const handleFolderLinked = useCallback((folder: LinkedFolder) => {
    setLinkedFolder(folder);
  }, []);

  const handleFolderUnlinked = useCallback(() => {
    setLinkedFolder(null);
    setScaffoldResult(null);
    setSelectedTemplate(null);
  }, []);

  const handleGenerateScaffold = useCallback(async () => {
    if (!linkedFolder || !selectedTemplate) return;

    const template = getTemplateById(selectedTemplate);
    if (!template) return;

    setIsScaffolding(true);
    setScaffoldError(null);

    try {
      // Get the stored handle
      const stored = await fileSystemStorage.getHandle(projectId);
      if (!stored) {
        throw new Error('Folder handle not found. Please reselect the folder.');
      }

      const result = await generateScaffold(stored.handle, template.structure);
      setScaffoldResult(result);

      if (result.errors.length > 0) {
        setScaffoldError(`${result.errors.length} error(s) during scaffold generation`);
      }
    } catch (err) {
      setScaffoldError(err instanceof Error ? err.message : 'Scaffold generation failed');
    } finally {
      setIsScaffolding(false);
    }
  }, [linkedFolder, selectedTemplate, projectId]);

  const handleConfirm = useCallback(() => {
    const binding: WorkspaceBindingData = {
      folder_name: linkedFolder?.name ?? null,
      folder_template: selectedTemplate,
      permission_level: 'readwrite',
      scaffold_generated: !!scaffoldResult && scaffoldResult.errors.length === 0,
      github_connected: githubConnection?.connected ?? false,
      github_repo: githubConnection?.repo_name && githubConnection.repo_name !== 'PENDING'
        ? `${githubConnection.repo_owner}/${githubConnection.repo_name}`
        : null,
      binding_confirmed: true,
      // Scaffold count reporting (Gap 2)
      scaffold_item_count: scaffoldResult?.created ?? 0,
      scaffold_skipped_count: scaffoldResult?.skipped ?? 0,
      scaffold_error_count: scaffoldResult?.errors.length ?? 0,
    };
    onComplete(binding);
  }, [linkedFolder, selectedTemplate, scaffoldResult, githubConnection, onComplete]);

  const fsSupported = isFileSystemAccessSupported();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Workspace Setup</h2>
          <p className="text-sm text-gray-400 mt-1">
            Bind your project environment for governed workspace access
          </p>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-gray-800/50">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    s.id === step
                      ? 'bg-violet-600 text-white'
                      : s.id < step
                      ? 'bg-green-500/20 text-green-400 cursor-pointer hover:bg-green-500/30'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  <span>{s.id < step ? '✓' : s.icon}</span>
                  <span>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${s.id < step ? 'bg-green-500/50' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <StepWorkspace
              projectId={projectId}
              fsSupported={fsSupported}
              linkedFolder={linkedFolder}
              selectedTemplate={selectedTemplate}
              scaffoldResult={scaffoldResult}
              isScaffolding={isScaffolding}
              scaffoldError={scaffoldError}
              onFolderLinked={handleFolderLinked}
              onFolderUnlinked={handleFolderUnlinked}
              onSelectTemplate={setSelectedTemplate}
              onGenerateScaffold={handleGenerateScaffold}
            />
          )}
          {step === 2 && (
            <StepVersionControl
              projectId={projectId}
              githubConnection={githubConnection}
              onConnect={onGitHubConnect}
              onDisconnect={onGitHubDisconnect}
              onSelectRepo={onGitHubSelectRepo}
              repos={githubRepos}
            />
          )}
          {step === 3 && (
            <StepConfirmation
              linkedFolder={linkedFolder}
              selectedTemplate={selectedTemplate}
              scaffoldResult={scaffoldResult}
              githubConnection={githubConnection}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Set up later
          </button>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Confirm Environment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 1: Local Workspace
// ============================================================================

function StepWorkspace({
  projectId,
  fsSupported,
  linkedFolder,
  selectedTemplate,
  scaffoldResult,
  isScaffolding,
  scaffoldError,
  onFolderLinked,
  onFolderUnlinked,
  onSelectTemplate,
  onGenerateScaffold,
}: {
  projectId: string;
  fsSupported: boolean;
  linkedFolder: LinkedFolder | null;
  selectedTemplate: string | null;
  scaffoldResult: ScaffoldResult | null;
  isScaffolding: boolean;
  scaffoldError: string | null;
  onFolderLinked: (f: LinkedFolder) => void;
  onFolderUnlinked: () => void;
  onSelectTemplate: (id: string) => void;
  onGenerateScaffold: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-1">Select Project Folder</h3>
        <p className="text-sm text-gray-400 mb-4">
          Choose a local folder to use as your governed project workspace.
          AIXORD will have scoped, consent-based access to this folder only.
        </p>
        <FolderPicker
          projectId={projectId}
          onFolderLinked={onFolderLinked}
          onFolderUnlinked={onFolderUnlinked}
        />
      </div>

      {/* Template Selection — shown after folder is linked */}
      {linkedFolder && (
        <div>
          <h3 className="text-white font-medium mb-1">Folder Structure Template</h3>
          <p className="text-sm text-gray-400 mb-4">
            Choose a template to scaffold your project folder with AIXORD governance directories.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FOLDER_TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selectedTemplate === t.id}
                onSelect={() => onSelectTemplate(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scaffold Generation */}
      {linkedFolder && selectedTemplate && selectedTemplate !== 'user-controlled' && !scaffoldResult && (
        <div>
          <button
            onClick={onGenerateScaffold}
            disabled={isScaffolding}
            className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isScaffolding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Generating scaffold...
              </>
            ) : (
              <>
                <span>📁</span>
                Generate Folder Structure
              </>
            )}
          </button>
          {scaffoldError && (
            <p className="text-red-400 text-sm mt-2">{scaffoldError}</p>
          )}
        </div>
      )}

      {/* Scaffold Result */}
      {scaffoldResult && (
        <div className={`p-3 rounded-lg border ${
          scaffoldResult.errors.length === 0
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <p className={`text-sm font-medium ${
            scaffoldResult.errors.length === 0 ? 'text-green-400' : 'text-amber-400'
          }`}>
            Scaffold {scaffoldResult.errors.length === 0 ? 'Complete' : 'Partial'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Created {scaffoldResult.created} item(s), skipped {scaffoldResult.skipped} existing
          </p>
          {scaffoldResult.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              {scaffoldResult.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User-controlled selected — no scaffold needed */}
      {linkedFolder && selectedTemplate === 'user-controlled' && (
        <div className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400">
            User-controlled mode: only the <code className="text-violet-400">aixord/</code> governance
            directory will be created. You manage the rest of the folder structure.
          </p>
        </div>
      )}

      {!fsSupported && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-400 text-sm">
            Your browser doesn't support the File System Access API. Use Chrome, Edge, or Opera for full workspace binding.
            You can skip this step and set up later.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Template Card
// ============================================================================

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: FolderTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border text-left transition-all ${
        selected
          ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
          : 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{template.icon}</span>
        <span className="text-white font-medium text-sm">{template.name}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{template.description}</p>
      {selected && (
        <div className="mt-2 text-xs text-violet-400 flex items-center gap-1">
          <span>✓</span> Selected
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Step 2: Version Control
// ============================================================================

function StepVersionControl({
  projectId,
  githubConnection,
  onConnect,
  onDisconnect,
  onSelectRepo,
  onUpgradeMode,
  repos,
  projectType,
}: {
  projectId: string;
  githubConnection: GitHubConnection | null;
  onConnect: (mode?: GitHubMode) => void;
  onDisconnect: () => void;
  onSelectRepo?: (repoOwner: string, repoName: string) => void;
  onUpgradeMode?: () => void;
  repos?: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
  projectType?: string;
}) {
  const isWorkspaceSync = githubConnection?.github_mode === 'WORKSPACE_SYNC';
  const defaultMode: GitHubMode = projectType === 'software' ? 'WORKSPACE_SYNC' : 'READ_ONLY';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-1">Connect Version Control</h3>
        <p className="text-sm text-gray-400 mb-4">
          {isWorkspaceSync || defaultMode === 'WORKSPACE_SYNC' ? (
            <>Link a GitHub repository. D4-CHAT will commit scaffold files and code to a feature branch (<code className="text-green-400 text-xs">aixord/*</code>).</>
          ) : (
            <>Optionally link a GitHub repository for evidence tracking. Commits, PRs, and releases will feed into the Reconciliation Triad automatically.</>
          )}
        </p>
        <p className="text-xs text-gray-500 mb-4 italic">
          This step is optional. You can skip it and connect later from the Evidence tab.
        </p>
      </div>

      <GitHubConnect
        projectId={projectId}
        connection={githubConnection}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onSelectRepo={onSelectRepo}
        onUpgradeMode={onUpgradeMode}
        repos={repos}
        defaultMode={defaultMode}
      />
    </div>
  );
}

// ============================================================================
// Step 3: Confirmation
// ============================================================================

function StepConfirmation({
  linkedFolder,
  selectedTemplate,
  scaffoldResult,
  githubConnection,
}: {
  linkedFolder: LinkedFolder | null;
  selectedTemplate: string | null;
  scaffoldResult: ScaffoldResult | null;
  githubConnection: GitHubConnection | null;
}) {
  const template = selectedTemplate ? getTemplateById(selectedTemplate) : null;
  const hasGitHub = githubConnection?.connected && githubConnection?.repo_name && githubConnection.repo_name !== 'PENDING';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-1">Environment Summary</h3>
        <p className="text-sm text-gray-400 mb-4">
          Review your workspace binding before confirming.
        </p>
      </div>

      <div className="space-y-3">
        {/* Workspace */}
        <SummaryRow
          label="Workspace"
          value={linkedFolder?.name ?? 'Not linked'}
          status={linkedFolder ? 'success' : 'warning'}
          detail={linkedFolder ? 'Read-Write access' : 'Limited mode — no local governance artifacts'}
        />

        {/* Template */}
        <SummaryRow
          label="Template"
          value={template?.name ?? 'None selected'}
          status={template ? 'success' : 'neutral'}
          detail={template ? `${template.icon} ${template.description}` : undefined}
        />

        {/* Scaffold */}
        <SummaryRow
          label="Scaffold"
          value={
            scaffoldResult
              ? scaffoldResult.errors.length === 0
                ? `Generated (${scaffoldResult.created} items)`
                : `Partial (${scaffoldResult.errors.length} errors)`
              : selectedTemplate === 'user-controlled'
              ? 'User-controlled'
              : 'Not generated'
          }
          status={
            scaffoldResult && scaffoldResult.errors.length === 0
              ? 'success'
              : scaffoldResult
              ? 'warning'
              : 'neutral'
          }
        />

        {/* GitHub */}
        <SummaryRow
          label="Repository"
          value={
            hasGitHub
              ? `${githubConnection!.repo_owner}/${githubConnection!.repo_name}`
              : 'Not connected'
          }
          status={hasGitHub ? 'success' : 'neutral'}
          detail={hasGitHub ? 'Read-only evidence tracking' : 'Can connect later from Evidence tab'}
        />

        {/* Gates */}
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Gates that will be activated:</p>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-mono ${
              linkedFolder ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
            }`}>
              GA:ENV {linkedFolder ? '✓' : '○'}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-mono ${
              linkedFolder ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
            }`}>
              GA:FLD {linkedFolder ? '✓' : '○'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  status,
  detail,
}: {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'neutral';
  detail?: string;
}) {
  const statusColors = {
    success: 'text-green-400',
    warning: 'text-amber-400',
    neutral: 'text-gray-400',
  };

  const borderColors = {
    success: 'border-green-500/20',
    warning: 'border-amber-500/20',
    neutral: 'border-gray-700/50',
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-800/30 border ${borderColors[status]} rounded-lg`}>
      <div>
        <p className="text-sm text-gray-300 font-medium">{label}</p>
        {detail && <p className="text-xs text-gray-500 mt-0.5">{detail}</p>}
      </div>
      <span className={`text-sm font-medium ${statusColors[status]}`}>{value}</span>
    </div>
  );
}

export default WorkspaceSetupWizard;
