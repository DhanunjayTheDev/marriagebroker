import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, Send, Paperclip, Phone, Video, MoreVertical,
  Check, CheckCheck, ArrowLeft, MessageCircle, UserX, Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { chatService, callService, post } from '../../services';
import { socketService } from '../../services/socket.service';
import { useAuth } from '../../providers/AuthProvider';
import { useChatStore } from '../../store';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { ListItemSkeleton } from '../../components/common/Skeleton';
import { cn, formatDate } from '../../lib/utils';
import type { Conversation, Message, User } from '../../types';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeConversationId, setActiveConversation, typingUsers } = useChatStore();
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: conversationsData, isLoading: convLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
  });

  const { data: messagesData, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => chatService.getMessages(activeConversationId!),
    enabled: !!activeConversationId,
  });

  const conversations = (conversationsData?.data ?? []) as Conversation[];
  const messages = (messagesData?.data ?? []) as Message[];
  const activeConv = conversations.find((c) => c._id === activeConversationId);
  const otherParticipant = activeConv?.participants.find((p) => (p as Partial<User>)._id !== user?.id) as Partial<User> | undefined;

  const sendMutation = useMutation({
    mutationFn: (text: string) => chatService.sendMessage(activeConversationId!, { type: 'text', content: text }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    },
  });

  const fileMutation = useMutation({
    mutationFn: (file: File) =>
      chatService.sendMediaMessage(
        activeConversationId!,
        file,
        file.type.startsWith('image/') ? 'image' : 'file',
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] }),
    onError: () => toast.error('Failed to send file'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('File must be under 20 MB'); return; }
    fileMutation.mutate(file);
    e.target.value = '';
  };

  // Socket: join conversation + listen for new messages
  useEffect(() => {
    if (!activeConversationId) return;
    socketService.joinConversation(activeConversationId);
    const chat = socketService.getChat();
    const handler = () => queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    chat?.on('new_message', handler);
    return () => {
      socketService.leaveConversation(activeConversationId);
      chat?.off('new_message', handler);
    };
  }, [activeConversationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!activeConversationId) return;
    socketService.startTyping(activeConversationId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketService.stopTyping(activeConversationId), 2000);
  };

  const handleSend = () => {
    if (!messageText.trim() || !activeConversationId) return;
    sendMutation.mutate(messageText.trim());
  };

  const isTyping = activeConversationId && (typingUsers[activeConversationId]?.length ?? 0) > 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-6">
      {/* Conversation list */}
      <div className={cn('w-full lg:w-80 border-r border-border flex flex-col bg-card', showMobileChat && 'hidden lg:flex')}>
        <div className="p-4 border-b border-border">
          <h1 className="font-display font-bold text-xl mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-muted rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {convLoading ? (
            <>{Array.from({ length: 5 }).map((_, i) => <ListItemSkeleton key={i} />)}</>
          ) : conversations.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No conversations" description="Start chatting with your matches!" />
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => (p as Partial<User>)._id !== user?.id) as Partial<User> | undefined;
              const unread = conv.unreadCount?.[user?.id ?? ''] ?? 0;
              return (
                <button
                  key={conv._id}
                  onClick={() => {
                    setActiveConversation(conv._id);
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left border-b border-border/50',
                    activeConversationId === conv._id && 'bg-brand-50 dark:bg-brand-900/20'
                  )}
                >
                  <Avatar src={other?.profile?.photoUrl} name={`${other?.firstName ?? ''} ${other?.lastName ?? ''}`} size="md" verified={other?.profile?.verificationBadge} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{other?.firstName} {other?.lastName}</span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-500">{formatDate(conv.lastMessage.sentAt, 'relative')}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-xs text-slate-500 truncate">{conv.lastMessage?.content ?? 'Start a conversation'}</span>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">{unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={cn('flex-1 flex flex-col', !showMobileChat && 'hidden lg:flex')}>
        {!activeConversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a conversation to start chatting" />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileChat(false)} className="lg:hidden p-3 -ml-3 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar src={otherParticipant?.profile?.photoUrl} name={`${otherParticipant?.firstName ?? ''} ${otherParticipant?.lastName ?? ''}`} size="md" online />
                <div>
                  <div className="font-semibold text-sm">{otherParticipant?.firstName} {otherParticipant?.lastName}</div>
                  <div className="text-xs text-emerald-600">{isTyping ? 'typing...' : 'Online'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <button onClick={() => otherParticipant?._id && callService.initiateCall(otherParticipant._id, 'voice')} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Phone className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => otherParticipant?._id && callService.initiateCall(otherParticipant._id, 'video')} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Video className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 z-10 bg-card rounded-xl border border-border shadow-lg py-1 min-w-[160px]">
                    <button
                      onClick={() => { setShowMenu(false); otherParticipant?._id && post(`/users/${otherParticipant._id}/block`).then(() => toast.success('User blocked')); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <UserX className="w-4 h-4 text-red-500" /> Block User
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); otherParticipant?._id && post(`/users/${otherParticipant._id}/report`, { reason: 'Chat report' }).then(() => toast.success('Reported')); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Flag className="w-4 h-4 text-red-500" /> Report User
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-muted/30">
              {msgLoading ? (
                <div className="text-center text-sm text-slate-500 py-8">Loading messages...</div>
              ) : (
                messages.map((msg) => {
                  const isOwn = (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?.id;
                  return (
                    <MessageBubble key={msg._id} message={msg} isOwn={isOwn} />
                  );
                })
              )}
              {isTyping && (
                <div className="flex items-center gap-1.5 px-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileMutation.isPending}
                  className="p-2.5 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Paperclip className="w-5 h-5 text-slate-400" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-muted rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-700/20 max-h-32"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="w-11 h-11 rounded-full bg-gradient-maroon flex items-center justify-center text-white disabled:opacity-50 transition-opacity flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
  >
    <div
      className={cn(
        'max-w-[75%] rounded-2xl px-4 py-2.5',
        isOwn
          ? 'bg-gradient-maroon text-white rounded-br-md'
          : 'bg-card border border-border rounded-bl-md'
      )}
    >
      {message.type === 'text' ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
      ) : message.type === 'image' && message.media ? (
        <img src={message.media.url} alt="" className="rounded-lg max-w-full" />
      ) : (
        <p className="text-sm italic opacity-70">[{message.type}]</p>
      )}
      <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end text-white/70' : 'text-slate-500')}>
        <span className="text-[10px]">{formatDate(message.createdAt, 'relative')}</span>
        {isOwn && (
          message.readBy?.length > 0
            ? <CheckCheck className="w-3.5 h-3.5" />
            : <Check className="w-3.5 h-3.5" />
        )}
      </div>
    </div>
  </motion.div>
);

