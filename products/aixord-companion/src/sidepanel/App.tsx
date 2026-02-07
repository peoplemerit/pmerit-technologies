import React, { useCallback } from 'react';
import { useStorage } from './hooks/useStorage';
import { useD4ChatSync } from './hooks/useD4ChatSync';
import {
  Header,
  ProjectSetup,
  PhaseSelector,
  GateTracker,
  PromptTemplates,
  SessionNotes,
  HandoffGenerator,
  D4ChatSync,
} from './components';
import { styles, colors } from './styles';
import type { Phase, GateID, ProjectState, PromptTemplate, CompanionState } from '../types';

export function App() {
  const { state, loading, error, saveState, resetState, generateHandoff } = useStorage();
  const [syncState, syncActions] = useD4ChatSync();

  const updateState = useCallback(
    (updates: Partial<CompanionState>) => {
      saveState({ ...state, ...updates });
    },
    [state, saveState]
  );

  const handleProjectSave = useCallback(
    (project: ProjectState) => {
      updateState({ project });
    },
    [updateState]
  );

  const handleProjectClear = useCallback(() => {
    updateState({ project: null });
  }, [updateState]);

  const handlePhaseChange = useCallback(
    (phase: Phase) => {
      saveState({
        ...state,
        session: { ...state.session, phase },
      });
    },
    [state, saveState]
  );

  const handleGateToggle = useCallback(
    (gateId: GateID) => {
      const currentStatus = state.session.gates[gateId];
      const newStatus = currentStatus === 'passed' ? 'pending' : 'passed';
      saveState({
        ...state,
        session: {
          ...state.session,
          gates: { ...state.session.gates, [gateId]: newStatus },
        },
      });
    },
    [state, saveState]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      saveState({
        ...state,
        session: { ...state.session, notes },
      });
    },
    [state, saveState]
  );

  const handlePromptCopy = useCallback((content: string) => {
    console.log('[AIXORD Companion] Prompt copied:', content.substring(0, 50) + '...');
  }, []);

  const handleAddTemplate = useCallback(
    (template: Omit<PromptTemplate, 'id'>) => {
      const newTemplate: PromptTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
      };
      saveState({
        ...state,
        session: {
          ...state.session,
          promptTemplates: [...state.session.promptTemplates, newTemplate],
        },
      });
    },
    [state, saveState]
  );

  // Handle state imported from D4-CHAT cloud
  const handleStateImported = useCallback(
    (importedState: CompanionState) => {
      saveState(importedState);
    },
    [saveState]
  );

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: `2px solid ${colors.border}`,
              borderTopColor: colors.accent,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: colors.textSecondary }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div
          style={{
            ...styles.section,
            backgroundColor: `${colors.error}20`,
            borderColor: colors.error,
          }}
        >
          <div style={{ color: colors.error, fontWeight: 600, marginBottom: '8px' }}>Error</div>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>{error}</div>
          <button onClick={resetState} style={styles.button}>
            Reset State
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header onReset={resetState} />

      <ProjectSetup
        project={state.project}
        onSave={handleProjectSave}
        onClear={handleProjectClear}
      />

      <PhaseSelector
        currentPhase={state.session.phase}
        gates={state.session.gates}
        onPhaseChange={handlePhaseChange}
      />

      <GateTracker gates={state.session.gates} onToggleGate={handleGateToggle} />

      <PromptTemplates
        templates={state.session.promptTemplates}
        currentPhase={state.session.phase}
        onCopy={handlePromptCopy}
        onAddTemplate={handleAddTemplate}
      />

      <SessionNotes notes={state.session.notes} onChange={handleNotesChange} />

      <HandoffGenerator onGenerate={generateHandoff} />

      {/* D4-CHAT Cloud Sync */}
      <D4ChatSync
        syncState={syncState}
        syncActions={syncActions}
        companionState={state}
        onStateImported={handleStateImported}
      />

      {/* Footer */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
          fontSize: '10px',
          color: colors.textMuted,
        }}
      >
        AIXORD Companion v1.0.0
        <br />
        <a
          href="https://pmerit.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.accent, textDecoration: 'none' }}
        >
          pmerit.com
        </a>
      </div>
    </div>
  );
}
