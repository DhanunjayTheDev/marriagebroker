import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { useUIStore } from '../../store';
import { socketService } from '../../services/socket.service';
import { callService } from '../../services';
import { Avatar } from '../common/Avatar';
import { useNavigate } from '@tanstack/react-router';

export const IncomingCallOverlay: React.FC = () => {
  const { incomingCall, setIncomingCall, setActiveCall } = useUIStore();
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const caller = typeof incomingCall.callerId === 'object' ? incomingCall.callerId : null;
  const callerName = caller ? `${caller.firstName ?? ''} ${caller.lastName ?? ''}`.trim() : 'Unknown Caller';

  const handleAccept = async () => {
    const callerId = typeof incomingCall.callerId === 'string' ? incomingCall.callerId : incomingCall.callerId?._id ?? '';
    socketService.acceptCall(incomingCall.callId, callerId);
    await callService.updateStatus(incomingCall.callId, 'connected');
    setActiveCall(incomingCall.callId);
    setIncomingCall(null);
    navigate({ to: '/calls/active', search: { callId: incomingCall.callId } as never });
  };

  const handleDecline = async () => {
    const callerId = typeof incomingCall.callerId === 'string' ? incomingCall.callerId : incomingCall.callerId?._id ?? '';
    socketService.declineCall(incomingCall.callId, callerId);
    await callService.updateStatus(incomingCall.callId, 'declined');
    setIncomingCall(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-maroon flex flex-col items-center justify-center safe-top safe-bottom"
      >
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          <p className="text-white/60 text-sm mb-2 uppercase tracking-widest">
            Incoming {incomingCall.type} call
          </p>

          {/* Pulsing avatar */}
          <div className="relative mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Avatar name={callerName} size="2xl" src={caller?.profile?.photoUrl} className="relative ring-4 ring-white/30" />
          </div>

          <h2 className="font-display font-bold text-3xl text-white mb-1">{callerName}</h2>
          <p className="text-white/60 flex items-center gap-1.5">
            {incomingCall.type === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {incomingCall.type === 'video' ? 'Video Call' : 'Voice Call'}
          </p>

          {/* Call actions */}
          <div className="flex items-center gap-12 mt-16">
            <button onClick={handleDecline} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform">
                <PhoneOff className="w-7 h-7 text-white" />
              </div>
              <span className="text-white/70 text-sm">Decline</span>
            </button>

            <button onClick={handleAccept} className="flex flex-col items-center gap-2 group">
              <motion.div
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Phone className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-white/70 text-sm">Accept</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
