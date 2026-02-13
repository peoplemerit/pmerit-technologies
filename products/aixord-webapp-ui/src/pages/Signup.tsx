/**
 * Signup Page
 *
 * User registration form with email verification.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { register, isLoading, error, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately (one-time check on mount)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, []); // Empty deps - only check on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name || undefined, username || undefined);
      setRegistrationComplete(true);
    } catch {
      // Error is handled by useAuth
    }
  };

  // Show success screen after registration
  if (registrationComplete) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 relative">
            {/* D-007 FIX: Added close button */}
            <button
              onClick={() => setRegistrationComplete(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Account created!</h1>
              <p className="text-gray-400 mt-2">
                Your account has been set up for
              </p>
              <p className="text-white font-medium mt-1">{email}</p>
            </div>

            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-violet-300">
                  <p className="font-medium mb-1">Your 14-day free trial includes:</p>
                  <ul className="list-disc list-inside space-y-1 text-violet-200/80">
                    <li>Platform AI keys included (no setup needed)</li>
                    <li>Full AIXORD governance features</li>
                    <li>Up to 50 AI requests</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-lg font-medium transition-colors text-center"
              >
                Continue to Login
              </Link>
              <button
                onClick={() => setRegistrationComplete(false)}
                className="block w-full text-gray-400 hover:text-white py-2 text-sm transition-colors text-center"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Get started with AIXORD governance</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="your-username"
                pattern="^[a-zA-Z0-9_-]{3,30}$"
              />
              <p className="text-xs text-gray-500 mt-1">3-30 characters, letters, numbers, _ or -</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Your name"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
