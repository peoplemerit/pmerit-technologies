import React, { useState } from 'react';
import { styles, colors } from '../styles';
import type { ProjectState } from '../../types';

interface ProjectSetupProps {
  project: ProjectState | null;
  onSave: (project: ProjectState) => void;
  onClear: () => void;
}

export function ProjectSetup({ project, onSave, onClear }: ProjectSetupProps) {
  const [isEditing, setIsEditing] = useState(!project);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');

  const handleSave = () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    onSave({
      name: name.trim(),
      description: description.trim(),
      createdAt: project?.createdAt ?? now,
      updatedAt: now,
    });
    setIsEditing(false);
  };

  if (project && !isEditing) {
    return (
      <section style={styles.section}>
        <div style={styles.sectionTitle}>Project</div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{project.name}</div>
          {project.description && (
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>
              {project.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{ ...styles.buttonSecondary, flex: 1 }}
          >
            Edit
          </button>
          <button
            onClick={onClear}
            style={{ ...styles.buttonSecondary, flex: 1, color: colors.error }}
          >
            Clear
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionTitle}>Project Setup</div>
      <input
        type="text"
        placeholder="Project name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ ...styles.input, marginBottom: '8px' }}
      />
      <textarea
        placeholder="Brief description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...styles.textarea, marginBottom: '8px', minHeight: '60px' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave} style={styles.button} disabled={!name.trim()}>
          {project ? 'Update' : 'Create'} Project
        </button>
        {project && (
          <button
            onClick={() => {
              setName(project.name);
              setDescription(project.description);
              setIsEditing(false);
            }}
            style={{ ...styles.buttonSecondary, width: 'auto' }}
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}
