/**
 * Onboarding Checklist Component (H3)
 *
 * Shows getting started tasks with progress tracking
 * Per HANDOFF-D4-COMPREHENSIVE-V12
 */

import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  hasProjects?: boolean;
  hasApiKeys?: boolean;
  hasSentMessage?: boolean;
}

export function OnboardingChecklist({
  hasProjects = false,
  hasApiKeys = false,
  hasSentMessage = false,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  // Build items based on props
  const items: ChecklistItem[] = [
    { id: 'create-project', label: 'Create your first project', completed: hasProjects },
    { id: 'configure-keys', label: 'Configure API keys or start trial', completed: hasApiKeys },
    { id: 'first-chat', label: 'Send your first governed chat', completed: hasSentMessage },
  ];

  const completedCount = items.filter(i => i.completed).length;
  const allComplete = completedCount === items.length;

  // Load dismissed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-checklist-dismissed');
    if (saved === 'true') setDismissed(true);
  }, []);

  // Auto-dismiss when all complete
  useEffect(() => {
    if (allComplete) {
      localStorage.setItem('onboarding-checklist-dismissed', 'true');
    }
  }, [allComplete]);

  if (dismissed || allComplete) return null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium">Getting Started</h3>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem('onboarding-checklist-dismissed', 'true');
          }}
          className="text-gray-500 text-sm hover:text-gray-300"
        >
          Dismiss
        </button>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center gap-2">
            {item.completed ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
            )}
            <span className={item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
