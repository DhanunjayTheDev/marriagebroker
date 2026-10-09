import React, { createContext, useContext, useEffect, useRef } from 'react';
import { socketService } from '../services/socket.service';
import { useAuthStore, useNotificationStore, useChatStore, useUIStore } from '../store';
import type { Notification, Call } from '../types';

interface SocketContextValue {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false });
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, tokens } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { setTyping, setUserOnline } = useChatStore();
  const { setIncomingCall } = useUIStore();
  const isConnectedRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      if (isConnectedRef.current) {
        socketService.disconnect();
        isConnectedRef.current = false;
      }
      return;
    }

    socketService.connect();
    isConnectedRef.current = true;

    // Notification socket listeners
    const notif = socketService.getNotification();
    notif?.on('notification', (data: Notification) => {
      addNotification(data);
    });

    // Chat socket listeners
    const chat = socketService.getChat();
    chat?.on('typing_start', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTyping(conversationId, userId, true);
    });
    chat?.on('typing_stop', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTyping(conversationId, userId, false);
    });

    // Call socket listeners
    const call = socketService.getCall();
    call?.on('call_incoming', (data: Call & { agoraToken: string }) => {
      setIncomingCall(data);
    });

    // Presence socket listeners
    const presence = socketService.getPresence();
    presence?.on('user_online', ({ userId }: { userId: string }) => {
      setUserOnline(userId, true);
    });
    presence?.on('user_offline', ({ userId }: { userId: string }) => {
      setUserOnline(userId, false);
    });

    // Heartbeat every 60 seconds
    heartbeatRef.current = setInterval(() => {
      socketService.heartbeat();
    }, 60000);

    return () => {
      clearInterval(heartbeatRef.current);
      socketService.disconnect();
      isConnectedRef.current = false;
    };
  }, [isAuthenticated, tokens?.accessToken]);

  return (
    <SocketContext.Provider value={{ isConnected: isConnectedRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
