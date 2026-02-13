/**
 * ProjectModals Component
 * 
 * Renders all modals used in the Project page:
 * - New Session Modal
 * - Quality Warning Override Modal
 * - REASSESS Protocol Modal
 * - Workspace Setup Wizard
 * - Engineering Panel, Blueprint Panel, Project Memory Panel
 * - Image Upload, CCS Incident Panel, CCS Create Incident Modal
 */

import { NewSessionModal } from '../session/NewSessionModal';
import { ImageUpload, type PendingImage } from '../chat/ImageUpload';
import { CCSIncidentPanel } from '../CCSIncidentPanel';
import { CCSCreateIncidentModal } from '../CCSCreateIncidentModal';
import { EngineeringPanel, type EngineeringSection } from '../EngineeringPanel';
import { BlueprintPanel } from '../BlueprintPanel';
import { ProjectMemoryPanel } from '../ProjectMemoryPanel';
import { WorkspaceSetupWizard, type WorkspaceBindingData } from '../WorkspaceSetupWizard';
import type { Project } from '../../lib/api';
import type { SessionType, EdgeType, CredentialType, ExposureSource } from '../../lib/api';

interface ProjectModalsProps {
  // New Session Modal
  showNewSessionModal: boolean;
  onCloseNewSession: () => void;
  onCreateSession: (opts: {
    sessionType: SessionType;
    parentSessionId?: string;
    edgeType?: EdgeType;
  }) => Promise<void>;
  currentSession: { id: string; session_number: number } | null;
  sessions: Array<{ id: string; session_number: number; session_type: SessionType; summary?: string; message_count?: number }>;

  // Quality Warning Override Modal
  pendingWarnings: Array<{ check: string; passed: boolean; detail: string }> | null;
  warningPhase: string | null;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
  onWarningOverride: () => void;
  onWarningDismiss: () => void;
  onAskAIToFix: () => void;
  isFinalizing: boolean;
  chatLoading: boolean;

  // REASSESS Protocol Modal
  reassessModal: {
    targetPhase: string;
    level: number;
    reassessCount: number;
    crossKingdom: boolean;
    phaseFrom: string;
  } | null;
  reassessReason: string;
  reassessReview: string;
  onReassessReasonChange: (value: string) => void;
  onReassessReviewChange: (value: string) => void;
  onReassessConfirm: () => void;
  onReassessDismiss: () => void;
  phaseError: string | null;

  // Workspace Setup Wizard
  showWorkspaceWizard: boolean;
  onWorkspaceComplete: (binding: WorkspaceBindingData) => void;
  onWorkspaceSkip: () => void;
  githubConnection: any;
  onGitHubConnect: () => void;
  onGitHubDisconnect: () => void;
  onGitHubSelectRepo: (owner: string, name: string) => void;
  githubRepos: Array<{ owner: string; name: string; full_name: string; private: boolean }>;

  // Engineering Panel
  engineeringPanelOpen: boolean;
  engineeringPanelSection: EngineeringSection;
  onCloseEngineeringPanel: () => void;
  onUpdateEngineering: () => void;

  // Blueprint Panel
  blueprintPanelOpen: boolean;
  onCloseBlueprintPanel: () => void;
  onUpdateBlueprint: () => void;
  onEvaluateGates: () => void;

  // Image Upload Modal
  showImageUpload: boolean;
  onCloseImageUpload: () => void;
  pendingImages: PendingImage[];
  onAddImage: (image: PendingImage) => void;
  onRemoveImage: (index: number) => void;
  onClearImages: () => void;

  // CCS Modals
  showCCSPanel: boolean;
  onCloseCCSPanel: () => void;
  showCCSCreate: boolean;
  onCloseCCSCreate: () => void;
  onCreateCCSIncident: (data: {
    credentialType: CredentialType;
    credentialName: string;
    exposureSource: ExposureSource;
    exposureDescription: string;
    impactAssessment: string;
    affectedSystems?: string[];
  }) => void;
  ccsIncidentId: string | null;
  onUpdateCCS: () => void;

