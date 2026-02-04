/**
 * Conversation Persistence (D7)
 *
 * Local storage and API-based persistence for conversations.
 */

import type { Conversation, Message } from '../components/chat/types';

const STORAGE_KEY = 'aixord_conversations';
const MAX_LOCAL_CONVERSATIONS = 50;

// =============================================================================
// LOCAL STORAGE (Offline-first)
// =============================================================================

/**
 * Load conversations from local storage
 */
export function loadConversationsFromLocal(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    // Rehydrate dates
    return parsed.map((conv: Conversation) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load conversations from local storage:', error);
    return [];
  }
}

/**
 * Save conversations to local storage
 */
export function saveConversationsToLocal(conversations: Conversation[]): void {
  try {
    // Keep only most recent conversations
    const toSave = conversations
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, MAX_LOCAL_CONVERSATIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save conversations to local storage:', error);
  }
}

/**
 * Delete a conversation from local storage
 */
export function deleteConversationFromLocal(conversationId: string): void {
  const conversations = loadConversationsFromLocal();
  const filtered = conversations.filter(c => c.id !== conversationId);
  saveConversationsToLocal(filtered);
}

/**
 * Clear all conversations from local storage
 */
export function clearLocalConversations(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// =============================================================================
// API PERSISTENCE (Cloud sync)
// =============================================================================

interface ApiConversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  capsule: string; // JSON string
  created_at: string;
  updated_at: string;
}

interface ApiMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: string; // JSON string
  created_at: string;
}

/**
 * Conversation API client
 */
export class ConversationApi {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(
    baseUrl: string,
    getAuthToken: () => Promise<string | null>
  ) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  /**
   * List user's conversations
   */
  async list(projectId?: string): Promise<Conversation[]> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const url = new URL(`${this.baseUrl}/api/conversations`);
    if (projectId) url.searchParams.set('project_id', projectId);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list conversations: ${response.status}`);
    }

    const data = await response.json() as { conversations: ApiConversation[] };

    // Fetch messages for each conversation
    const conversations = await Promise.all(
      data.conversations.map(async (conv) => {
        const messages = await this.getMessages(conv.id);
        return this.apiToConversation(conv, messages);
      })
    );

    return conversations;
  }

  /**
   * Get a single conversation with messages
   */
  async get(conversationId: string): Promise<Conversation> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.status}`);
    }

    const conv = await response.json() as ApiConversation;
    const messages = await this.getMessages(conversationId);

    return this.apiToConversation(conv, messages);
  }

  /**
   * Create a new conversation
   */
  async create(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: conversation.projectId,
        title: conversation.title,
        capsule: JSON.stringify(conversation.capsule)
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const conv = await response.json() as ApiConversation;
    return this.apiToConversation(conv, []);
  }

  /**
   * Update conversation (title, capsule)
   */
  async update(conversationId: string, updates: Partial<Pick<Conversation, 'title' | 'capsule'>>): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: updates.title,
        capsule: updates.capsule ? JSON.stringify(updates.capsule) : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.status}`);
    }
  }

  /**
   * Delete a conversation
   */
  async delete(conversationId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: message.role,
        content: message.content,
        metadata: JSON.stringify(message.metadata || {})
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add message: ${response.status}`);
    }

    const msg = await response.json() as ApiMessage;
    return this.apiToMessage(msg);
  }

  /**
   * Get messages for a conversation
   */
  private async getMessages(conversationId: string): Promise<Message[]> {
    const token = await this.getAuthToken();
    if (!token) return [];

    const response = await fetch(`${this.baseUrl}/api/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { messages: ApiMessage[] };
    return data.messages.map(msg => this.apiToMessage(msg));
  }

  /**
   * Convert API conversation to local format
   */
  private apiToConversation(api: ApiConversation, messages: Message[]): Conversation {
    let capsule: Conversation['capsule'];
    try {
      capsule = JSON.parse(api.capsule);
    } catch {
      capsule = undefined;
    }

    return {
      id: api.id,
      projectId: api.project_id,
      title: api.title,
      messages,
      createdAt: new Date(api.created_at),
      updatedAt: new Date(api.updated_at),
      capsule
    };
  }

  /**
   * Convert API message to local format
   */
  private apiToMessage(api: ApiMessage): Message {
    let metadata;
    try {
      metadata = JSON.parse(api.metadata);
    } catch {
      metadata = undefined;
    }

    return {
      id: api.id,
      role: api.role,
      content: api.content,
      timestamp: new Date(api.created_at),
      metadata
    };
  }
}

// =============================================================================
// SYNC MANAGER
// =============================================================================

/**
 * Manages sync between local storage and API
 */
export class ConversationSyncManager {
  private api: ConversationApi;
  private syncInProgress = false;

  constructor(api: ConversationApi) {
    this.api = api;
  }

  /**
   * Sync local conversations to cloud
   */
  async syncToCloud(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const local = loadConversationsFromLocal();
      const remote = await this.api.list();

      // Find conversations that exist locally but not remotely
      const localOnly = local.filter(l => !remote.find(r => r.id === l.id));

      // Upload local-only conversations
      for (const conv of localOnly) {
        try {
          await this.api.create({
            projectId: conv.projectId,
            title: conv.title,
            messages: conv.messages,
            capsule: conv.capsule
          });
        } catch (error) {
          console.error(`Failed to sync conversation ${conv.id}:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync cloud conversations to local
   */
  async syncFromCloud(): Promise<Conversation[]> {
    if (this.syncInProgress) {
      return loadConversationsFromLocal();
    }
    this.syncInProgress = true;

    try {
      const remote = await this.api.list();
      const local = loadConversationsFromLocal();

      // Merge: prefer remote for conflicts, keep local-only
      const merged = new Map<string, Conversation>();

      for (const conv of local) {
        merged.set(conv.id, conv);
      }

      for (const conv of remote) {
        merged.set(conv.id, conv);
      }

      const result = Array.from(merged.values());
      saveConversationsToLocal(result);

      return result;
    } finally {
      this.syncInProgress = false;
    }
  }
}
