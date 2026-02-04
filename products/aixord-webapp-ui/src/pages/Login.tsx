/**
 * Login Page
 *
 * Hybrid authentication: Email/password primary, API key secondary.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type LoginMethod = 'email' | 'apikey';

export function Login() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { login, loginWithEmail, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (loginMethod === 'email') {
        await loginWithEmail(email, password);
      } else {
        await login(apiKey);
      }
      // Use React Router navigate - this preserves SPA state and localStorage
      // The useEffect above will handle the redirect once isAuthenticated becomes true
    } catch {
      // Error is handled by useAuth
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
          {/* Login method tabs */}
          <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('apikey')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'apikey'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              API Key
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {loginMethod === 'email' ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  placeholder="aixord_..."
                />
                <p className="text-gray-500 text-xs mt-2">
                  Your API key was provided when you created your account.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
