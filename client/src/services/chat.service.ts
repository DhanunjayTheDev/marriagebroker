import { get, post, patch, del, upload } from './api';
import type { Conversation, Message } from '../types';

export const chatService = {
  getConversations: (page = 1, limit = 20) =>
    get<Conversation[]>(`/chat/conversations?page=${page}&limit=${limit}`),

  getOrCreateConversation: (participantId: string) =>
    post<Conversation>('/chat/conversations', { participantId }),

  getMessages: (conversationId: string, page = 1, limit = 50) =>
    get<Message[]>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),

  sendMessage: (conversationId: string, data: { type: string; content?: string; replyTo?: string }) =>
    post<Message>(`/chat/conversations/${conversationId}/messages`, data),

  sendMediaMessage: (conversationId: string, file: File, type: string, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', type);
    return upload<Message>(`/chat/conversations/${conversationId}/messages`, formData, onProgress);
  },

  deleteMessage: (messageId: string) => del(`/chat/messages/${messageId}`),
  pinMessage: (messageId: string, conversationId: string) =>
    patch(`/chat/messages/${messageId}/pin`, { conversationId }),
  starMessage: (messageId: string) => patch(`/chat/messages/${messageId}/star`),
};
