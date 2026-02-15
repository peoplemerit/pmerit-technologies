/**
 * useChat Hook
 *
 * Manages chat state and router integration.
 * Includes local storage persistence (D7).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, Conversation, MessageMetadata } from '../components/chat/types';
import { loadConversationsFromLocal, saveConversationsToLocal } from '../lib/storage';
import { ExecutionEngine } from '../lib/executionEngine';

interface WorkspaceBinding {
  folder_name: string;
  folder_template?: string;
  permission_level: string;
  scaffold_generated: boolean;
  github_connected: boolean;
}

interface ActiveAssignment {
  id: string;
  title: string;
  priority: string;
  status: string;
  progress_percent: number;
}

interface UseChatOptions {
  routerEndpoint: string;
  subscriptionTier: 'NONE' | 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
  keyMode: 'PLATFORM' | 'BYOK';
  userApiKey?: string;
  userId: string;
  projectId: string;
  workspaceBinding?: WorkspaceBinding;
  activeAssignments?: ActiveAssignment[];
}

interface UseChatReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  createConversation: (title: string, objective: string) => Conversation;
  setActiveConversation: (id: string) => void;
  sendMessage: (message: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => Promise<void>;
  selectOption: (messageId: string, optionId: string) => void;
  updateCapsule: (updates: Partial<Conversation['capsule']>) => void;
  clearError: () => void;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session ID for conversation continuity
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Load conversations from local storage on mount
  useEffect(() => {
    const saved = loadConversationsFromLocal();
    if (saved.length > 0) {
      setConversations(saved);
    }
  }, []);

  // Save conversations to local storage on change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversationsToLocal(conversations);
    }
  }, [conversations]);

  const createConversation = useCallback((title: string, objective: string): Conversation => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      projectId: options.projectId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      capsule: {
        objective,
        phase: 'B',
        constraints: [],
        decisions: [],
        openQuestions: []
      }
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
    sessionIdRef.current = crypto.randomUUID();

    return newConversation;
  }, [options.projectId]);

  const setActiveConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    sessionIdRef.current = crypto.randomUUID();
  }, []);

  const sendMessage = useCallback(async (message: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => {
    if (!activeConversationId || !activeConversation) {
      setError('No active conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          updatedAt: new Date()
        };
      }
      return conv;
    }));

    try {
      // FIX-N3: Build conversation history from prior messages
      // Send recent messages so the AI has multi-turn context.
      // Cap at 20 messages (10 turns) to stay within token budget.
      const MAX_HISTORY_MESSAGES = 20;
      const conversationHistory = (activeConversation.messages || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(-MAX_HISTORY_MESSAGES)
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

      // Build router request
      const routerRequest = {
        product: 'AIXORD_COPILOT',
        intent: 'CHAT',
        mode,
        subscription: {
          tier: options.subscriptionTier,
          key_mode: options.keyMode,
          // Session 6 (API Audit): Removed user_api_key from body
          // Backend resolves BYOK keys from D1 database using authenticated userId
        },
        capsule: {
          objective: activeConversation.capsule?.objective || '',
          phase: activeConversation.capsule?.phase || 'B',
          constraints: activeConversation.capsule?.constraints || [],
          decisions: activeConversation.capsule?.decisions || [],
          open_questions: activeConversation.capsule?.openQuestions || []
        },
        delta: {
          user_input: message,
          conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
          system_context: activeConversation.capsule ? {
            objective: activeConversation.capsule.objective,
            phase: activeConversation.capsule.phase,
            constraints: activeConversation.capsule.constraints,
            decisions: activeConversation.capsule.decisions,
            open_questions: activeConversation.capsule.openQuestions,
          } : undefined,
          workspace_context: options.workspaceBinding ? {
            folder_name: options.workspaceBinding.folder_name,
            folder_template: options.workspaceBinding.folder_template,
            permission_level: options.workspaceBinding.permission_level,
            scaffold_generated: options.workspaceBinding.scaffold_generated,
            github_connected: options.workspaceBinding.github_connected,
          } : undefined,
          active_assignments: options.activeAssignments?.map(a => ({
            id: a.id,
            title: a.title,
            priority: a.priority,
            status: a.status,
            progress_percent: a.progress_percent,
          })) || undefined,
        },
        budget: {
          max_output_tokens: 4096
        },
        policy_flags: {
          allow_retry: true
        },
        trace: {
          project_id: options.projectId,
          session_id: sessionIdRef.current,
          request_id: crypto.randomUUID(),
          user_id: options.userId
        }
      };

      // Session 6 (API Audit): CRITICAL FIX - Separate JWT auth token from BYOK provider key
      // The Authorization header MUST contain the JWT session token for user authentication.
      // The BYOK provider key (e.g., sk-ant-...) is NOT a JWT and should NEVER be sent as Bearer token.
      // Backend key-resolver.ts handles fetching the correct provider key from D1 database.
      const authToken = localStorage.getItem('aixord_token') || '';

      // 60s timeout for router execute (AI responses can be slow)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response: Response;
      try {
        response = await fetch(`${options.routerEndpoint}/v1/router/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(routerRequest),
          signal: controller.signal,
        });
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The AI provider took too long to respond. Please try again.');
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      // Session 3 Fix: Check HTTP status BEFORE parsing body
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed with status ${response.status}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          // Not JSON, use raw text
          errorMessage = `${errorMessage}: ${errorText.slice(0, 200)}`;
        }

        throw new Error(errorMessage);
      }

      // Session 3 Fix: Safe JSON parsing (handles Worker crashes returning HTML)
      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Router returned non-JSON response (${response.status}): ${responseText.slice(0, 200)}`
        );
      }

      if (result.status === 'ERROR') {
        throw new Error(result.error || 'Router error');
      }

      // DEBUG: Log response structure to diagnose missing fields
      if (!result.model_used) {
        console.error('[AIXORD SDK] Missing model_used in response:', result);
      }

      // Build metadata from response
      const metadata: MessageMetadata = {
        model: {
          provider: result.model_used?.provider || 'unknown',
          model: result.model_used?.model || 'unknown',
          class: result.model_used?.class
        },
        usage: {
          inputTokens: result.usage?.input_tokens || 0,
          outputTokens: result.usage?.output_tokens || 0,
          costUsd: result.usage?.cost_usd || 0,
          latencyMs: result.usage?.latency_ms || 0
        },
        verification: result.verification,
        phase: activeConversation.capsule?.phase
      };

      // Parse options from response content if present
      // Session 3 Fix: Check result.content exists before calling .match()
      const optionsMatch = result.content?.match(/\b(O\d+):\s*([^\n]+)/g);
      if (optionsMatch) {
        metadata.options = optionsMatch.map((match: string) => {
          const [id, ...labelParts] = match.split(':');
          return {
            id: id.trim(),
            label: labelParts.join(':').trim()
          };
        });
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        metadata
      };

      // EXECUTE PHASE: Process structured blocks and write files
      if (activeConversation?.capsule?.phase === 'E' && options.projectId) {
        try {
          const executionResult = await ExecutionEngine.processResponse(
            result.content,
            options.projectId,
            authToken || ''
          );
          if (executionResult.filesCreated.length > 0 || executionResult.submissions > 0 || executionResult.errors.length > 0) {
            assistantMessage.metadata = {
              ...assistantMessage.metadata,
              executionResult
            };
          }
        } catch (err) {
          console.error('Execution engine error:', err);
          // Add execution error to message metadata
          assistantMessage.metadata = {
            ...assistantMessage.metadata,
            executionResult: {
              filesCreated: [],
              filesUpdated: [],
              progressUpdates: 0,
              submissions: 0,
              escalations: 0,
              errors: [err instanceof Error ? err.message : 'Unknown execution engine error']
            }
          };
        }
      }

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Add error message to conversation
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMsg],
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, activeConversation, options]);

  const selectOption = useCallback((messageId: string, optionId: string) => {
    if (!activeConversationId) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  selectedOption: optionId
                }
              };
            }
            return msg;
          }),
          updatedAt: new Date()
        };
      }
      return conv;
    }));

    // Send follow-up with selection
    sendMessage(`Selected: ${optionId}`, 'BALANCED');
  }, [activeConversationId, sendMessage]);

  const updateCapsule = useCallback((updates: Partial<Conversation['capsule']>) => {
    if (!activeConversationId) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          capsule: {
            ...conv.capsule,
            ...updates
          } as Conversation['capsule'],
          updatedAt: new Date()
        };
      }
      return conv;
    }));
  }, [activeConversationId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversations,
    activeConversation,
    isLoading,
    error,
    createConversation,
    setActiveConversation,
    sendMessage,
    selectOption,
    updateCapsule,
    clearError
  };
}

export default useChat;
