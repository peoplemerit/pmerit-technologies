/**
 * D4-CHAT Sync Panel Component
 *
 * Provides UI for:
 * - Login to D4-CHAT platform
 * - Link/unlink projects
 * - Sync state to/from cloud
 */

import React, { useState } from 'react';
import { styles, colors } from '../styles';
import type { D4ChatSyncState, D4ChatSyncActions } from '../hooks/useD4ChatSync';
import type { CompanionState } from '../../types';

interface D4ChatSyncProps {
  syncState: D4ChatSyncState;
  syncActions: D4ChatSyncActions;
  companionState: CompanionState;
  onStateImported: (state: CompanionState) => void;
}

export function D4ChatSync({
  syncState,
  syncActions,
  companionState,
  onStateImported,
}: D4ChatSyncProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await syncActions.login(email, password);
    if (success) {
      setShowLogin(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleSyncToCloud = async () => {
    try {
      await syncActions.syncToRemote(companionState);
    } catch (error) {
      console.error('[D4ChatSync] Sync to cloud failed:', error);
    }
  };

  const handleSyncFromCloud = async () => {
    const importedState = await syncActions.syncFromRemote();
    if (importedState) {
      onStateImported(importedState);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    await syncActions.createAndLinkProject(
      newProjectName,
      companionState.project?.description
    );
    setNewProjectName('');
    setShowNewProject(false);
  };

  // Loading state
  if (syncState.authLoading) {
    return (
      <section style={styles.section}>
        <div style={styles.sectionTitle}>D4-CHAT Sync</div>
        <div style={{ textAlign: 'center', padding: '12px', color: colors.textMuted }}>
          Loading...
        </div>
      </section>
    );
  }

  // Not authenticated - show login
  if (!syncState.isAuthenticated) {
    return (
      <section style={styles.section}>
        <div style={styles.sectionTitle}>D4-CHAT Sync</div>

        {!showLogin ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '12px' }}>
              Connect to D4-CHAT to sync your progress to the cloud.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                ...styles.button,
                backgroundColor: colors.accent,
                color: '#fff',
                width: '100%',
              }}
            >
              Login to D4-CHAT
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                width: '100%',
                marginBottom: '8px',
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                width: '100%',
                marginBottom: '8px',
              }}
              required
            />
            {syncState.authError && (
              <div
                style={{
                  fontSize: '11px',
                  color: colors.error,
                  marginBottom: '8px',
                }}
              >
                {syncState.authError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  flex: 1,
                  backgroundColor: colors.accent,
                  color: '#fff',
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                style={{ ...styles.button, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    );
  }

  // Authenticated - show sync controls
  return (
    <section style={styles.section}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div style={styles.sectionTitle}>D4-CHAT Sync</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: colors.success }}>●</span>
          <span style={{ fontSize: '10px', color: colors.textMuted }}>
            {syncState.user?.email}
          </span>
        </div>
      </div>

      {/* Linked Project */}
      {syncState.linkedProject ? (
        <div
          style={{
            padding: '8px',
            backgroundColor: colors.bgSecondary,
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>
                {syncState.linkedProject.name}
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                {syncState.remoteState?.phase || 'BRAINSTORM'} •{' '}
                {Object.values(syncState.remoteState?.gates || {}).filter(Boolean).length}/17 gates
              </div>
            </div>
            <button
              onClick={syncActions.unlinkProject}
              style={{
                ...styles.button,
                padding: '4px 8px',
                fontSize: '10px',
              }}
            >
              Unlink
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
            No project linked. Select or create one:
          </div>

          {/* Project list */}
          {syncState.projects.length > 0 && (
            <div
              style={{
                maxHeight: '100px',
                overflowY: 'auto',
                marginBottom: '8px',
              }}
            >
              {syncState.projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => syncActions.linkProject(project.id)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: colors.bgSecondary,
                    borderRadius: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  {project.name}
                </div>
              ))}
            </div>
          )}

          {/* Create new project */}
          {showNewProject ? (
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{
                  ...styles.input,
                  width: '100%',
                  marginBottom: '8px',
                }}
                required
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    flex: 1,
                    backgroundColor: colors.success,
                    color: '#fff',
                  }}
                  disabled={syncState.isSyncing}
                >
                  Create & Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  style={{ ...styles.button, flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewProject(true)}
              style={{
                ...styles.button,
                width: '100%',
                backgroundColor: colors.accent,
                color: '#fff',
              }}
            >
              + Create New Project
            </button>
          )}
        </div>
      )}

      {/* Sync controls */}
      {syncState.linkedProject && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={handleSyncToCloud}
              disabled={syncState.isSyncing}
              style={{
                ...styles.button,
                flex: 1,
                backgroundColor: colors.accent,
                color: '#fff',
                opacity: syncState.isSyncing ? 0.6 : 1,
              }}
            >
              ↑ Push to Cloud
            </button>
            <button
              onClick={handleSyncFromCloud}
              disabled={syncState.isSyncing}
              style={{
                ...styles.button,
                flex: 1,
                opacity: syncState.isSyncing ? 0.6 : 1,
              }}
            >
              ↓ Pull from Cloud
            </button>
          </div>

          {syncState.syncError && (
            <div
              style={{
                fontSize: '10px',
                color: colors.error,
                marginBottom: '8px',
              }}
            >
              {syncState.syncError}
            </div>
          )}

          {syncState.lastSyncedAt && (
            <div style={{ fontSize: '10px', color: colors.textMuted, textAlign: 'center' }}>
              Last synced: {new Date(syncState.lastSyncedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div style={{ marginTop: '12px', borderTop: `1px solid ${colors.border}`, paddingTop: '8px' }}>
        <button
          onClick={syncActions.logout}
          style={{
            ...styles.button,
            width: '100%',
            fontSize: '10px',
            padding: '4px 8px',
          }}
        >
          Logout
        </button>
      </div>
    </section>
  );
}
