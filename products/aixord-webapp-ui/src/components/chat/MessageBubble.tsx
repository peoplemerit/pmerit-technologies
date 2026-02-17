/**
 * Message Bubble Component
 *
 * Renders a single chat message with metadata display.
 * Detects error messages and displays user-friendly guidance.
 */

import { useState, useRef, useEffect } from 'react';
import type { Message } from './types';
import { ChatErrorMessage } from '../ChatErrorMessage';
import { ImageDisplay } from './ImageDisplay';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  onSelectOption?: (optionId: string) => void;
  onRetry?: () => void;
  token?: string; // Auth token for image loading
  /** AI-Governance Integration — Phase 3: Phase advance callback */
  onPhaseAdvance?: (phase: string) => void;
  /** Message action callbacks */
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  /** EXE-GAP-001: Workspace folder name for file operation cards */
  workspaceFolderName?: string;
  /** D81: Scaffold plan approval gate */
  workspaceBound?: boolean;
  onApproveScaffoldPlan?: (messageId: string) => void;
  onModifyScaffoldPlan?: (messageId: string, feedback: string) => void;
}

// Check if message content looks like an error
function isErrorMessage(content: string): boolean {
  const errorPatterns = [
    /^Error:/i,
    /^Failed to/i,
    /BYOK_KEY_MISSING/,
    /RATE_LIMIT/,
    /AUTH_EXPIRED/,
    /MODEL_UNAVAILABLE/,
    /INVALID_API_KEY/,
    /QUOTA_EXCEEDED/,
    /NETWORK_ERROR/,
    /Internal Server Error/i,
    /Something went wrong/i,
  ];
  return errorPatterns.some(pattern => pattern.test(content));
}

