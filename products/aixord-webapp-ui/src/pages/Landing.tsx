/**
 * Landing Page
 *
 * Public homepage with AIXORD branding and value proposition.
 */

import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
              <span className="text-violet-400 text-sm font-medium">
                AIXORD Governance Framework
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Authority. Execution.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Verification.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              The governance framework that keeps AI projects on track.
              Persistent state, gate enforcement, and phase management
              across sessions, devices, and AI models.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-lg shadow-violet-500/25"
              >
                Get Started
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-colors"
              >
                Login with API Key
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              AI Governance, Simplified
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              AIXORD provides the infrastructure to maintain control over AI-assisted projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gate Enforcement</h3>
              <p className="text-gray-400">
                13 gates ensure work proceeds only when prerequisites are met.
                From License to Handoff, every checkpoint matters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Persistent State</h3>
              <p className="text-gray-400">
                State persists across sessions, devices, and AI models.
                Pick up exactly where you left off, every time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Phase Management</h3>
              <p className="text-gray-400">
                BRAINSTORM → PLAN → BLUEPRINT → EXECUTE → VERIFY.
                Clear phases keep projects moving forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Three roles work together to deliver governed AI projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Director</h3>
              <p className="text-gray-400">
                The human who decides <strong className="text-white">WHAT</strong>.
                Approves work and owns outcomes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Architect</h3>
              <p className="text-gray-400">
                The AI that recommends <strong className="text-white">HOW</strong>.
                Analyzes, specifies, and advises.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Commander</h3>
              <p className="text-gray-400">
                The AI that <strong className="text-white">EXECUTES</strong> approved work.
                Implements within strict bounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to govern your AI projects?
          </h2>
          <p className="text-gray-400 mb-8">
            Create your free account and start managing AI-assisted projects with confidence.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-lg shadow-violet-500/25"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
