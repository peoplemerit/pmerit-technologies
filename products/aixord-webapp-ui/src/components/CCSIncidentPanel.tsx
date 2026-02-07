/**
 * CCS Incident Panel (PATCH-CCS-01)
 *
 * Full incident management panel including:
 * - Incident details
 * - Lifecycle tracker
 * - Artifact management
 * - Verification tests
 * - Director attestation
 */
import { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Play,
  Shield,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';
import { api, type CCSIncident, type CCSArtifact, type CCSVerificationTest, type CCSPhase, type CCSArtifactType } from '../lib/api';
import { CCSLifecycleTracker } from './CCSLifecycleTracker';

interface CCSIncidentPanelProps {
  projectId: string;
  incidentId: string;
  token: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function CCSIncidentPanel({
  projectId,
  incidentId,
  token,
  onClose,
  onUpdate,
}: CCSIncidentPanelProps) {
  const [incident, setIncident] = useState<(CCSIncident & { artifacts: CCSArtifact[]; verificationTests: CCSVerificationTest[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'artifacts' | 'verify' | 'attest' | 'history'>('details');
  const [incidentHistory, setIncidentHistory] = useState<CCSIncident[]>([]);

  // Form states
  const [showArtifactForm, setShowArtifactForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showAttestForm, setShowAttestForm] = useState(false);

  const loadIncident = async () => {
    try {
      setLoading(true);
      const data = await api.ccs.getIncident(projectId, incidentId, token);
      setIncident(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [projectId, incidentId, token]);

  const handlePhaseTransition = async (nextPhase: CCSPhase) => {
    if (!incident) return;
    try {
      await api.ccs.updatePhase(projectId, incidentId, nextPhase, token);
      await loadIncident();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phase');
    }
  };

  const handleUnlock = async () => {
    try {
      await api.ccs.unlock(projectId, incidentId, token);
      await loadIncident();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 text-white">Loading...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 text-red-400">
          {error || 'Incident not found'}
          <button onClick={onClose} className="ml-4 text-white">Close</button>
        </div>
      </div>
    );
  }

  const completedArtifacts = incident.artifacts.map(a => a.artifactType);
  const phaseCompletionTimes: Partial<Record<CCSPhase, string>> = {
    DETECT: incident.exposureDetectedAt,
    CONTAIN: incident.containCompletedAt,
    ROTATE: incident.rotateCompletedAt,
    INVALIDATE: incident.invalidateCompletedAt,
    VERIFY: incident.verifyCompletedAt,
    ATTEST: incident.attestCompletedAt,
    UNLOCK: incident.unlockCompletedAt,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-900/50 px-6 py-4 flex items-center justify-between border-b border-red-800">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
            <div>
              <h2 className="text-lg font-bold text-white">
                CCS Incident: {incident.incidentNumber}
              </h2>
              <p className="text-sm text-red-300">
                {incident.credentialName} ({incident.credentialType.replace('_', ' ')})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              incident.status === 'ACTIVE' ? 'bg-red-700 text-red-100' :
              incident.status === 'RESOLVED' ? 'bg-green-700 text-green-100' :
              'bg-gray-700 text-gray-100'
            }`}>
              {incident.status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Lifecycle Tracker */}
        <div className="px-6 py-4 border-b border-gray-700">
          <CCSLifecycleTracker
            currentPhase={incident.phase}
            completedArtifacts={completedArtifacts}
            phaseCompletionTimes={phaseCompletionTimes}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['details', 'artifacts', 'verify', 'attest', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'text-white border-b-2 border-red-500 bg-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'details' && (
            <IncidentDetails incident={incident} />
          )}

          {activeTab === 'artifacts' && (
            <ArtifactsTab
              incident={incident}
              projectId={projectId}
              token={token}
              showForm={showArtifactForm}
              setShowForm={setShowArtifactForm}
              onArtifactAdded={loadIncident}
            />
          )}

          {activeTab === 'verify' && (
            <VerificationTab
              incident={incident}
              projectId={projectId}
              token={token}
              showForm={showTestForm}
              setShowForm={setShowTestForm}
              onTestAdded={loadIncident}
            />
          )}

          {activeTab === 'attest' && (
            <AttestationTab
              incident={incident}
              projectId={projectId}
              token={token}
              showForm={showAttestForm}
              setShowForm={setShowAttestForm}
              onAttested={loadIncident}
            />
          )}

          {activeTab === 'history' && (
            <IncidentHistoryTab
              projectId={projectId}
              token={token}
              incidents={incidentHistory}
              onLoad={setIncidentHistory}
            />
          )}
        </div>

        {/* Footer Actions */}
        {incident.status === 'ACTIVE' && (
          <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
            <PhaseTransitionButton
              incident={incident}
              completedArtifacts={completedArtifacts}
              onTransition={handlePhaseTransition}
              onUnlock={handleUnlock}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components

function IncidentDetails({ incident }: { incident: CCSIncident }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Exposure Details</h4>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <InfoRow label="Source" value={incident.exposureSource.replace('_', ' ')} />
            <InfoRow label="Detected" value={new Date(incident.exposureDetectedAt).toLocaleString()} />
            <InfoRow label="Created By" value={incident.createdBy} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Impact Assessment</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white text-sm">{incident.impactAssessment}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Exposure Description</h4>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-white text-sm whitespace-pre-wrap">{incident.exposureDescription}</p>
        </div>
      </div>

      {incident.affectedSystems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Affected Systems</h4>
          <div className="flex flex-wrap gap-2">
            {incident.affectedSystems.map((system, i) => (
              <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-white">
                {system}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}

function ArtifactsTab({
  incident,
  projectId,
  token,
  showForm,
  setShowForm,
  onArtifactAdded,
}: {
  incident: CCSIncident & { artifacts: CCSArtifact[] };
  projectId: string;
  token: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onArtifactAdded: () => void;
}) {
  const [artifactType, setArtifactType] = useState<CCSArtifactType>('CCS-01');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.ccs.addArtifact(projectId, incident.id, { artifactType, title, content }, token);
      setShowForm(false);
      setTitle('');
      setContent('');
      onArtifactAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const ARTIFACT_NAMES: Record<CCSArtifactType, string> = {
    'CCS-01': 'Exposure Report',
    'CCS-02': 'Containment Record',
    'CCS-03': 'Rotation Proof',
    'CCS-04': 'Forward-Safety Attestation',
    'CCS-05': 'Audit Trail',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-400">CCS Artifacts ({incident.artifacts.length}/5)</h4>
        {incident.status === 'ACTIVE' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Artifact
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Artifact Type</label>
            <select
              value={artifactType}
              onChange={(e) => setArtifactType(e.target.value as CCSArtifactType)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              {(['CCS-01', 'CCS-02', 'CCS-03', 'CCS-04', 'CCS-05'] as CCSArtifactType[]).map((type) => (
                <option key={type} value={type}>
                  {type}: {ARTIFACT_NAMES[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Artifact'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {incident.artifacts.map((artifact) => (
          <div key={artifact.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-green-400 mr-2" />
                <span className="font-medium text-white">{artifact.artifactType}: {artifact.title}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(artifact.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{artifact.content}</p>
          </div>
        ))}
        {incident.artifacts.length === 0 && (
          <p className="text-center text-gray-500 py-8">No artifacts yet</p>
        )}
      </div>
    </div>
  );
}

function VerificationTab({
  incident,
  projectId,
  token,
  showForm,
  setShowForm,
  onTestAdded,
}: {
  incident: CCSIncident & { verificationTests: CCSVerificationTest[] };
  projectId: string;
  token: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onTestAdded: () => void;
}) {
  const [testType, setTestType] = useState<'OLD_REJECTED' | 'NEW_SUCCESS' | 'DEPENDENT_SYSTEM'>('OLD_REJECTED');
  const [targetSystem, setTargetSystem] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canAddTests = incident.phase === 'VERIFY' && incident.status === 'ACTIVE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.ccs.addVerificationTest(projectId, incident.id, {
        testType,
        targetSystem,
        expectedResult,
        actualResult,
        passed,
      }, token);
      setShowForm(false);
      setTargetSystem('');
      setExpectedResult('');
      setActualResult('');
      setPassed(false);
      onTestAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-400">Verification Tests</h4>
        {canAddTests && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded"
          >
            <Play className="h-4 w-4 mr-1" /> Add Test
          </button>
        )}
      </div>

      {!canAddTests && incident.phase !== 'VERIFY' && (
        <p className="text-sm text-gray-500">Verification tests can only be added in the VERIFY phase.</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as typeof testType)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="OLD_REJECTED">Old Credential Rejected (L-CCS6)</option>
              <option value="NEW_SUCCESS">New Credential Success (L-CCS7)</option>
              <option value="DEPENDENT_SYSTEM">Dependent System Check</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target System</label>
            <input
              type="text"
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
              placeholder="e.g., Stripe API, Database"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Expected Result</label>
              <input
                type="text"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                placeholder="e.g., 401 Unauthorized"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Actual Result</label>
              <input
                type="text"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                placeholder="e.g., 401 Unauthorized"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                required
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="passed"
              checked={passed}
              onChange={(e) => setPassed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600"
            />
            <label htmlFor="passed" className="ml-2 text-sm text-white">Test Passed</label>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Record Test'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {incident.verificationTests.map((test) => (
          <div key={test.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {test.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 mr-2" />
                )}
                <span className="font-medium text-white">{test.testType.replace('_', ' ')}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(test.testedAt).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Target:</span>
                <span className="ml-2 text-white">{test.targetSystem}</span>
              </div>
              <div>
                <span className="text-gray-400">Expected:</span>
                <span className="ml-2 text-white">{test.expectedResult}</span>
              </div>
              <div>
                <span className="text-gray-400">Actual:</span>
                <span className="ml-2 text-white">{test.actualResult}</span>
              </div>
            </div>
          </div>
        ))}
        {incident.verificationTests.length === 0 && (
          <p className="text-center text-gray-500 py-8">No verification tests yet</p>
        )}
      </div>
    </div>
  );
}

function AttestationTab({
  incident,
  projectId,
  token,
  showForm,
  setShowForm,
  onAttested,
}: {
  incident: CCSIncident;
  projectId: string;
  token: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onAttested: () => void;
}) {
  const [statement, setStatement] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canAttest = incident.phase === 'ATTEST' && !incident.attestedBy && incident.status === 'ACTIVE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.ccs.attest(projectId, incident.id, statement, token);
      setShowForm(false);
      onAttested();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Director Attestation (CCS-04)</h4>

      {incident.attestedBy ? (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="font-medium text-green-400">Attested</span>
          </div>
          <p className="text-sm text-white mb-2">{incident.attestationStatement}</p>
          <div className="flex items-center text-xs text-gray-400">
            <User className="h-3 w-3 mr-1" />
            {incident.attestedBy}
            <Clock className="h-3 w-3 ml-4 mr-1" />
            {incident.attestCompletedAt && new Date(incident.attestCompletedAt).toLocaleString()}
          </div>
        </div>
      ) : canAttest ? (
        <>
          <p className="text-sm text-gray-400">
            As the Director, you must attest that the credential exposure can no longer cause harm
            and that forward safety has been established.
          </p>
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Attestation Statement
                </label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={4}
                  placeholder="I attest that the exposed credential has been rotated, the old credential has been invalidated, and the system is now secure..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Sign Attestation'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
            >
              <Shield className="h-4 w-4 mr-2" />
              Provide Attestation
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          {incident.phase !== 'ATTEST'
            ? 'Attestation is only available in the ATTEST phase.'
            : 'Waiting for Director attestation...'}
        </p>
      )}
    </div>
  );
}

function PhaseTransitionButton({
  incident,
  completedArtifacts,
  onTransition,
  onUnlock,
}: {
  incident: CCSIncident;
  completedArtifacts: CCSArtifactType[];
  onTransition: (phase: CCSPhase) => void;
  onUnlock: () => void;
}) {
  const phases: CCSPhase[] = ['DETECT', 'CONTAIN', 'ROTATE', 'INVALIDATE', 'VERIFY', 'ATTEST', 'UNLOCK'];
  const currentIndex = phases.indexOf(incident.phase);
  const nextPhase = phases[currentIndex + 1];

  if (!nextPhase || incident.status !== 'ACTIVE') return null;

  // Special case for UNLOCK
  if (nextPhase === 'UNLOCK' && incident.attestedBy) {
    const allArtifacts: CCSArtifactType[] = ['CCS-01', 'CCS-02', 'CCS-03', 'CCS-04', 'CCS-05'];
    const hasAllArtifacts = allArtifacts.every(a => completedArtifacts.includes(a));

    return (
      <button
        onClick={onUnlock}
        disabled={!hasAllArtifacts}
        className="flex items-center px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Release GA:CCS Gate
        <ChevronRight className="h-4 w-4 ml-2" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onTransition(nextPhase)}
      className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded"
    >
      Advance to {nextPhase} Phase
      <ChevronRight className="h-4 w-4 ml-2" />
    </button>
  );
}

/**
 * Incident History Tab — Bridge: api.ccs.listIncidents
 */
function IncidentHistoryTab({
  projectId,
  token,
  incidents,
  onLoad,
}: {
  projectId: string;
  token: string;
  incidents: CCSIncident[];
  onLoad: (incidents: CCSIncident[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (incidents.length === 0) {
      setLoading(true);
      api.ccs.listIncidents(projectId, token)
        .then(result => onLoad(result.incidents))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [projectId, token, incidents.length, onLoad]);

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">Loading history...</div>;

  if (incidents.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">No incident history.</div>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-400">All Incidents</h4>
      {incidents.map(inc => (
        <div key={inc.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm font-medium font-mono">{inc.incidentNumber}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                inc.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400' :
                inc.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>{inc.status}</span>
              <span className="text-xs text-gray-500">{inc.phase}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <span>{inc.credentialType.replace('_', ' ')}: {inc.credentialName}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Created: {new Date(inc.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CCSIncidentPanel;
