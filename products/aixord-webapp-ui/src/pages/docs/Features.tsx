/**
 * Features Page
 *
 * Feature reference for AIXORD platform.
 */

export function Features() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Features</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Governed AI Chat</h2>
        <p className="text-gray-300 mb-3">
          Every AI interaction follows AIXORD governance rules. The AI cannot act autonomously —
          it recommends, you decide.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• All conversations are logged with timestamps</li>
            <li>• AI responses include verification badges</li>
            <li>• Token usage and costs are tracked per message</li>
            <li>• Context is maintained within project scope</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Phase Progression</h2>
        <p className="text-gray-300 mb-3">
          Projects move through structured phases: Brainstorm → Plan → Execute → Review.
          Each phase has specific objectives and gates.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <h4 className="text-yellow-400 font-medium">Brainstorm</h4>
            <p className="text-gray-400 text-sm">Explore possibilities</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-400 font-medium">Plan</h4>
            <p className="text-gray-400 text-sm">Define approach</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <h4 className="text-purple-400 font-medium">Execute</h4>
            <p className="text-gray-400 text-sm">Build with verification</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <h4 className="text-green-400 font-medium">Review</h4>
            <p className="text-gray-400 text-sm">Audit and lock</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Quality Gates</h2>
        <p className="text-gray-300 mb-3">
          Gates are checkpoints that ensure quality and safety. Work cannot proceed until
          required gates are satisfied.
        </p>
        <ul className="space-y-2 text-gray-300">
          <li><strong className="text-white">Setup Gates</strong> — License, disclaimer, objective, data classification</li>
          <li><strong className="text-white">Security Gates</strong> — Data protection, access controls, jurisdiction</li>
          <li><strong className="text-white">Execution Gates</strong> — Verification, sign-off, handoff</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Decision Logging</h2>
        <p className="text-gray-300 mb-3">
          All approvals and rejections are logged with timestamps. Full audit trail for
          accountability and compliance.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">
            Every decision includes: timestamp, decision type (APPROVED/REJECTED), rationale,
            and the actor who made it. This creates an immutable record of project governance.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Multi-Model Support</h2>
        <p className="text-gray-300 mb-3">
          Use your preferred AI models from multiple providers.
          Switch models based on task requirements.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-medium">Anthropic</h4>
            <p className="text-gray-400 text-sm">Claude Sonnet, Opus</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-medium">OpenAI</h4>
            <p className="text-gray-400 text-sm">GPT-4o, GPT-4o-mini</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-medium">Google</h4>
            <p className="text-gray-400 text-sm">Gemini 2.0 Flash</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-medium">DeepSeek</h4>
            <p className="text-gray-400 text-sm">DeepSeek Chat</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Usage Analytics</h2>
        <p className="text-gray-300 mb-3">
          Track token usage, costs, and request patterns. Monitor your AI spending
          across all projects.
        </p>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Per-message cost breakdown</li>
          <li>• Daily/weekly/monthly usage trends</li>
          <li>• Model comparison statistics</li>
          <li>• Project-level cost allocation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">File Integration</h2>
        <p className="text-gray-300">
          Link local folders to projects for context-aware AI assistance. Attach files
          to messages for code review, analysis, and documentation.
        </p>
      </section>
    </div>
  );
}

export default Features;
