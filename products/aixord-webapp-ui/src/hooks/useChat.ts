/**
 * useChat Hook
 *
 * Manages chat state and router integration.
 * Includes local storage persistence (D7).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, Conversation, MessageMetadata } from '../components/chat/types';
import { loadConversationsFromLocal, saveConversationsToLocal } from '../lib/storage';

interface UseChatOptions {
  routerEndpoint: string;
  subscriptionTier: 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
  keyMode: 'PLATFORM' | 'BYOK';
  userApiKey?: string;
  userId: string;
  projectId: string;
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
      // Build router request
      const routerRequest = {
        product: 'AIXORD_COPILOT',
        intent: 'CHAT',
        mode,
        subscription: {
          tier: options.subscriptionTier,
          key_mode: options.keyMode,
          user_api_key: options.userApiKey
        },
        capsule: {
          objective: activeConversation.capsule?.objective || '',
          phase: activeConversation.capsule?.phase || 'B',
          constraints: activeConversation.capsule?.constraints || [],
          decisions: activeConversation.capsule?.decisions || [],
          open_questions: activeConversation.capsule?.openQuestions || []
        },
        delta: {
          user_input: message
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

      const response = await fetch(`${options.routerEndpoint}/v1/router/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routerRequest)
      });

      const result = await response.json();

      if (result.status === 'ERROR') {
        throw new Error(result.error || 'Router error');
      }

      // Build metadata from response
      const metadata: MessageMetadata = {
        model: {
          provider: result.model_used.provider,
          model: result.model_used.model,
          class: result.model_used.class
        },
        usage: {
          inputTokens: result.usage.input_tokens,
          outputTokens: result.usage.output_tokens,
          costUsd: result.usage.cost_usd,
          latencyMs: result.usage.latency_ms
        },
        verification: result.verification,
        phase: activeConversation.capsule?.phase
      };

      // Parse options from response content if present
      const optionsMatch = result.content.match(/\b(O\d+):\s*([^\n]+)/g);
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
