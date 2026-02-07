/**
 * Ribbon Component (Ribbon-Style Layout)
 *
 * Collapsible container that shows content based on active tab.
 * Maximum height capped to prevent taking over the screen.
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
      <div className="relative max-h-[180px] overflow-x-auto overflow-y-hidden p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors z-10"
          aria-label="Close ribbon"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Ribbon;
