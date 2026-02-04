/**
 * Tour Overlay Component (H3)
 *
 * Guided product tour with spotlight and tooltips
 * Per HANDOFF-D4-COMPREHENSIVE-V12
 */

import { useState, useEffect } from 'react';

interface TourStep {
  target: string;       // data-tour attribute value
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'sidebar-nav',
    title: 'Navigation',
    content: 'Access your Dashboard, Projects, AI Chat, and Settings from here.',
    placement: 'right'
  },
  {
    target: 'new-project',
    title: 'Create a Project',
    content: 'Every governed AI conversation starts with a project. Click here to create one.',
    placement: 'right'
  },
  {
    target: 'phase-selector',
    title: 'Project Phases',
    content: 'Projects move through 4 phases: Brainstorm → Plan → Execute → Review. Each phase has specific objectives.',
    placement: 'bottom'
  },
  {
    target: 'gate-panel',
    title: 'Quality Gates',
    content: 'Gates are safety checkpoints. Work cannot proceed until required gates are satisfied.',
    placement: 'left'
  },
  {
    target: 'decision-log',
    title: 'Decision Log',
    content: 'Every approval and rejection is recorded here. This is your audit trail.',
    placement: 'bottom'
  },
  {
    target: 'chat-input',
    title: 'Governed Chat',
    content: 'Chat with AI models here. Responses are governed by your project phase and gates.',
    placement: 'top'
  },
  {
    target: 'settings-link',
    title: 'Settings & API Keys',
    content: 'Configure your API keys (BYOK), subscription, and preferences here.',
    placement: 'right'
  },
  {
    target: 'docs-link',
    title: 'Documentation',
    content: 'Full guides on getting started, features, and troubleshooting.',
    placement: 'right'
  }
];

interface TourOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function TourOverlay({ onComplete, onSkip }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Small delay to allow scroll to complete
      setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 300);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step.target]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Calculate tooltip position based on placement
  const getTooltipStyle = () => {
    if (!targetRect) return {};

    const padding = 12;
    switch (step.placement) {
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - padding,
          transform: 'translate(-100%, -50%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onSkip} />

      {/* Spotlight cutout + tooltip */}
      {targetRect && (
        <>
          {/* Highlighted element border */}
          <div
            className="absolute border-2 border-purple-400 rounded-lg z-50 pointer-events-none animate-pulse"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />

          {/* Tooltip card */}
          <div
            className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl max-w-sm"
            style={getTooltipStyle()}
          >
            <p className="text-xs text-purple-400 mb-1">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </p>
            <h3 className="text-white font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{step.content}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={onSkip}
                className="text-gray-500 text-sm hover:text-gray-300"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 text-sm text-gray-300 hover:text-white"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                >
                  {isLast ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* If target not found, show generic message */}
      {!targetRect && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-lg p-6 shadow-xl max-w-sm text-center">
          <p className="text-gray-300 mb-4">Navigate to a project to continue the tour.</p>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
