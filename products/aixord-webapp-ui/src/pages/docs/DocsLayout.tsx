/**
 * DocsLayout Component
 *
 * Layout wrapper for documentation pages with sidebar navigation.
 */

import { NavLink, Outlet } from 'react-router-dom';
import { Book, Rocket, Layers, Key, HelpCircle } from 'lucide-react';

const DOCS_NAV = [
  { path: '/docs', label: 'Overview', icon: <Book size={18} />, exact: true },
  { path: '/docs/quick-start', label: 'Quick Start', icon: <Rocket size={18} /> },
  { path: '/docs/features', label: 'Features', icon: <Layers size={18} /> },
  { path: '/docs/api-keys', label: 'API Keys & BYOK', icon: <Key size={18} /> },
  { path: '/docs/troubleshooting', label: 'Troubleshooting', icon: <HelpCircle size={18} /> },
];

export function DocsLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-6">Documentation</h2>
        <nav className="space-y-1">
          {DOCS_NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to app link */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </NavLink>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DocsLayout;
