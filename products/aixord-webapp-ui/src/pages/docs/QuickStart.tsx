/**
 * QuickStart Page
 *
 * Getting started guide for new users.
 */

export function QuickStart() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Quick Start Guide</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Create an Account</h2>
        <p className="text-gray-300">
          Sign up with your email address. After registration, you'll have access to
          create governed AI projects.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Add Your API Keys</h2>
        <p className="text-gray-300 mb-3">
          AIXORD uses <strong className="text-white">BYOK (Bring Your Own Key)</strong> mode.
          You need to provide API keys for the AI providers you want to use.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Go to <strong className="text-white">Settings</strong> in the sidebar</li>
          <li>Find the <strong className="text-white">API Keys</strong> section</li>
          <li>Add keys for your preferred providers (Anthropic, OpenAI, Google, DeepSeek)</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Create a Project</h2>
        <p className="text-gray-300 mb-3">
          Click <strong className="text-white">New Project</strong> and provide:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong className="text-white">Name</strong> — A descriptive title for your work</li>
          <li><strong className="text-white">Objective</strong> — What you want to achieve</li>
          <li><strong className="text-white">Reality Classification</strong>:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Greenfield — Starting from scratch</li>
              <li>Brownfield — Modifying existing work</li>
              <li>Legacy — Working with legacy systems</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Work Through Phases</h2>
        <p className="text-gray-300 mb-3">
          Each project progresses through governed phases:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
            <span className="text-yellow-400 font-bold text-lg">1</span>
            <div>
              <strong className="text-white">Brainstorm</strong>
              <p className="text-gray-400 text-sm">Explore ideas and possibilities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
            <span className="text-blue-400 font-bold text-lg">2</span>
            <div>
              <strong className="text-white">Plan</strong>
              <p className="text-gray-400 text-sm">Define scope, deliverables, and steps</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
            <span className="text-purple-400 font-bold text-lg">3</span>
            <div>
              <strong className="text-white">Execute</strong>
              <p className="text-gray-400 text-sm">Build and implement with verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
            <span className="text-green-400 font-bold text-lg">4</span>
            <div>
              <strong className="text-white">Review</strong>
              <p className="text-gray-400 text-sm">Audit work and lock completed items</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Complete Gates</h2>
        <p className="text-gray-300 mb-3">
          Gates are checkpoints that ensure project quality. Complete setup gates before execution:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li><strong className="text-white">LIC</strong> — License verification</li>
          <li><strong className="text-white">DIS</strong> — Disclaimer accepted</li>
          <li><strong className="text-white">OBJ</strong> — Objective confirmed</li>
          <li><strong className="text-white">DC</strong> — Data classification set</li>
        </ul>
        <p className="text-gray-400 text-sm mt-3">
          The AI cannot help with execution until required gates are complete.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Next Steps</h2>
        <p className="text-gray-300">
          Now you're ready to collaborate with AI in a governed way. The AI will recommend
          approaches, and you decide what to approve. All decisions are logged for
          accountability and audit.
        </p>
      </section>
    </div>
  );
}

export default QuickStart;
