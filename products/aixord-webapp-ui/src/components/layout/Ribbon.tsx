/**
 * Ribbon Component (Detail Panel — Hybrid Ribbon Layout)
 *
 * Collapsible detail panel below the MiniBar.
 * Maximum height 140px to preserve chat space.
 * Click a tab in TabBar or MiniBar to expand; click again to collapse.
 */

import { useEffect } from 'react';

interface RibbonProps {
  activeTab: string | null;
  onClose: () => void;
  children: React.ReactNode;
}

export function Ribbon({ activeTab, onClose, children }: RibbonProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTab) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onClose]);

  if (!activeTab) return null;

  return (
    <div className="ribbon-container overflow-hidden border-b border-gray-700/50 bg-gray-800/50 animate-slideDown">
      <div className="relative max-h-[140px] overflow-x-auto overflow-y-hidden px-4 py-2">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700 rounded transition-colors z-10"
          aria-label="Close detail panel"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Ribbon;
