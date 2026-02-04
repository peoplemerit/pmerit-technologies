/**
 * Troubleshooting Page
 *
 * Common issues and solutions.
 */

import { Link } from 'react-router-dom';

export function Troubleshooting() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Troubleshooting</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">BYOK_KEY_MISSING</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-red-400 font-mono text-sm mb-3">
            Error: BYOK_KEY_MISSING: BYOK mode requires user_api_key
          </p>
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> No API key configured for the selected model provider.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solution:</strong> Go to{' '}
            <Link to="/settings" className="text-purple-400 hover:underline">Settings</Link>
            {' '}→ API Keys and add your key for the provider you want to use
            (Anthropic, OpenAI, Google, or DeepSeek).
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">INVALID_API_KEY</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-red-400 font-mono text-sm mb-3">
            Error: INVALID_API_KEY: The API key is invalid or expired
          </p>
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> The API key you provided is incorrect, expired, or revoked.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solution:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-300 mt-2 ml-4">
            <li>Go to your provider's dashboard and verify the key is active</li>
            <li>Copy the key again (make sure to copy the full key)</li>
            <li>Update the key in <Link to="/settings" className="text-purple-400 hover:underline">Settings</Link></li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">RATE_LIMIT</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-red-400 font-mono text-sm mb-3">
            Error: RATE_LIMIT: Too many requests
          </p>
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> You've exceeded your API rate limit for this provider.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solution:</strong> Wait a few moments and try again.
            If this happens frequently, consider upgrading your API plan with the provider
            or using a different model.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Session Expires After Refresh</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> Browser settings may be blocking cookies or clearing storage.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solutions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2 ml-4">
            <li>Ensure cookies are enabled for this site</li>
            <li>Disable any browser extensions that clear cookies</li>
            <li>Try a different browser</li>
            <li>Use incognito mode to test (may reveal extension issues)</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Governance State Not Initialized</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> Project was created before a recent update, or there was a database sync issue.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solution:</strong> Create a new project. New projects will have
            properly initialized governance state. If the issue persists, try logging out and back in.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Gates Panel Shows "Loading..."</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> Gates data not yet loaded from server, or network issue.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solution:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2 ml-4">
            <li>Refresh the page</li>
            <li>Check your internet connection</li>
            <li>If persistent, the project may need to be recreated</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Project Creation Fails</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-red-400 font-mono text-sm mb-3">
            Error: Failed to create project
          </p>
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> Server error during project creation.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solutions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2 ml-4">
            <li>Check your internet connection</li>
            <li>Ensure project name is not empty</li>
            <li>Try again in a few moments</li>
            <li>If persistent, contact support</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">AI Response is Empty or Incomplete</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-3">
            <strong className="text-white">Cause:</strong> Model hit token limit, rate limit, or network timeout.
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Solutions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2 ml-4">
            <li>Try sending the message again</li>
            <li>Break complex requests into smaller parts</li>
            <li>Try a different model</li>
            <li>Check your API provider's status page</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Need More Help?</h2>
        <p className="text-gray-300">
          If your issue isn't listed here, contact support at{' '}
          <a href="mailto:support@pmerit.com" className="text-purple-400 hover:underline">
            support@pmerit.com
          </a>
        </p>
        <p className="text-gray-400 text-sm mt-2">
          When contacting support, please include:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm mt-1 ml-4">
          <li>The exact error message</li>
          <li>Steps to reproduce the issue</li>
          <li>Your browser and operating system</li>
          <li>Screenshots if applicable</li>
        </ul>
      </section>
    </div>
  );
}

export default Troubleshooting;
