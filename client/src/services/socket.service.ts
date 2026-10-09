import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

const createSocket = (namespace: string): Socket => {
  const { tokens } = useAuthStore.getState();
  return io(`${SOCKET_URL}${namespace}`, {
    auth: { token: tokens?.accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
};

let chatSocket: Socket | null = null;
let callSocket: Socket | null = null;
let notificationSocket: Socket | null = null;
let presenceSocket: Socket | null = null;

export const socketService = {
  connect: () => {
    chatSocket = createSocket('/chat');
    callSocket = createSocket('/call');
    notificationSocket = createSocket('/notification');
    presenceSocket = createSocket('/presence');

    chatSocket.connect();
    callSocket.connect();
    notificationSocket.connect();
    presenceSocket.connect();
  },

  disconnect: () => {
    chatSocket?.disconnect();
    callSocket?.disconnect();
    notificationSocket?.disconnect();
    presenceSocket?.disconnect();
    chatSocket = null;
    callSocket = null;
    notificationSocket = null;
    presenceSocket = null;
  },

  getChat: () => chatSocket,
  getCall: () => callSocket,
  getNotification: () => notificationSocket,
  getPresence: () => presenceSocket,

  // Chat helpers
  joinConversation: (conversationId: string) => chatSocket?.emit('join_conversation', conversationId),
  leaveConversation: (conversationId: string) => chatSocket?.emit('leave_conversation', conversationId),
  startTyping: (conversationId: string) => chatSocket?.emit('typing_start', { conversationId }),
  stopTyping: (conversationId: string) => chatSocket?.emit('typing_stop', { conversationId }),
  markDelivered: (messageId: string, conversationId: string) =>
    chatSocket?.emit('message_delivered', { messageId, conversationId }),
  markRead: (conversationId: string, messageIds: string[]) =>
    chatSocket?.emit('message_read', { conversationId, messageIds }),

  // Call helpers
  initiateCall: (receiverId: string, callId: string, type: 'voice' | 'video') =>
    callSocket?.emit('call_initiate', { receiverId, callId, type }),
  acceptCall: (callId: string, callerId: string) => callSocket?.emit('call_accept', { callId, callerId }),
  declineCall: (callId: string, callerId: string) => callSocket?.emit('call_decline', { callId, callerId }),
  endCall: (callId: string, peerId: string) => callSocket?.emit('call_end', { callId, peerId }),

  // Presence helpers
  heartbeat: () => presenceSocket?.emit('ping'),
  checkPresence: (userIds: string[]) => presenceSocket?.emit('check_presence', userIds),
};
