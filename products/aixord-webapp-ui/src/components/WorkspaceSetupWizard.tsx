/**
 * WorkspaceSetupWizard — 3-step unified GA:ENV + GA:FLD workspace binding
 *
 * Step 1: Local Workspace — folder selection + template + scaffold generation
 * Step 2: Version Control — optional GitHub linkage
 * Step 3: Confirmation — summary + confirm environment
 *
 * Reuses FolderPicker.tsx and GitHubConnect.tsx components.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { FolderPicker } from './FolderPicker';
import { GitHubConnect } from './GitHubConnect';
import { FOLDER_TEMPLATES, getTemplateById, type FolderTemplate } from '../lib/workspaceTemplates';
import { generateScaffold, type ScaffoldResult } from '../lib/scaffoldGenerator';
import {
  isFileSystemAccessSupported,
  fileSystemStorage,
  verifyPermission,
  isHandleUsable,
  type LinkedFolder,
} from '../lib/fileSystem';
import { api, type GitHubConnection, type GitHubMode } from '../lib/api';
import {
  syncGitHubToWorkspace,
  pushLocalToGitHub,
  type GitHubSyncProgress,
  type GitHubSyncResult,
  type GitHubPushResult,
} from '../lib/githubSync';

interface WorkspaceSetupWizardProps {
  projectId: string;
  token: string;
  projectType?: string;
  projectName?: string;
  onComplete: (binding: WorkspaceBindingData) => void;
  onSkip: () => void;
  // GitHub integration props (from Project.tsx)
  githubConnection: GitHubConnection | null;
  onGitHubConnect: (mode?: GitHubMode) => void;
  onGitHubDisconnect: () => void;
  onGitHubSelectRepo?: (repoOwner: string, repoName: string) => void;
  onRefreshGitHubConnection?: () => void;
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
  // GitHub sync reporting (GITHUB-SYNC-01)
  github_sync_count?: number;
  // GitHub push reporting (ENV-SYNC-01)
  github_push_count?: number;
  github_push_sha?: string;
  github_push_branch?: string;
}

const STEPS = [
  { id: 1, label: 'Workspace', icon: '📁' },
  { id: 2, label: 'Version Control', icon: '🔗' },
  { id: 3, label: 'Confirm', icon: '✓' },
];

/** Session key for persisting wizard intent across OAuth redirect */
const WIZARD_INTENT_KEY = 'd4chat_wizard_intent';
const WIZARD_INTENT_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

interface WizardIntent {
  projectId: string;
  step: number;
  folderName: string | null;
  templateId: string | null;
  scaffoldCreated: number;
  scaffoldSkipped: number;
  timestamp: number;
}

