/**
 * Sidebar Navigation Component
 *
 * Collapsible left sidebar with:
 * - Icon-based navigation
 * - Expand/collapse toggle
 * - Quick action buttons
 * - User profile section
 *
 * Reference: Walkflow.png, Dashboard.webp mockups
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

// ============================================================================
// Navigation Items
// ============================================================================

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: <ProjectsIcon />, path: '/dashboard' },
  { id: 'chat', label: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
  { id: 'activity', label: 'Activity', icon: <ActivityIcon />, path: '/activity' },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { id: 'help', label: 'Documentation', icon: <HelpIcon />, path: '/docs' },
];

// ============================================================================
// Sub-Components
// ============================================================================

// Nav Item Component
function NavItemComponent({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  // Determine data-tour attribute for onboarding
  const tourAttribute = item.id === 'settings' ? 'settings-link' : item.id === 'help' ? 'docs-link' : undefined;

  return (
    <Link
      to={item.path}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-violet-500/20 text-violet-400'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? item.label : undefined}
      data-tour={tourAttribute}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="bg-violet-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// User Profile Section
function UserProfile({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className={`
      flex items-center gap-3 px-3 py-2.5 rounded-lg
      ${isCollapsed ? 'justify-center' : ''}
    `}>
      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{initials}</span>
      </div>
      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium truncate">
            {user.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Sidebar({ isOpen = true, onToggle, className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Don't show sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  // Check if a nav item is active
  const isItemActive = (item: NavItem) => {
    if (item.path === '/dashboard' && item.id === 'dashboard') {
      return location.pathname === '/dashboard';
    }
    if (item.path === '/dashboard' && item.id === 'projects') {
      return location.pathname.startsWith('/project/');
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 z-40
        bg-gray-900/95 backdrop-blur-sm border-r border-gray-800
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-56'}
        ${className}
      `}
    >
      {/* Logo/Brand (collapsed state) */}
      {isCollapsed && (
        <div className="p-3 border-b border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" data-tour="sidebar-nav">
        {/* Main Nav Section */}
        {!isCollapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </p>
        )}
        {mainNavItems.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            isActive={isItemActive(item)}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-gray-800" />

        {/* Quick Actions */}
        {!isCollapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </p>
        )}
        {/* D-006 FIX: New Project button now navigates to dashboard with create param */}
        <button
          onClick={() => navigate('/dashboard?create=true')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            bg-violet-600/20 text-violet-400 hover:bg-violet-600/30
            transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'New Project' : undefined}
          data-tour="new-project"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">New Project</span>}
        </button>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            isActive={isItemActive(item)}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* User Profile */}
        <div className="pt-3 border-t border-gray-800 mt-3">
          <UserProfile isCollapsed={isCollapsed} />
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-gray-500 hover:text-white hover:bg-gray-800/50
            transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon isCollapsed={isCollapsed} />
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