export function MessageBubble({ message, onSelectOption, onRetry, token, onPhaseAdvance, onCopy, onRegenerate, onEdit, workspaceFolderName, workspaceBound, onApproveScaffoldPlan, onModifyScaffoldPlan }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = (isSystem || message.role === 'assistant') && isErrorMessage(message.content);

  // Edit state for user messages
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // D81: Scaffold plan modify state
  const [scaffoldModifyOpen, setScaffoldModifyOpen] = useState(false);
  const [scaffoldModifyText, setScaffoldModifyText] = useState('');

  // Auto-focus and auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = 'auto';
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
  };

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // AI-Governance Integration — Phase 3: Detect phase advance tag
  const phaseAdvanceMatch = !isUser ? message.content.match(/\[PHASE_ADVANCE:(\w+)\]/) : null;
  const suggestedPhase = phaseAdvanceMatch ? phaseAdvanceMatch[1] : null;

  // HANDOFF-VD-CI-01 A1: Detect brainstorm artifact block
  const hasBrainstormArtifact = !isUser && /=== BRAINSTORM ARTIFACT ===/.test(message.content);

  // FIX-PLAN: Detect plan artifact block
  const hasPlanArtifact = !isUser && /=== PLAN ARTIFACT ===/.test(message.content);

  // D81: Detect scaffold plan from metadata (parsed in Project.tsx)
  const scaffoldPlan = message.metadata?.scaffoldPlan;

  // HANDOFF-TDL-01 Task 7 + HANDOFF-PCC-01: Parse structured AI output blocks
  interface ParsedBlock {
    type: 'PROGRESS UPDATE' | 'SUBMISSION' | 'ESCALATION' | 'STANDUP' | 'RETRIEVE' | 'CONTINUITY CONFLICT';
    fields: Record<string, string>;
  }
  const parsedBlocks: ParsedBlock[] = [];
  if (!isUser) {
    const blockPatterns = [
      { type: 'PROGRESS UPDATE' as const, re: /=== PROGRESS UPDATE ===\s*([\s\S]*?)\s*=== END PROGRESS UPDATE ===/g },
      { type: 'SUBMISSION' as const, re: /=== SUBMISSION ===\s*([\s\S]*?)\s*=== END SUBMISSION ===/g },
      { type: 'ESCALATION' as const, re: /=== ESCALATION ===\s*([\s\S]*?)\s*=== END ESCALATION ===/g },
      { type: 'STANDUP' as const, re: /=== STANDUP ===\s*([\s\S]*?)\s*=== END STANDUP ===/g },
      { type: 'RETRIEVE' as const, re: /=== RETRIEVE:\s*([\s\S]*?)\s*===/g },
      { type: 'CONTINUITY CONFLICT' as const, re: /=== CONTINUITY CONFLICT ===\s*([\s\S]*?)\s*===/g },
    ];
    for (const bp of blockPatterns) {
      let m;
      while ((m = bp.re.exec(message.content)) !== null) {
        const fields: Record<string, string> = {};
        for (const line of m[1].split('\n')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim();
            if (key && val) fields[key] = val;
          }
        }
        parsedBlocks.push({ type: bp.type, fields });
      }
    }
  }

  const displayContent = !isUser
    ? message.content
        .replace(/\[PHASE_ADVANCE:\w+\]/g, '')
        .replace(/=== BRAINSTORM ARTIFACT ===[\s\S]*?=== END BRAINSTORM ARTIFACT ===/g, '')
        .replace(/=== PLAN ARTIFACT ===[\s\S]*?=== END PLAN ARTIFACT ===/g, '')
        .replace(/=== PROGRESS UPDATE ===[\s\S]*?=== END PROGRESS UPDATE ===/g, '')
        .replace(/=== SUBMISSION ===[\s\S]*?=== END SUBMISSION ===/g, '')
        .replace(/=== ESCALATION ===[\s\S]*?=== END ESCALATION ===/g, '')
        .replace(/=== STANDUP ===[\s\S]*?=== END STANDUP ===/g, '')
        .replace(/=== RETRIEVE:\s*[\s\S]*?===/g, '')
        .replace(/=== CONTINUITY CONFLICT ===[\s\S]*?===/g, '')
        .replace(/=== SCAFFOLD PLAN ===[\s\S]*?=== END SCAFFOLD PLAN ===/g, '')
        .replace(/```\w+:[^\n]+\n[\s\S]*?```/g, '') // Strip file deliverable fences (shown in execution card)
        .trim()
    : message.content;

  // Phase 4: Governance Block Card — distinct from AI messages
  const isGovernanceBlock = !!(message.metadata as Record<string, unknown>)?.governance_block;
  if (isGovernanceBlock) {
    const meta = message.metadata as Record<string, unknown>;
    const failedGates = (meta.failed_gates as Array<{ key: string; label: string; action: string }>) || [];
    const phase = (meta.phase as string) || 'UNKNOWN';
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%] bg-violet-900/20 border border-violet-500/40 rounded-xl px-5 py-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-violet-300 text-sm font-semibold">AIXORD Governance Block</span>
              <span className="text-gray-500 text-xs ml-2">Phase: {phase}</span>
            </div>
          </div>
          {/* Explanation */}
          <p className="text-gray-300 text-sm mb-3">
            The AI model was <strong className="text-violet-300">not called</strong> — {failedGates.length} required gate{failedGates.length !== 1 ? 's' : ''} must be satisfied.
          </p>
          {/* Gate list */}
          <div className="space-y-1.5 mb-3">
            {failedGates.map((gate) => (
              <div key={gate.key} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">○</span>
                <div>
                  <span className="text-gray-200 font-medium">{gate.label}</span>
                  <span className="text-gray-500 ml-2">— {gate.action}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Hint */}
          <p className="text-gray-500 text-xs">
            Open the <strong className="text-gray-400">Governance</strong> tab or click the gate pills to resolve.
          </p>
          {/* Timestamp */}
          <div className="text-xs mt-2 text-gray-600">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  // Render error messages with ChatErrorMessage component
  if (isError) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[80%]">
          <ChatErrorMessage message={message.content} onRetry={onRetry} />
          {/* Timestamp */}
          <div className="text-xs mt-1 text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div
        className={`relative max-w-[80%] ${
          isUser
            ? 'bg-violet-600 text-white rounded-2xl rounded-br-md'
            : isSystem
            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl'
            : 'bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md'
        } px-4 py-3`}
      >
        {/* Message action buttons (copy, edit, regenerate) — visible on hover */}
        {!isSystem && !isEditing && (
          <MessageActions
            role={message.role as 'user' | 'assistant'}
            onCopy={handleCopy}
            onRegenerate={message.role === 'assistant' ? onRegenerate : undefined}
            onEdit={message.role === 'user' && onEdit ? handleStartEdit : undefined}
          />
        )}

        {/* Message content — or edit textarea */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="w-full bg-violet-700/50 text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-400"
              rows={1}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-xs text-gray-300 hover:text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || editContent === message.content}
                className="px-3 py-1 text-xs bg-violet-500 text-white rounded hover:bg-violet-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Resend
              </button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayContent}
          </div>
        )}

        {/* AI-Governance Integration — Phase 3: Phase advance suggestion */}
        {suggestedPhase && onPhaseAdvance && (
          <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-violet-400 text-sm font-medium">
                  Ready to advance to {suggestedPhase}
                </span>
                <p className="text-gray-400 text-xs mt-0.5">
                  All exit gates for the current phase are satisfied.
                </p>
              </div>
              <button
                onClick={() => onPhaseAdvance(suggestedPhase)}
                className="flex-shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
              >
                Advance to {suggestedPhase}
              </button>
            </div>
          </div>
        )}

        {/* HANDOFF-VD-CI-01 A1: Brainstorm artifact saved indicator */}
        {hasBrainstormArtifact && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 text-sm font-medium">
                Brainstorm artifact saved
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Structured options, assumptions, and decision criteria captured for validation.
            </p>
          </div>
        )}

        {/* FIX-PLAN: Plan artifact saved indicator */}
        {hasPlanArtifact && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-blue-400 text-sm font-medium">
                Blueprint populated from plan
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Scopes, deliverables, and definitions of done have been imported. Review in the Blueprint panel, then click Finalize Plan.
            </p>
          </div>
        )}

        {/* D81: Scaffold Plan card — plan-before-execute gate */}
        {scaffoldPlan && (
          <div className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-cyan-300 text-sm font-semibold">SCAFFOLD PLAN</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{scaffoldPlan.totalFiles} files</span>
                <span className="text-gray-600">|</span>
                <span>~{scaffoldPlan.estimatedTokens.toLocaleString()} tokens</span>
              </div>
            </div>

            {/* Deliverable + description */}
            <div className="mb-3">
              <h4 className="text-gray-200 text-sm font-medium">{scaffoldPlan.deliverable}</h4>
              {scaffoldPlan.projectName && (
                <span className="text-cyan-400/70 text-xs font-mono">{scaffoldPlan.projectName}/</span>
              )}
              <p className="text-gray-400 text-xs mt-1">{scaffoldPlan.description}</p>
            </div>

            {/* File tree */}
            {scaffoldPlan.tree && (
              <div className="mb-3 bg-gray-900/50 rounded p-2.5 border border-gray-700/30">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre leading-relaxed">
                  {scaffoldPlan.tree.replace(/\\n/g, '\n')}
                </pre>
              </div>
            )}

            {/* File list */}
            <div className="mb-3 space-y-1">
              {scaffoldPlan.files.map((file, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-cyan-400/60 font-mono min-w-[12px]">+</span>
                  <span className="text-cyan-300 font-mono min-w-[140px] shrink-0">{file.path}</span>
                  <span className="text-gray-500">—</span>
                  <span className="text-gray-400 flex-1">{file.purpose}</span>
                  <span className="text-gray-600 text-[10px]">{file.language} ~{file.estimatedLines}L</span>
                </div>
              ))}
            </div>

            {/* Dependencies */}
            {scaffoldPlan.dependencies.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="text-gray-500 text-xs">deps:</span>
                {scaffoldPlan.dependencies.map((dep, i) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] bg-cyan-500/15 text-cyan-400 rounded font-mono">
                    {dep}
                  </span>
                ))}
              </div>
            )}

            {/* Status badges + action buttons */}
            {scaffoldPlan.status === 'approved' ? (
              <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 text-xs font-medium">Approved — files written</span>
              </div>
            ) : scaffoldPlan.status === 'modified' ? (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-amber-400 text-xs font-medium">Modified — see updated plan below</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-3">
                {workspaceBound ? (
                  <button
                    onClick={() => onApproveScaffoldPlan?.(message.id)}
                    className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    Approve & Write Files
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-1.5 text-xs font-medium bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed"
                    title="Link a workspace folder in project settings first"
                  >
                    Link Folder First
                  </button>
                )}
                <button
                  onClick={() => setScaffoldModifyOpen(prev => !prev)}
                  className="px-4 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Modify Plan
                </button>
              </div>
            )}

            {/* Modify textarea */}
            {scaffoldModifyOpen && scaffoldPlan.status === 'pending' && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={scaffoldModifyText}
                  onChange={(e) => setScaffoldModifyText(e.target.value)}
                  placeholder="Describe what to change (e.g., 'Add a utils/ directory', 'Use Tailwind instead of plain CSS')..."
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (scaffoldModifyText.trim()) {
                        onModifyScaffoldPlan?.(message.id, scaffoldModifyText.trim());
                        setScaffoldModifyOpen(false);
                        setScaffoldModifyText('');
                      }
                    }}
                    disabled={!scaffoldModifyText.trim()}
                    className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                  >
                    Send Modification
                  </button>
                  <button
                    onClick={() => { setScaffoldModifyOpen(false); setScaffoldModifyText(''); }}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HANDOFF-TDL-01 Task 7: Structured AI output block cards */}
        {parsedBlocks.map((block, i) => (
          <div key={i} className={`mt-3 p-3 rounded-lg border ${
            block.type === 'PROGRESS UPDATE' ? 'bg-blue-500/10 border-blue-500/30' :
            block.type === 'SUBMISSION' ? 'bg-amber-500/10 border-amber-500/30' :
            block.type === 'ESCALATION' ? 'bg-red-500/10 border-red-500/30' :
            block.type === 'RETRIEVE' ? 'bg-cyan-500/10 border-cyan-500/30' :
            block.type === 'CONTINUITY CONFLICT' ? 'bg-orange-500/10 border-orange-500/30' :
            'bg-indigo-500/10 border-indigo-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold ${
                block.type === 'PROGRESS UPDATE' ? 'text-blue-400' :
                block.type === 'SUBMISSION' ? 'text-amber-400' :
                block.type === 'ESCALATION' ? 'text-red-400' :
                block.type === 'RETRIEVE' ? 'text-cyan-400' :
                block.type === 'CONTINUITY CONFLICT' ? 'text-orange-400' :
                'text-indigo-400'
              }`}>
                {block.type === 'CONTINUITY CONFLICT' ? '⚠️ CONTINUITY CONFLICT' :
                 block.type === 'RETRIEVE' ? '🔍 RETRIEVE' : block.type}
              </span>
            </div>
            <div className="space-y-1">
              {Object.entries(block.fields).map(([key, val]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <span className="text-gray-500 font-medium min-w-[80px]">{key}:</span>
                  <span className="text-gray-300">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* EXE-GAP-001: File operation results */}
        {message.metadata?.executionResult && (
          message.metadata.executionResult.filesCreated.length > 0 ||
          message.metadata.executionResult.errors.length > 0
        ) && (
          <div className={`mt-2 p-3 rounded-lg border text-xs ${
            message.metadata.executionResult.errors.length > 0
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-semibold ${
                message.metadata.executionResult.errors.length > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {message.metadata.executionResult.errors.length > 0 ? 'FILE OPERATIONS (with errors)' : 'FILES WRITTEN'}
              </span>
            </div>
            {workspaceFolderName && (
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <span className="font-mono">{workspaceFolderName}/</span>
              </div>
            )}
            {message.metadata.executionResult.filesCreated.map((f: string) => (
              <div key={f} className="flex items-center gap-1 text-emerald-300">
                <span>+</span><span className="font-mono">{workspaceFolderName ? `${workspaceFolderName}/${f}` : f}</span>
              </div>
            ))}
            {message.metadata.executionResult.errors.map((e: string, i: number) => (
              <div key={i} className="flex items-center gap-1 text-red-300">
                <span>!</span><span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Image attachments (ENH-4) */}
        {message.metadata?.images && message.metadata.images.length > 0 && (
          <ImageDisplay images={message.metadata.images} token={token} />
        )}

        {/* Option buttons (for assistant messages with options) */}
        {message.metadata?.options && message.metadata.options.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Select an option:</p>
            <div className="flex flex-wrap gap-2">
              {message.metadata.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption?.(option.id)}
                  disabled={!!message.metadata?.selectedOption}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    message.metadata?.selectedOption === option.id
                      ? 'bg-violet-500 text-white'
                      : message.metadata?.selectedOption
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={option.description}
                >
                  {option.id}: {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata footer */}
        {message.metadata && !isUser && (
          <div className="mt-3 pt-2 border-t border-gray-700/30">
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {/* Model info */}
              {message.metadata.model && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {message.metadata.model.provider}/{message.metadata.model.model}
                </span>
              )}

              {/* Usage info */}
              {message.metadata.usage && (
                <>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${message.metadata.usage.costUsd.toFixed(4)}
                  </span>
                  <span>{message.metadata.usage.latencyMs}ms</span>
                  <span>{message.metadata.usage.inputTokens + message.metadata.usage.outputTokens} tokens</span>
                </>
              )}

              {/* Verification badge */}
              {message.metadata.verification && (
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    message.metadata.verification.verdict === 'PASS'
                      ? 'bg-green-500/20 text-green-400'
                      : message.metadata.verification.verdict === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {message.metadata.verification.verdict}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? 'text-violet-200/60' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
