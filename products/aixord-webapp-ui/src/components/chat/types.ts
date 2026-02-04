/**
 * Chat UI Types
 *
 * Types for the governed chat interface.
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  // Router response data
  model?: {
    provider: string;
    model: string;
    class?: string;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    latencyMs: number;
  };
  verification?: {
    verdict: 'PASS' | 'WARN' | 'FAIL';
    flags: Array<{
      code: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      detail?: string;
    }>;
  };
  // Governance data
  phase?: 'B' | 'P' | 'E' | 'R';
  gates?: string[];
  // Selection data (for option menus)
  options?: MessageOption[];
  selectedOption?: string;
  // File attachments
  attachments?: Array<{
    name: string;
    path: string;
    size: number;
    includeContent: boolean;
  }>;
}

export interface MessageOption {
  id: string;
  label: string;
  description?: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  capsule?: {
    objective: string;
    phase: 'B' | 'P' | 'E' | 'R';
    constraints: string[];
    decisions: string[];
    openQuestions: string[];
  };
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'UPDATE_CAPSULE'; payload: { conversationId: string; capsule: Conversation['capsule'] } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'CLEAR_CONVERSATIONS' };
