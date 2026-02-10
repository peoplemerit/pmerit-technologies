/**
 * TabBar Component (Ribbon-Style Layout)
 *
 * Top navigation bar with tabs that control the ribbon content.
 * Click a tab to open its ribbon content, click again to close.
 * Includes compact nav menu for accessing Dashboard, Projects, Settings
 * when the full Layout sidebar is hidden on project pages.
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Tab {
  id: 'governance' | 'blueprint' | 'security' | 'evidence' | 'engineering' | 'tasks' | 'info';
  label: string;
}

interface TabBarProps {
  activeTab: string | null;
  onTabClick: (tabId: string) => void;
  projectName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onNewSession?: () => void;
  projectId?: string;
  sessionNumber?: number;
  /** Tabs to hide (e.g., for non-software project types) */
  hiddenTabs?: string[];
}

const tabs: Tab[] = [
  { id: 'governance', label: 'Governance' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'security', label: 'Security' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'info', label: 'Info' },
];

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat', label: 'AI Chat' },
  { to: '/activity', label: 'Activity' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

export function TabBar({
  activeTab,
  onTabClick,
  projectName,
  userEmail,
  onLogout,
  onNewSession,
  projectId,
  sessionNumber,
  hiddenTabs = [],
}: TabBarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    }
    if (navOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [navOpen]);

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-gray-900 border-b border-gray-700/50">
      {/* Logo + Nav Menu + Project Name */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold hidden sm:inline">AIXORD</span>
        </Link>

        {/* Compact nav dropdown */}
        <div className="relative" ref={navRef}>
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Navigation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {navOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setNavOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-700 my-1" />
              {projectId && onNewSession && (
                <button
                  onClick={() => { onNewSession(); setNavOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-gray-700/50 transition-colors"
                >
                  + New Session
                </button>
              )}
              <Link
                to="/dashboard?create=true"
                onClick={() => setNavOpen(false)}
                className="block px-4 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-gray-700/50 transition-colors"
              >
                + New Project
              </Link>
            </div>
          )}
        </div>

        {projectName && (
          <>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 text-sm truncate max-w-[200px]">{projectName}</span>
            {sessionNumber && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-xs">S{sessionNumber}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.filter((tab) => !hiddenTabs.includes(tab.id)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="text-gray-400 text-sm hidden md:inline">{userEmail}</span>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default TabBar;