export function WorkspaceSetupWizard({
  projectId,
  token,
  projectType,
  projectName,
  onComplete,
  onSkip,
  githubConnection,
  onGitHubConnect,
  onGitHubDisconnect,
  onGitHubSelectRepo,
  onRefreshGitHubConnection,
  githubRepos = [],
}: WorkspaceSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [linkedFolder, setLinkedFolder] = useState<LinkedFolder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [scaffoldResult, setScaffoldResult] = useState<ScaffoldResult | null>(null);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [scaffoldError, setScaffoldError] = useState<string | null>(null);

  // GitHub sync state (GITHUB-SYNC-01)
  const [syncProgress, setSyncProgress] = useState<GitHubSyncProgress | null>(null);
  const [syncResult, setSyncResult] = useState<GitHubSyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncAbortRef = useRef<AbortController | null>(null);

  // GitHub push state (ENV-SYNC-01: Local→GitHub push)
  const [pushProgress, setPushProgress] = useState<GitHubSyncProgress | null>(null);
  const [pushResult, setPushResult] = useState<GitHubPushResult | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const pushAbortRef = useRef<AbortController | null>(null);

  // S1-T1: Auto-create repo state
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [createRepoError, setCreateRepoError] = useState<string | null>(null);
  const [createdRepoName, setCreatedRepoName] = useState<string | null>(null);
  const autoCreateTriggered = useRef(false);

  // T3: Folder permission state for post-OAuth-redirect verification
  // null = not checked yet, true = usable, false = needs re-link
  const [folderPermissionOk, setFolderPermissionOk] = useState<boolean | null>(null);

  // T3: Verify folder handle is still usable after OAuth redirect
  // After full page navigation, FSAPI handles from IndexedDB may become stale.
  useEffect(() => {
    async function checkFolderHandle() {
      if (!linkedFolder) {
        // Try to load from IndexedDB (handle may exist from Step 1)
        try {
          const stored = await fileSystemStorage.getHandle(projectId);
          if (stored) {
            const usable = await isHandleUsable(stored.handle);
            if (usable) {
              const granted = await verifyPermission(stored.handle, true);
              if (granted) {
                setLinkedFolder(stored);
                setFolderPermissionOk(true);
                return;
              }
            }
            // Handle exists but is stale
            setLinkedFolder(stored);
            setFolderPermissionOk(false);
            return;
          }
        } catch {
          // IndexedDB error — treat as no folder
        }
        setFolderPermissionOk(false);
        return;
      }

      try {
        const usable = await isHandleUsable(linkedFolder.handle);
        if (usable) {
          const granted = await verifyPermission(linkedFolder.handle, true);
          setFolderPermissionOk(granted);
        } else {
          setFolderPermissionOk(false);
        }
      } catch {
        setFolderPermissionOk(false);
      }
    }
    if (step === 2) {
      checkFolderHandle();
    }
  }, [step, linkedFolder, projectId]);

  // T3: Handler for folder re-link after stale handle
  const handleFolderRelinked = useCallback((folder: LinkedFolder) => {
    setLinkedFolder(folder);
    setFolderPermissionOk(true);
  }, []);

  // S1-T2: Restore wizard intent from sessionStorage after OAuth redirect
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WIZARD_INTENT_KEY);
      if (!raw) return;
      sessionStorage.removeItem(WIZARD_INTENT_KEY);
      const intent: WizardIntent = JSON.parse(raw);
      // Validate: correct project, not expired
      if (intent.projectId !== projectId) return;
      if (Date.now() - intent.timestamp > WIZARD_INTENT_MAX_AGE_MS) return;
      // Restore state and advance to Step 2
      if (intent.step >= 2) setStep(2);
      if (intent.templateId) setSelectedTemplate(intent.templateId);
      if ((intent.scaffoldCreated + (intent.scaffoldSkipped ?? 0)) > 0) {
        setScaffoldResult({ created: intent.scaffoldCreated, skipped: intent.scaffoldSkipped ?? 0, errors: [] });
      }
      // Note: linkedFolder cannot be serialized (FSAPI handles persist separately via IndexedDB).
      // The folder will be re-detected by FolderPicker's own persistence.
    } catch {
      // Corrupt intent — ignore
    }
  }, [projectId]);

  // S1-T2: Save wizard intent to sessionStorage before OAuth redirect
  const handleGitHubConnectWithPersist = useCallback((mode?: GitHubMode) => {
    try {
      const intent: WizardIntent = {
        projectId,
        step: 2,
        folderName: linkedFolder?.name ?? null,
        templateId: selectedTemplate,
        scaffoldCreated: scaffoldResult?.created ?? 0,
        scaffoldSkipped: scaffoldResult?.skipped ?? 0,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(WIZARD_INTENT_KEY, JSON.stringify(intent));
    } catch {
      // sessionStorage unavailable — continue without persistence
    }
    onGitHubConnect(mode);
  }, [projectId, linkedFolder, selectedTemplate, scaffoldResult, onGitHubConnect]);

  // S1-T1: Auto-create GitHub repo after OAuth return for greenfield WORKSPACE_SYNC projects
  useEffect(() => {
    if (autoCreateTriggered.current) return;
    if (step !== 2) return;
    if (!githubConnection?.connected) return;
    // Only when no repo selected yet (PENDING state after OAuth)
    if (githubConnection.repo_name && githubConnection.repo_name !== 'PENDING') return;
    // Only for WORKSPACE_SYNC mode
    if (githubConnection.github_mode !== 'WORKSPACE_SYNC') return;
    // Only for greenfield (scaffold was generated — created or skipped items exist)
    if (!scaffoldResult || (scaffoldResult.created + scaffoldResult.skipped) === 0) return;
    // Need a project name for the repo
    if (!projectName) return;

    autoCreateTriggered.current = true;
    setIsCreatingRepo(true);
    setCreateRepoError(null);

    const slug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || 'project';

    const tryCreate = async (name: string, attempt = 0): Promise<void> => {
      try {
        const result = await api.github.createRepo(
          projectId,
          name,
          token,
          `D4-CHAT workspace for ${projectName}`,
          true
        );
        setCreatedRepoName(result.repo.full_name);
        setIsCreatingRepo(false);
        // Refresh connection so githubConnection updates with the new repo
        onRefreshGitHubConnection?.();
      } catch (err: unknown) {
        // 422 = name collision → retry with suffix
        const status = (err as { statusCode?: number })?.statusCode ?? (err as { status?: number })?.status;
        if (status === 422 && attempt < 3) {
          await tryCreate(`${slug}-${attempt + 1}`, attempt + 1);
        } else {
          const msg = err instanceof Error ? err.message : 'Failed to create repository';
          console.error('[S1] createRepo failed:', { status, message: msg, err });
          setCreateRepoError(msg);
          setIsCreatingRepo(false);
        }
      }
    };

    tryCreate(slug);
  }, [step, githubConnection, scaffoldResult, projectName, projectId, token, onRefreshGitHubConnection]);

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

  // GitHub sync handlers (GITHUB-SYNC-01)
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncResult(null);
    setSyncProgress(null);

    const abort = new AbortController();
    syncAbortRef.current = abort;

    try {
      const result = await syncGitHubToWorkspace(
        projectId,
        token,
        setSyncProgress,
        { signal: abort.signal }
      );
      setSyncResult(result);
    } finally {
      setIsSyncing(false);
      syncAbortRef.current = null;
    }
  }, [projectId, token, isSyncing]);

  const handleCancelSync = useCallback(() => {
    syncAbortRef.current?.abort();
  }, []);

  // ENV-SYNC-01: Push local workspace files to GitHub (for Greenfield projects)
  const handlePush = useCallback(async () => {
    if (isPushing) return;
    setIsPushing(true);
    setPushResult(null);
    setPushProgress(null);

    const abort = new AbortController();
    pushAbortRef.current = abort;

    try {
      const result = await pushLocalToGitHub(
        projectId,
        token,
        setPushProgress,
        { signal: abort.signal }
      );
      setPushResult(result);
    } finally {
      setIsPushing(false);
      pushAbortRef.current = null;
    }
  }, [projectId, token, isPushing]);

  const handleCancelPush = useCallback(() => {
    pushAbortRef.current?.abort();
  }, []);

  // Auto-trigger sync/push when conditions are met in WORKSPACE_SYNC mode:
  // S1-T3: Greenfield (scaffold generated locally) → push to GitHub
  //        Existing repo (no scaffold) → pull from GitHub
  const autoSyncTriggered = useRef(false);

  // S1-T1: Reset auto-sync trigger when a new repo is created
  // (allows the push chain to fire after auto-create completes)
  useEffect(() => {
    if (createdRepoName) {
      autoSyncTriggered.current = false;
    }
  }, [createdRepoName]);
  useEffect(() => {
    if (autoSyncTriggered.current) return;
    if (step !== 2) return;
    if (!linkedFolder) return;
    if (folderPermissionOk !== true) return; // T6: Gate on folder permission
    if (!githubConnection?.connected) return;
    if (!githubConnection.repo_name || githubConnection.repo_name === 'PENDING') return;
    if (githubConnection.github_mode !== 'WORKSPACE_SYNC') return;

    const hasScaffoldLocally = !!scaffoldResult && scaffoldResult.errors.length === 0;

    if (hasScaffoldLocally) {
      // Greenfield: push scaffold to GitHub (not pull)
      if (isPushing || pushResult) return;
      autoSyncTriggered.current = true;
      const timer = setTimeout(() => {
        handlePush();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Existing repo: pull from GitHub to local
      if (isSyncing || syncResult) return;
      autoSyncTriggered.current = true;
      const timer = setTimeout(() => {
        handleSync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, linkedFolder, folderPermissionOk, githubConnection, scaffoldResult, isSyncing, syncResult, isPushing, pushResult, handleSync, handlePush]);

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
      scaffold_item_count: (scaffoldResult?.created ?? 0) + (scaffoldResult?.skipped ?? 0),
      scaffold_skipped_count: scaffoldResult?.skipped ?? 0,
      scaffold_error_count: scaffoldResult?.errors.length ?? 0,
      // GitHub sync reporting (GITHUB-SYNC-01)
      github_sync_count: syncResult?.synced ?? 0,
      // GitHub push reporting (ENV-SYNC-01)
      github_push_count: pushResult?.filesCommitted ?? 0,
      github_push_sha: pushResult?.commitSha,
      github_push_branch: pushResult?.branch,
    };
    onComplete(binding);
  }, [linkedFolder, selectedTemplate, scaffoldResult, githubConnection, syncResult, pushResult, onComplete]);

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
              onConnect={handleGitHubConnectWithPersist}
              onDisconnect={onGitHubDisconnect}
              onSelectRepo={onGitHubSelectRepo}
              repos={githubRepos}
              projectType={projectType}
              // GitHub sync props (GITHUB-SYNC-01)
              hasLinkedFolder={!!linkedFolder}
              isSyncing={isSyncing}
              syncProgress={syncProgress}
              syncResult={syncResult}
              onSync={handleSync}
              onCancelSync={handleCancelSync}
              // GitHub push props (ENV-SYNC-01)
              hasScaffold={!!scaffoldResult && scaffoldResult.errors.length === 0}
              isPushing={isPushing}
              pushProgress={pushProgress}
              pushResult={pushResult}
              onPush={handlePush}
              onCancelPush={handleCancelPush}
              // S1-T1: Auto-create repo props
              isCreatingRepo={isCreatingRepo}
              createdRepoName={createdRepoName}
              createRepoError={createRepoError}
              onRetryCreateRepo={() => {
                autoCreateTriggered.current = false;
                setCreateRepoError(null);
              }}
              // T3: Folder re-link props
              folderPermissionOk={folderPermissionOk}
              onFolderRelinked={handleFolderRelinked}
            />
          )}
          {step === 3 && (
            <StepConfirmation
              linkedFolder={linkedFolder}
              selectedTemplate={selectedTemplate}
              scaffoldResult={scaffoldResult}
              githubConnection={githubConnection}
              syncResult={syncResult}
              pushResult={pushResult}
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
  // GitHub sync props (GITHUB-SYNC-01)
  hasLinkedFolder,
  isSyncing,
  syncProgress,
  syncResult,
  onSync,
  onCancelSync,
  // GitHub push props (ENV-SYNC-01)
  hasScaffold,
  isPushing,
  pushProgress,
  pushResult,
  onPush,
  onCancelPush,
  // S1-T1: Auto-create repo props
  isCreatingRepo,
  createdRepoName,
  createRepoError,
  onRetryCreateRepo,
  // T3: Folder re-link props
  folderPermissionOk,
  onFolderRelinked,
}: {
  projectId: string;
  githubConnection: GitHubConnection | null;
  onConnect: (mode?: GitHubMode) => void;
  onDisconnect: () => void;
  onSelectRepo?: (repoOwner: string, repoName: string) => void;
  onUpgradeMode?: () => void;
  repos?: Array<{ owner: string; name: string; full_name: string; private: boolean }>;
  projectType?: string;
  // GitHub sync props (GITHUB-SYNC-01)
  hasLinkedFolder?: boolean;
  isSyncing?: boolean;
  syncProgress?: GitHubSyncProgress | null;
  syncResult?: GitHubSyncResult | null;
  onSync?: () => void;
  onCancelSync?: () => void;
  // GitHub push props (ENV-SYNC-01)
  hasScaffold?: boolean;
  isPushing?: boolean;
  pushProgress?: GitHubSyncProgress | null;
  pushResult?: GitHubPushResult | null;
  onPush?: () => void;
  onCancelPush?: () => void;
  // S1-T1: Auto-create repo props
  isCreatingRepo?: boolean;
  createdRepoName?: string | null;
  createRepoError?: string | null;
  onRetryCreateRepo?: () => void;
  // T3: Folder re-link props
  folderPermissionOk?: boolean | null;
  onFolderRelinked?: (folder: LinkedFolder) => void;
}) {
  const isWorkspaceSync = githubConnection?.github_mode === 'WORKSPACE_SYNC';
  const isSoftwareProject = projectType === 'software';
  const defaultMode: GitHubMode = isSoftwareProject ? 'WORKSPACE_SYNC' : 'READ_ONLY';

  // Show sync UI when: GitHub connected + repo selected + workspace folder linked
  // S1-T4: Hide pull section for greenfield projects (scaffold exists)
  const hasRepo = githubConnection?.connected && githubConnection?.repo_name && githubConnection.repo_name !== 'PENDING';
  const showSyncSection = hasRepo && hasLinkedFolder && !hasScaffold;

  // Show push UI when: WORKSPACE_SYNC + scaffold generated locally (Greenfield project)
  const showPushSection = hasRepo && isWorkspaceSync && hasScaffold;

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
        lockedMode={isSoftwareProject ? 'WORKSPACE_SYNC' : undefined}
        autoCreatePending={isCreatingRepo}
      />

      {/* S1-T1: Repo creation status */}
      {createdRepoName && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-sm font-medium text-green-400">Repository Created</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <code className="text-green-400">{createdRepoName}</code> — private repository ready for scaffold push.
          </p>
        </div>
      )}
      {createRepoError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <span className="text-red-400">✕</span>
            <span className="text-sm font-medium text-red-400">Repo Creation Failed</span>
          </div>
          <p className="text-xs text-red-300/70 mt-1">{createRepoError}</p>
          {onRetryCreateRepo && (
            <button
              onClick={onRetryCreateRepo}
              className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* GitHub Sync Section (GITHUB-SYNC-01) */}
      {showSyncSection && folderPermissionOk === true && (
        <div className="mt-4 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📥</span>
            <h4 className="text-sm font-medium text-white">Sync Repository Files</h4>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Download source files from <code className="text-green-400">{githubConnection!.repo_owner}/{githubConnection!.repo_name}</code> to
            your local workspace so the AI can analyze your full codebase.
          </p>

          {/* Ready state — show sync button */}
          {!isSyncing && !syncResult && (
            <button
              onClick={onSync}
              className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Sync Files from GitHub
            </button>
          )}

          {/* Syncing state — progress bar */}
          {isSyncing && syncProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{syncProgress.message}</span>
                {syncProgress.total > 0 && (
                  <span className="text-gray-500">{syncProgress.current}/{syncProgress.total}</span>
                )}
              </div>
              {syncProgress.total > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((syncProgress.current / syncProgress.total) * 100)}%` }}
                  />
                </div>
              )}
              {syncProgress.currentFile && (
                <p className="text-xs text-gray-500 truncate">{syncProgress.currentFile}</p>
              )}
              <button
                onClick={onCancelSync}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Cancel sync
              </button>
            </div>
          )}

          {/* Syncing state — fetching tree (no total yet) */}
          {isSyncing && !syncProgress && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="animate-spin">⏳</span>
              Starting sync...
            </div>
          )}

          {/* Complete state — result card */}
          {syncResult && !isSyncing && (
            <div className={`p-3 rounded-lg border ${
              syncResult.errors === 0
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{syncResult.errors === 0 ? '✅' : '⚠️'}</span>
                <span className={`text-sm font-medium ${syncResult.errors === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                  Sync Complete
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span><strong className="text-green-400">{syncResult.synced}</strong> synced</span>
                {syncResult.skipped > 0 && (
                  <span><strong className="text-gray-300">{syncResult.skipped}</strong> existing</span>
                )}
                {syncResult.errors > 0 && (
                  <span><strong className="text-red-400">{syncResult.errors}</strong> errors</span>
                )}
                <span className="text-gray-600">{(syncResult.durationMs / 1000).toFixed(1)}s</span>
              </div>
              {syncResult.synced > 0 && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Files are now in your local workspace. The AI will see them automatically.
                </p>
              )}
              {/* Re-sync button */}
              <button
                onClick={onSync}
                className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Re-sync (overwrite existing)
              </button>
            </div>
          )}
        </div>
      )}

      {/* T3: Folder re-link section (when handle is stale after OAuth redirect) */}
      {folderPermissionOk === false && hasRepo && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">⚠️</span>
            <h4 className="text-sm font-medium text-amber-300">Folder Access Expired</h4>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Your local folder access was lost during the GitHub redirect.
            Re-link your project folder to enable file sync.
          </p>
          <FolderPicker
            projectId={projectId}
            onFolderLinked={onFolderRelinked}
            compact={false}
          />
        </div>
      )}

      {/* T3: Folder verification loading state */}
      {folderPermissionOk === null && hasRepo && (
        <div className="mt-4 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            Verifying folder access...
          </div>
        </div>
      )}

      {/* Push to GitHub Section (ENV-SYNC-01: Local→GitHub for Greenfield) */}
      {showPushSection && folderPermissionOk === true && (
        <div className="mt-4 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📤</span>
            <h4 className="text-sm font-medium text-white">Push Scaffold to GitHub</h4>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Push your local workspace files to the <code className="text-green-400">aixord/</code> feature branch
            on <code className="text-green-400">{githubConnection!.repo_owner}/{githubConnection!.repo_name}</code>.
          </p>

          {/* Ready state — show push button */}
          {!isPushing && !pushResult && (
            <button
              onClick={onPush}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📤</span>
              Push to GitHub
            </button>
          )}

          {/* Pushing state — progress */}
          {isPushing && pushProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{pushProgress.message}</span>
                {pushProgress.total > 0 && (
                  <span className="text-gray-500">{pushProgress.current}/{pushProgress.total}</span>
                )}
              </div>
              {pushProgress.total > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((pushProgress.current / pushProgress.total) * 100)}%` }}
                  />
                </div>
              )}
              <button
                onClick={onCancelPush}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Cancel push
              </button>
            </div>
          )}

          {/* Pushing state — reading files (no total yet) */}
          {isPushing && !pushProgress && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="animate-spin">⏳</span>
              Reading workspace files...
            </div>
          )}

          {/* Complete state — result card */}
          {pushResult && !isPushing && (
            <div className={`p-3 rounded-lg border ${
              pushResult.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{pushResult.success ? '✅' : '❌'}</span>
                <span className={`text-sm font-medium ${pushResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {pushResult.success ? 'Push Complete' : 'Push Failed'}
                </span>
              </div>
              {pushResult.success ? (
                <>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span><strong className="text-green-400">{pushResult.filesCommitted}</strong> files committed</span>
                    {pushResult.filesSkipped > 0 && (
                      <span><strong className="text-gray-300">{pushResult.filesSkipped}</strong> over limit</span>
                    )}
                    <span className="text-gray-600">{(pushResult.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                  {pushResult.branch && pushResult.commitSha && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Branch: <code className="text-green-400">{pushResult.branch}</code> · Commit: <code className="text-green-400">{pushResult.commitSha.slice(0, 7)}</code>
                    </p>
                  )}
                  {pushResult.prUrl && (
                    <a
                      href={pushResult.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      View Pull Request #{pushResult.prNumber}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-xs text-red-400 mt-1">{pushResult.error}</p>
              )}
              {/* Re-push button */}
              <button
                onClick={onPush}
                className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Push again
              </button>
            </div>
          )}
        </div>
      )}
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
  syncResult,
  pushResult,
}: {
  linkedFolder: LinkedFolder | null;
  selectedTemplate: string | null;
  scaffoldResult: ScaffoldResult | null;
  githubConnection: GitHubConnection | null;
  syncResult?: GitHubSyncResult | null;
  pushResult?: GitHubPushResult | null;
}) {
  const template = selectedTemplate ? getTemplateById(selectedTemplate) : null;
  const hasGitHub = githubConnection?.connected && githubConnection?.repo_name && githubConnection.repo_name !== 'PENDING';
  const isWorkspaceSync = githubConnection?.github_mode === 'WORKSPACE_SYNC';

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
                ? `Generated (${scaffoldResult.created + scaffoldResult.skipped} items${scaffoldResult.skipped > 0 ? `, ${scaffoldResult.skipped} existing` : ''})`
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

        {/* S1-T5: Dual-environment display for WORKSPACE_SYNC, single-row for READ_ONLY */}
        {hasGitHub && isWorkspaceSync ? (
          <div className="mt-2 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl space-y-3">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dual Environment</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Local Environment */}
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">📁</span>
                  <span className="text-xs font-medium text-white">Local</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{linkedFolder?.name ?? 'Not linked'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {scaffoldResult ? `${scaffoldResult.created + scaffoldResult.skipped} items` : '0 items'} · <span className="text-green-400">R/W</span>
                </p>
              </div>
              {/* GitHub Environment */}
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🐙</span>
                  <span className="text-xs font-medium text-white">GitHub</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{githubConnection!.repo_owner}/{githubConnection!.repo_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pushResult?.success ? `${pushResult.filesCommitted} files` : syncResult ? `${syncResult.synced} files` : '0 files'} · <span className="text-green-400">R/W</span>
                </p>
              </div>
            </div>
            {/* T7: Sync Status — enhanced with SYNCED/MISMATCH/NOT_SYNCED logic */}
            {pushResult?.success && scaffoldResult ? (() => {
              const localTotal = scaffoldResult.created + scaffoldResult.skipped;
              const isSynced = localTotal === pushResult.filesCommitted;
              return (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${
                  isSynced
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                  <span className="text-xs">
                    {isSynced ? '✓' : '⚠️'}
                  </span>
                  <span className={`text-xs font-medium ${
                    isSynced ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {isSynced ? 'SYNCED' : 'MISMATCH'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isSynced
                      ? `${pushResult.filesCommitted}/${localTotal} items match`
                      : `local ${localTotal} / GitHub ${pushResult.filesCommitted}`}
                    {pushResult.branch && ` · ${pushResult.branch}`}
                    {pushResult.commitSha && ` · ${pushResult.commitSha.slice(0, 7)}`}
                  </span>
                </div>
              );
            })()
             : syncResult && syncResult.synced > 0 && !pushResult ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs">📥</span>
                <span className="text-xs font-medium text-green-400">Synced from GitHub</span>
                <span className="text-xs text-gray-500">{syncResult.synced} files downloaded</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                <span className="text-xs text-gray-500">○</span>
                <span className="text-xs text-gray-500">Not synced — push scaffold first</span>
              </div>
            )}
          </div>
        ) : (
          <>
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
            {/* GitHub Sync for READ_ONLY (GITHUB-SYNC-01) */}
            {syncResult && syncResult.synced > 0 && (
              <SummaryRow
                label="File Sync"
                value={`${syncResult.synced} files synced`}
                status={syncResult.errors === 0 ? 'success' : 'warning'}
                detail="Repository files downloaded to local workspace"
              />
            )}
          </>
        )}

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