  // Project Memory Panel (not displayed in this version)
  // Removed for now

  // Common props
  projectId: string;
  token: string;
  project: Project | null;
}

export function ProjectModals(props: ProjectModalsProps) {
  return (
    <>
      {/* New Session Modal */}
      {props.showNewSessionModal && (
        <NewSessionModal
          currentSession={props.currentSession}
          sessions={props.sessions}
          onConfirm={props.onCreateSession}
          onCancel={props.onCloseNewSession}
        />
      )}

      {/* Quality Warning Override Modal (VD-CI-01 A4) */}
      {props.pendingWarnings && props.warningPhase && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #e2b714',
            borderRadius: '12px', padding: '24px', maxWidth: '520px', width: '90%',
            color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ color: '#e2b714', margin: '0 0 16px', fontSize: '16px' }}>
              ⚠️ Quality Warnings — Director Override Required
            </h3>
            <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 12px' }}>
              Phase <strong>{props.warningPhase}</strong> passed all blocking checks but has quality warnings.
              You may override these warnings with a reason (logged to decision ledger).
            </p>
            <div style={{
              background: '#12121f', borderRadius: '8px', padding: '12px',
              marginBottom: '16px', maxHeight: '200px', overflowY: 'auto',
            }}>
              {props.pendingWarnings.map((w, i) => (
                <div key={i} style={{
                  padding: '6px 0', borderBottom: i < props.pendingWarnings!.length - 1 ? '1px solid #2a2a3e' : 'none',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#e2b714' }}>⚠ {w.check}</span>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{w.detail}</div>
                </div>
              ))}
            </div>
            <textarea
              value={props.overrideReason}
              onChange={(e) => props.onOverrideReasonChange(e.target.value)}
              placeholder="Override reason (required) — explain why these warnings are acceptable..."
              style={{
                width: '100%', height: '70px', background: '#12121f', border: '1px solid #333',
                borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={props.onAskAIToFix}
                disabled={props.chatLoading}
                style={{
                  padding: '8px 16px', background: '#7c3aed', border: 'none',
                  borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                Ask AI to Fix
              </button>
              <button
                onClick={props.onWarningDismiss}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #444',
                  borderRadius: '6px', color: '#aaa', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={props.onWarningOverride}
                disabled={!props.overrideReason.trim() || props.isFinalizing}
                style={{
                  padding: '8px 16px', background: props.overrideReason.trim() ? '#e2b714' : '#444',
                  border: 'none', borderRadius: '6px',
                  color: props.overrideReason.trim() ? '#000' : '#666',
                  cursor: props.overrideReason.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '13px',
                }}
              >
                {props.isFinalizing ? 'Overriding...' : 'Override & Finalize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GFB-01: REASSESS Protocol Modal */}
      {props.reassessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: '#1a1a2e',
            border: `1px solid ${props.reassessModal.level >= 3 ? '#ef4444' : props.reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6'}`,
            borderRadius: '12px', padding: '24px', maxWidth: '560px', width: '90%',
            color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{
              color: props.reassessModal.level >= 3 ? '#ef4444' : props.reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6',
              margin: '0 0 16px', fontSize: '16px',
            }}>
              {props.reassessModal.level >= 3 ? '🔴' : props.reassessModal.level >= 2 ? '🟠' : '🔵'}{' '}
              Phase Reassessment — Level {props.reassessModal.level}
              {props.reassessModal.level === 1 && ' (Surgical Fix)'}
              {props.reassessModal.level === 2 && ' (Major Pivot)'}
              {props.reassessModal.level === 3 && ' (Fresh Start)'}
            </h3>

            <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 12px' }}>
              You are moving <strong>backward</strong> from{' '}
              <span style={{ color: '#fff' }}>{props.reassessModal.phaseFrom}</span> →{' '}
              <span style={{ color: '#fff' }}>{props.reassessModal.targetPhase}</span>.
              {props.reassessModal.crossKingdom && (
                <span style={{ color: '#f59e0b' }}>
                  {' '}This crosses kingdom boundaries (Realization → Ideation/Blueprint).
                </span>
              )}
            </p>

            {/* Level indicator pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3].map(l => (
                <span key={l} style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                  background: l === props.reassessModal!.level
                    ? (l >= 3 ? '#ef4444' : l >= 2 ? '#f59e0b' : '#3b82f6')
                    : '#2a2a3e',
                  color: l === props.reassessModal!.level ? '#fff' : '#666',
                }}>
                  L{l}: {l === 1 ? 'Surgical' : l === 2 ? 'Pivot' : 'Fresh Start'}
                </span>
              ))}
            </div>

            {props.reassessModal.level >= 2 && (
              <div style={{
                background: '#1c1c0f', border: '1px solid #f59e0b33', borderRadius: '8px',
                padding: '10px', marginBottom: '12px', fontSize: '12px', color: '#f59e0b',
              }}>
                ⚠️ <strong>Artifact Impact:</strong> Active artifacts will be marked as SUPERSEDED.
                {props.reassessModal.level >= 3 && (
                  <span> This is reassessment #{props.reassessModal.reassessCount || '3+'}. A review summary is required.</span>
                )}
              </div>
            )}

            {props.phaseError && (
              <div style={{
                background: '#2a1015', border: '1px solid #ef444466', borderRadius: '6px',
                padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#f87171',
              }}>
                {props.phaseError}
              </div>
            )}

            <textarea
              value={props.reassessReason}
              onChange={(e) => props.onReassessReasonChange(e.target.value)}
              placeholder="Reassessment reason (required, min 20 characters) — why must the project go back?"
              style={{
                width: '100%', height: '70px', background: '#12121f', border: '1px solid #333',
                borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '11px', color: props.reassessReason.length >= 20 ? '#4ade80' : '#666', textAlign: 'right', marginTop: '2px' }}>
              {props.reassessReason.length}/20 characters
            </div>

            {props.reassessModal.level >= 3 && (
              <>
                <textarea
                  value={props.reassessReview}
                  onChange={(e) => props.onReassessReviewChange(e.target.value)}
                  placeholder="Review summary (required for Level 3, min 50 characters) — explain the reassessment pattern..."
                  style={{
                    width: '100%', height: '80px', background: '#12121f', border: '1px solid #333',
                    borderRadius: '6px', color: '#e0e0e0', padding: '8px', fontSize: '13px',
                    resize: 'vertical', boxSizing: 'border-box', marginTop: '8px',
                  }}
                />
                <div style={{ fontSize: '11px', color: props.reassessReview.length >= 50 ? '#4ade80' : '#666', textAlign: 'right', marginTop: '2px' }}>
                  {props.reassessReview.length}/50 characters
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={props.onReassessDismiss}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #444',
                  borderRadius: '6px', color: '#aaa', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={props.onReassessConfirm}
                disabled={props.reassessReason.length < 20 || (props.reassessModal.level >= 3 && props.reassessReview.length < 50)}
                style={{
                  padding: '8px 16px',
                  background: props.reassessReason.length >= 20 && (props.reassessModal.level < 3 || props.reassessReview.length >= 50)
                    ? (props.reassessModal.level >= 3 ? '#ef4444' : props.reassessModal.level >= 2 ? '#f59e0b' : '#3b82f6')
                    : '#444',
                  border: 'none', borderRadius: '6px',
                  color: props.reassessReason.length >= 20 ? '#fff' : '#666',
                  cursor: props.reassessReason.length >= 20 ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '13px',
                }}
              >
                Confirm Reassessment
              </button>
            </div>
          </div>
        </div>
      )}
