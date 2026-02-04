/**
 * DocsIndex (Overview) Page
 *
 * Main documentation landing page explaining AIXORD concepts.
 */

import { Link } from 'react-router-dom';
import { Rocket, Key, HelpCircle } from 'lucide-react';

export function DocsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">AIXORD Documentation</h1>
      <p className="text-gray-300 text-lg mb-8">
        AIXORD is a governed AI collaboration platform. It transforms chaotic AI conversations
        into structured, accountable project execution.
      </p>

      <h2 className="text-xl font-semibold text-white mb-4">Core Concepts</h2>
      <ul className="space-y-3 text-gray-300 mb-8">
        <li><strong className="text-white">Projects</strong> — Containers for governed AI work with defined objectives</li>
        <li><strong className="text-white">Phases</strong> — Brainstorm → Plan → Execute → Review progression</li>
        <li><strong className="text-white">Gates</strong> — Checkpoints that enforce quality and safety</li>
        <li><strong className="text-white">Decisions</strong> — Logged approvals and rejections for audit</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mb-4">The AIXORD Governance Model</h2>
      <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700/50">
        <p className="text-gray-300 mb-4">
          AIXORD enforces a clear authority model:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">Director</span>
            <span>— You. Makes all decisions, approves work.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">Architect</span>
            <span>— AI. Recommends approaches, analyzes options.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">Commander</span>
            <span>— AI. Executes approved work within bounds.</span>
          </li>
        </ul>
        <p className="text-gray-400 text-sm mt-4">
          The AI cannot act without your approval. You remain in control.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">Get Started</h2>
      <div className="grid gap-4">
        <Link
          to="/docs/quick-start"
          className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Rocket className="text-purple-400" size={24} />
          <div>
            <h3 className="text-white font-medium">Quick Start Guide</h3>
            <p className="text-gray-400 text-sm">Create your first governed project in minutes</p>
          </div>
        </Link>
        <Link
          to="/docs/api-keys"
          className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Key className="text-purple-400" size={24} />
          <div>
            <h3 className="text-white font-medium">API Keys & BYOK</h3>
            <p className="text-gray-400 text-sm">Configure your AI provider keys</p>
          </div>
        </Link>
        <Link
          to="/docs/troubleshooting"
          className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <HelpCircle className="text-purple-400" size={24} />
          <div>
            <h3 className="text-white font-medium">Troubleshooting</h3>
            <p className="text-gray-400 text-sm">Solutions to common issues</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default DocsIndex;
