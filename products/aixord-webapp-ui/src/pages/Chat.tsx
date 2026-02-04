/**
 * AI Chat Landing Page
 *
 * Features:
 * - Welcome state with greeting
 * - Quick action cards/suggestions
 * - Recent conversations list
 * - Model selector preview
 * - Start new chat functionality
 *
 * Reference: Chat section mockups
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useApi';

// ============================================================================
// Types
// ============================================================================

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  color: string;
}

interface RecentChat {
  id: string;
  title: string;
  projectName: string;
  projectId: string;
  lastMessage: string;
  timestamp: string;
}

// ============================================================================
// Quick Actions Data
// ============================================================================

const quickActions: QuickAction[] = [
  {
    id: 'brainstorm',
    title: 'Brainstorm Ideas',
    description: 'Generate creative solutions and explore possibilities',
    prompt: 'Help me brainstorm ideas for',
    color: 'from-violet-500 to-purple-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'plan',
    title: 'Plan a Project',
    description: 'Create structured plans and roadmaps',
    prompt: 'Help me plan the implementation of',
    color: 'from-blue-500 to-cyan-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'review',
    title: 'Review Code',
    description: 'Get feedback on code quality and architecture',
    prompt: 'Review my code and suggest improvements for',
    color: 'from-green-500 to-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'debug',
    title: 'Debug an Issue',
    description: 'Troubleshoot problems and find solutions',
    prompt: 'Help me debug this issue:',
    color: 'from-orange-500 to-red-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

// Greeting Component
function Greeting({ userName }: { userName: string }) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-white mb-3">
        {getTimeBasedGreeting()}, {userName}
      </h1>
      <p className="text-gray-400 text-lg">
        How can I assist you today?
      </p>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({
  action,
  onSelect,
}: {
  action: QuickAction;
  onSelect: (prompt: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(action.prompt)}
      className="group relative overflow-hidden bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl p-5 text-left transition-all duration-200"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${action.color} transition-opacity`} />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4`}>
        {action.icon}
      </div>
      <h3 className="text-white font-semibold mb-1">{action.title}</h3>
      <p className="text-gray-400 text-sm">{action.description}</p>
    </button>
  );
}

// Recent Chat Item
function RecentChatItem({ chat }: { chat: RecentChat }) {
  return (
    <Link
      to={`/project/${chat.projectId}`}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-white font-medium truncate">{chat.title}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap">{chat.timestamp}</span>
        </div>
        <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
        <p className="text-xs text-violet-400 mt-1">{chat.projectName}</p>
      </div>
    </Link>
  );
}

// Model Selector Preview
function ModelSelectorPreview() {
  const models = [
    { id: 'claude-4', name: 'Claude 4 Opus', badge: 'Most Capable' },
    { id: 'claude-3.5', name: 'Claude 3.5 Sonnet', badge: 'Balanced' },
    { id: 'gpt-4', name: 'GPT-4 Turbo', badge: 'Fast' },
  ];

  return (
    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Select Model</h3>
        <Link to="/settings" className="text-xs text-violet-400 hover:text-violet-300">
          Configure
        </Link>
      </div>
      <div className="space-y-2">
        {models.map((model, i) => (
          <button
            key={model.id}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              i === 0
                ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-sm">{model.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              i === 0 ? 'bg-violet-500/30 text-violet-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {model.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Chat Input Component
function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type your message..."}
        rows={1}
        className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-4 pr-24 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none transition-colors"
        style={{ minHeight: '56px', maxHeight: '200px' }}
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-white transition-colors"
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Chat() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { projects } = useProjects(isAuthenticated ? token : null);
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  const [chatInput, setChatInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Generate mock recent chats from projects
  const recentChats: RecentChat[] = projects?.slice(0, 5).map((p, i) => ({
    id: `chat-${p.id}`,
    title: `Conversation about ${p.name}`,
    projectName: p.name,
    projectId: p.id,
    lastMessage: `Working on ${p.objective.slice(0, 50)}...`,
    timestamp: i === 0 ? 'Just now' : `${i}h ago`,
  })) || [];

  const handleQuickAction = (prompt: string) => {
    setChatInput(prompt + ' ');
  };

  const handleSubmit = () => {
    if (!chatInput.trim()) return;

    // If a project is selected, navigate to project with the message
    if (selectedProject) {
      navigate(`/project/${selectedProject}?message=${encodeURIComponent(chatInput)}`);
    } else {
      // Navigate to dashboard to create/select a project first
      navigate('/dashboard');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <Greeting userName={userName} />

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onSelect={handleQuickAction}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Selector */}
          {projects && projects.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
              <label className="block text-sm font-medium text-white mb-2">
                Select a Project
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value || null)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">Choose a project to chat about...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Chat Input */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSubmit={handleSubmit}
              placeholder={selectedProject ? "Ask a question about your project..." : "Select a project first, or describe what you'd like to build..."}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd> to send
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Shift</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd> for new line
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Powered by AIXORD AI Router
              </span>
            </div>
          </div>

          {/* No Projects State */}
          {(!projects || projects.length === 0) && (
            <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 text-center">
              <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Create Your First Project</h3>
              <p className="text-gray-400 mb-6">
                Start a new AIXORD-governed project to begin chatting with AI.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Model Selector */}
          <ModelSelectorPreview />

          {/* Recent Conversations */}
          {recentChats.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Recent Conversations</h3>
                <Link to="/dashboard" className="text-xs text-violet-400 hover:text-violet-300">
                  View all
                </Link>
              </div>
              <div className="space-y-1">
                {recentChats.slice(0, 4).map((chat) => (
                  <RecentChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-xl p-4 border border-violet-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Pro Tip</h4>
                <p className="text-xs text-gray-400">
                  Be specific about your requirements. Include context about your project's phase (Brainstorm, Plan, Execute, Review) for better governance alignment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
