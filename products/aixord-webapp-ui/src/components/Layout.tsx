/**
 * Layout Component
 *
 * Main layout wrapper with navigation header and sidebar.
 */

import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';

export function Layout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-semibold text-white">AIXORD</span>
            </Link>

            {/* Navigation - wait for auth to load before showing login/logout buttons */}
            <nav className="flex items-center space-x-4">
              {isLoading ? (
                // Show loading placeholder while auth is being verified
                <div className="h-8 w-24 bg-gray-800/50 rounded animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors px-3 py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-300 hover:text-white transition-colors px-3 py-2"
                  >
                    Settings
                  </Link>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                // Not loading and not authenticated - show login/signup
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar
          isOpen={true}
          onToggle={handleSidebarToggle}
        />
      )}

      {/* Main Content */}
      <main className={`
        transition-all duration-300
        ${isAuthenticated ? (sidebarCollapsed ? 'ml-16' : 'ml-56') : ''}
      `}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PMERIT Technologies LLC
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy-policy.html" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
