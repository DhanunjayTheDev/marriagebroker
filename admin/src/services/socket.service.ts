import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

let notificationSocket: Socket | null = null;

export const socketService = {
  connect: () => {
    const { tokens } = useAuthStore.getState();
    if (!tokens?.accessToken) return;
    notificationSocket = io(`${SOCKET_URL}/notification`, {
      auth: { token: tokens.accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });
  },
  disconnect: () => {
    notificationSocket?.disconnect();
    notificationSocket = null;
  },
  getNotification: () => notificationSocket,
};
