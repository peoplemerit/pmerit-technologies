import React, { useState } from 'react';
import { styles, colors } from '../styles';

interface HandoffGeneratorProps {
  onGenerate: () => Promise<string>;
}

export function HandoffGenerator({ onGenerate }: HandoffGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [handoff, setHandoff] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate();
      setHandoff(result);
    } catch (err) {
      console.error('Failed to generate handoff:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setHandoff(null);
    setCopied(false);
  };

  return (
    <section style={styles.section}>
      <div style={styles.sectionTitle}>Handoff</div>

      {!handoff ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            ...styles.button,
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate HANDOFF'}
        </button>
      ) : (
        <>
          <div
            style={{
              backgroundColor: colors.bgSecondary,
              borderRadius: '6px',
              padding: '8px',
              maxHeight: '200px',
              overflow: 'auto',
              marginBottom: '8px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: '10px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: colors.textSecondary,
              }}
            >
              {handoff}
            </pre>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                ...styles.button,
                flex: 1,
                backgroundColor: copied ? colors.success : colors.accent,
              }}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button onClick={handleClose} style={{ ...styles.buttonSecondary, width: 'auto' }}>
              Close
            </button>
          </div>
        </>
      )}

      <div
        style={{
          marginTop: '8px',
          fontSize: '10px',
          color: colors.textMuted,
        }}
      >
        Generate a markdown handoff to continue your session in another AI chat.
      </div>
    </section>
  );
}
