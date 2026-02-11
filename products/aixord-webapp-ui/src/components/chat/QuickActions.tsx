/**
 * Quick Action Suggestion Buttons
 *
 * Phase-aware suggestion chips displayed above the chat input.
 * Allows users to inject common responses (Approve, Let's move on, etc.)
 * without typing, since the user's primary role is review & approve.
 */

type Mode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';
type Phase = string; // BRAINSTORM | PLAN | EXECUTE | REVIEW etc.

interface QuickAction {
  label: string;
  text: string; // The actual message sent to chat
}

interface QuickActionsProps {
  phase: Phase;
  onSend: (message: string, mode: Mode) => void;
  isLoading: boolean;
  lastMessageRole?: 'user' | 'assistant' | 'system';
  defaultMode?: Mode;
}

const PHASE_ACTIONS: Record<string, QuickAction[]> = {
  BRAINSTORM: [
    { label: 'Approve ✓', text: 'Approved. Let\'s move on to planning.' },
    { label: 'Continue exploring', text: 'Continue exploring this direction.' },
    { label: 'Let\'s move on →', text: 'Let\'s move on to the next step.' },
  ],
  B: [
    { label: 'Approve ✓', text: 'Approved. Let\'s move on to planning.' },
    { label: 'Continue exploring', text: 'Continue exploring this direction.' },
    { label: 'Let\'s move on →', text: 'Let\'s move on to the next step.' },
  ],
  PLAN: [
    { label: 'Approve plan ✓', text: 'Plan approved. Let\'s finalize and move to execution.' },
    { label: 'Let\'s finalize →', text: 'Let\'s finalize the plan.' },
    { label: 'Adjust plan', text: 'I\'d like to adjust the plan. Here are my concerns:' },
  ],
  P: [
    { label: 'Approve plan ✓', text: 'Plan approved. Let\'s finalize and move to execution.' },
    { label: 'Let\'s finalize →', text: 'Let\'s finalize the plan.' },
    { label: 'Adjust plan', text: 'I\'d like to adjust the plan. Here are my concerns:' },
  ],
  EXECUTE: [
    { label: 'Continue', text: 'Continue with the next task.' },
    { label: 'Let\'s move on →', text: 'Let\'s move on to the next step.' },
    { label: 'Looks good ✓', text: 'Looks good. Continue.' },
  ],
  E: [
    { label: 'Continue', text: 'Continue with the next task.' },
    { label: 'Let\'s move on →', text: 'Let\'s move on to the next step.' },
    { label: 'Looks good ✓', text: 'Looks good. Continue.' },
  ],
  REVIEW: [
    { label: 'Accept ✓', text: 'Accepted. This meets the requirements.' },
    { label: 'Needs revision', text: 'This needs revision. Please address the following:' },
    { label: 'Let\'s finalize →', text: 'Let\'s finalize and close this out.' },
  ],
  R: [
    { label: 'Accept ✓', text: 'Accepted. This meets the requirements.' },
    { label: 'Needs revision', text: 'This needs revision. Please address the following:' },
    { label: 'Let\'s finalize →', text: 'Let\'s finalize and close this out.' },
  ],
};

// Fallback actions for unknown phases
const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'Continue', text: 'Continue.' },
  { label: 'Approve ✓', text: 'Approved. Proceed.' },
  { label: 'Let\'s move on →', text: 'Let\'s move on.' },
];

export function QuickActions({ phase, onSend, isLoading, lastMessageRole, defaultMode = 'BALANCED' }: QuickActionsProps) {
  // Only show when it's the user's turn (last message is from assistant)
  if (isLoading || lastMessageRole !== 'assistant') return null;

  const actions = PHASE_ACTIONS[phase] || DEFAULT_ACTIONS;

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
      <span className="text-gray-500 text-xs shrink-0">Quick:</span>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onSend(action.text, defaultMode)}
          className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-gray-700/60 bg-gray-800/40 text-gray-300 hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300 transition-all"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export type { Mode };
export default QuickActions;
