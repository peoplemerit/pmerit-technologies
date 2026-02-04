/**
 * ApiKeys Page
 *
 * BYOK setup instructions for API keys.
 */

export function ApiKeys() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">API Keys & BYOK</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">What is BYOK?</h2>
        <p className="text-gray-300">
          <strong className="text-white">BYOK (Bring Your Own Key)</strong> means you use your own
          API keys from AI providers. AIXORD routes your requests to these providers using your keys.
        </p>
        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-purple-300 text-sm">
            <strong>Why BYOK?</strong> You maintain full control over your API usage and costs.
            Your keys are encrypted and never shared with third parties.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Supported Providers</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Anthropic (Claude)</h3>
            <p className="text-gray-400 text-sm mb-2">Models: Claude 3.5 Sonnet, Claude 3 Opus</p>
            <p className="text-gray-300 text-sm">
              Get your key at{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                console.anthropic.com
              </a>
            </p>
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono text-gray-400">
              Format: sk-ant-api03-...
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">OpenAI (GPT)</h3>
            <p className="text-gray-400 text-sm mb-2">Models: GPT-4o, GPT-4o-mini</p>
            <p className="text-gray-300 text-sm">
              Get your key at{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                platform.openai.com
              </a>
            </p>
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono text-gray-400">
              Format: sk-proj-...
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Google (Gemini)</h3>
            <p className="text-gray-400 text-sm mb-2">Models: Gemini 2.0 Flash, Gemini 2.0 Flash Lite</p>
            <p className="text-gray-300 text-sm">
              Get your key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                aistudio.google.com
              </a>
            </p>
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono text-gray-400">
              Format: AIza...
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">DeepSeek</h3>
            <p className="text-gray-400 text-sm mb-2">Models: DeepSeek Chat, DeepSeek Coder</p>
            <p className="text-gray-300 text-sm">
              Get your key at{' '}
              <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                platform.deepseek.com
              </a>
            </p>
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono text-gray-400">
              Format: sk-...
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Adding API Keys</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          <li>Navigate to <strong className="text-white">Settings</strong> from the sidebar</li>
          <li>Click the <strong className="text-white">API Keys</strong> tab</li>
          <li>Enter your key for each provider you want to use</li>
          <li>Click <strong className="text-white">Save</strong> to store the key securely</li>
        </ol>
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Security Note:</strong> Your API keys are encrypted at rest and in transit.
            They are only used to make requests on your behalf and are never shared or logged.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Model Selection</h2>
        <p className="text-gray-300 mb-3">
          Once you've added API keys, you can select which model to use for each conversation.
          Different models have different strengths:
        </p>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• <strong className="text-white">Claude Sonnet</strong> — Fast, capable, great for most tasks</li>
          <li>• <strong className="text-white">Claude Opus</strong> — Most capable, best for complex reasoning</li>
          <li>• <strong className="text-white">GPT-4o</strong> — Versatile, good multimodal support</li>
          <li>• <strong className="text-white">Gemini Flash</strong> — Very fast, cost-effective</li>
          <li>• <strong className="text-white">DeepSeek</strong> — Strong at coding tasks</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">Cost Management</h2>
        <p className="text-gray-300 mb-3">
          Since you use your own API keys, costs are billed directly by each provider.
          AIXORD displays cost estimates per message to help you track spending.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm">
            Pro tip: Use faster, cheaper models like Gemini Flash or GPT-4o-mini for simple tasks,
            and reserve premium models like Claude Opus for complex reasoning.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ApiKeys;
