import React from 'react';
import { styles, colors, getGateColor } from '../styles';
import type { GateID, GateStatus } from '../../types';
import { GATE_ORDER, GATES, SETUP_GATES, WORK_GATES } from '../../types';

interface GateTrackerProps {
  gates: Record<GateID, GateStatus>;
  onToggleGate: (gateId: GateID) => void;
}

function GateChip({
  gateId,
  status,
  onToggle,
}: {
  gateId: GateID;
  status: GateStatus;
  onToggle: () => void;
}) {
  const color = getGateColor(status);
  const isPassed = status === 'passed';
  const gate = GATES[gateId];

  return (
    <button
      onClick={onToggle}
      style={{
        ...styles.gateChip,
        backgroundColor: isPassed ? `${color}20` : colors.bgSecondary,
        color: color,
        border: `1px solid ${color}`,
        cursor: 'pointer',
        margin: 0,
      }}
      title={`${gate.name}: ${gate.description} (${status})`}
    >
      {isPassed && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginRight: '4px' }}
        >
          <path
            d="M20 6L9 17L4 12"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {gateId}
    </button>
  );
}

function GateGroup({
  title,
  gateIds,
  gates,
  onToggleGate,
}: {
  title: string;
  gateIds: GateID[];
  gates: Record<GateID, GateStatus>;
  onToggleGate: (gateId: GateID) => void;
}) {
  const passedCount = gateIds.filter((id) => gates[id] === 'passed').length;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ fontSize: '10px', color: colors.textMuted }}>
          {passedCount}/{gateIds.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {gateIds.map((gateId) => (
          <GateChip
            key={gateId}
            gateId={gateId}
            status={gates[gateId]}
            onToggle={() => onToggleGate(gateId)}
          />
        ))}
      </div>
    </div>
  );
}

export function GateTracker({ gates, onToggleGate }: GateTrackerProps) {
  const passedCount = Object.values(gates).filter((s) => s === 'passed').length;
  const totalCount = GATE_ORDER.length;

  return (
    <section style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={styles.sectionTitle}>Gates (AIXORD v4.3)</div>
        <div style={{ fontSize: '10px', color: colors.textMuted }}>
          {passedCount}/{totalCount}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '2px',
          marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(passedCount / totalCount) * 100}%`,
            backgroundColor: colors.success,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Setup Gates */}
      <GateGroup
        title="Setup Gates"
        gateIds={SETUP_GATES}
        gates={gates}
        onToggleGate={onToggleGate}
      />

      {/* Work Gates */}
      <GateGroup
        title="Work Gates"
        gateIds={WORK_GATES}
        gates={gates}
        onToggleGate={onToggleGate}
      />

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '10px',
          color: colors.textMuted,
        }}
      >
        <span>
          <span style={{ color: colors.gatePassed }}>*</span> Passed
        </span>
        <span>
          <span style={{ color: colors.gatePending }}>*</span> Pending
        </span>
      </div>
    </section>
  );
}
