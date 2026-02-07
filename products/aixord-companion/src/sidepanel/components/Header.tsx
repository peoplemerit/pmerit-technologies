import React from 'react';
import { styles, colors } from '../styles';

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke={colors.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke={colors.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke={colors.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 style={styles.logoText}>
          AIXORD
          <span style={styles.version}>Companion v1.0</span>
        </h1>
      </div>
      <button
        onClick={onReset}
        style={{
          ...styles.buttonSecondary,
          padding: '4px 8px',
          fontSize: '10px',
          width: 'auto',
        }}
        title="Reset all state"
      >
        Reset
      </button>
    </header>
  );
}
