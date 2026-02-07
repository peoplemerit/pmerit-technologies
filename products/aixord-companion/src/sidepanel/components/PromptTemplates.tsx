import React, { useState } from 'react';
import { styles, colors, getPhaseColor } from '../styles';
import type { PromptTemplate, Phase } from '../../types';

interface PromptTemplatesProps {
  templates: PromptTemplate[];
  currentPhase: Phase;
  onCopy: (content: string) => void;
  onAddTemplate: (template: Omit<PromptTemplate, 'id'>) => void;
}

export function PromptTemplates({
  templates,
  currentPhase,
  onCopy,
  onAddTemplate,
}: PromptTemplatesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  // Filter templates by current phase
  const phaseTemplates = templates.filter((t) => t.phase === currentPhase);
  const quickTemplates = phaseTemplates.filter((t) => t.category === 'quick');
  const customTemplates = phaseTemplates.filter((t) => t.category === 'custom');

  const handleAddTemplate = () => {
    if (!newName.trim() || !newContent.trim()) return;

    onAddTemplate({
      name: newName.trim(),
      content: newContent.trim(),
      phase: currentPhase,
      category: 'custom',
    });

    setNewName('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={styles.sectionTitle}>
          Prompts{' '}
          <span style={{ color: getPhaseColor(currentPhase), textTransform: 'none' }}>
            ({currentPhase})
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            ...styles.buttonSecondary,
            padding: '2px 8px',
            fontSize: '10px',
            width: 'auto',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Template name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ ...styles.input, marginBottom: '8px' }}
          />
          <textarea
            placeholder="Prompt content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{ ...styles.textarea, marginBottom: '8px' }}
          />
          <button
            onClick={handleAddTemplate}
            style={styles.button}
            disabled={!newName.trim() || !newContent.trim()}
          >
            Save Template
          </button>
        </div>
      )}

      {/* Quick templates */}
      {quickTemplates.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>
            Quick
          </div>
          {quickTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {/* Custom templates */}
      {customTemplates.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>
            Custom
          </div>
          {customTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {phaseTemplates.length === 0 && !showAddForm && (
        <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
          No templates for this phase
        </div>
      )}
    </section>
  );
}

function TemplateCard({
  template,
  onCopy,
}: {
  template: PromptTemplate;
  onCopy: (content: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        ...styles.promptCard,
        borderColor: copied ? colors.success : colors.border,
      }}
    >
      <div style={styles.promptName}>
        {template.name}
        {copied && (
          <span style={{ marginLeft: '8px', fontSize: '10px', color: colors.success }}>
            Copied!
          </span>
        )}
      </div>
      <div style={styles.promptContent}>{template.content}</div>
    </div>
  );
}
