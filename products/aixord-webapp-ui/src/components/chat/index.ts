/**
 * Chat Components Index
 *
 * Exports for the governed chat UI.
 */

export { ChatInput } from './ChatInput';
export { MessageBubble } from './MessageBubble';
export { MessageActions } from './MessageActions';
export { QuickActions } from './QuickActions';
export { ImageUpload } from './ImageUpload';
export { ImageDisplay } from './ImageDisplay';

export type { PendingImage, EvidenceType } from './ImageUpload';
export type { ChatImage } from './ImageDisplay';

export type {
  Message,
  MessageMetadata,
  MessageOption,
  Conversation,
  ChatState,
  ChatAction
} from './types';
