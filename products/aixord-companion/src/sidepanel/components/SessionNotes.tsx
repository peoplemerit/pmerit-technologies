import React from 'react';
import { styles } from '../styles';

interface SessionNotesProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function SessionNotes({ notes, onChange }: SessionNotesProps) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionTitle}>Session Notes</div>
      <textarea
        placeholder="Capture key decisions, blockers, and context for continuity..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...styles.textarea,
          minHeight: '100px',
        }}
      />
    </section>
  );
}
