import React from 'react';
import { styles, colors, getPhaseColor } from '../styles';
import type { Phase } from '../../types';
import { PHASE_REQUIRED_GATES, type GateID, type GateStatus } from '../../types';

interface PhaseSelectorProps {
  currentPhase: Phase;
  gates: Record<GateID, GateStatus>;
  onPhaseChange: (phase: Phase) => void;
}

const PHASES: Phase[] = ['BRAINSTORM', 'PLAN', 'EXECUTE', 'REVIEW'];

export function PhaseSelector({ currentPhase, gates, onPhaseChange }: PhaseSelectorProps) {
  const canEnterPhase = (phase: Phase): boolean => {
    const requiredGates = PHASE_REQUIRED_GATES[phase];
    return requiredGates.every((gate) => gates[gate] === 'passed');
  };

  return (
    <section style={styles.section}>
      <div style={styles.sectionTitle}>Phase</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {PHASES.map((phase) => {
          const isActive = phase === currentPhase;
          const canEnter = canEnterPhase(phase);
          const phaseColor = getPhaseColor(phase);

          return (
            <button
              key={phase}
              onClick={() => canEnter && onPhaseChange(phase)}
              disabled={!canEnter}
              style={{
                ...styles.phaseButton,
                backgroundColor: isActive ? phaseColor : 'transparent',
                color: isActive ? colors.bgPrimary : canEnter ? phaseColor : colors.textMuted,
                border: `1px solid ${isActive ? phaseColor : colors.border}`,
                opacity: canEnter ? 1 : 0.5,
                cursor: canEnter ? 'pointer' : 'not-allowed',
              }}
              title={
                canEnter
                  ? `Switch to ${phase}`
                  : `Pass required gates: ${PHASE_REQUIRED_GATES[phase].join(', ')}`
              }
            >
              {phase.charAt(0)}
            </button>
          );
        })}
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: colors.textSecondary,
          textAlign: 'center',
        }}
      >
        Current: <span style={{ color: getPhaseColor(currentPhase) }}>{currentPhase}</span>
      </div>
    </section>
  );
}
