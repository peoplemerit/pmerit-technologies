/**
 * CollapsibleSection Component (D7)
 *
 * Reusable collapsible section with header and expandable content.
 * Used throughout the UI for organizing information into togglable groups.
 */

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  badge?: string | number;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  badgeColor = 'bg-gray-600',
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-700/50 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-gray-200">{title}</span>
        </div>
        {badge !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${badgeColor} text-white`}>
            {badge}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-3 py-2 bg-gray-900/30">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
