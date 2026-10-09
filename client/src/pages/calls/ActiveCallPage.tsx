import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, SwitchCamera, Signal } from 'lucide-react';
import { toast } from 'sonner';
import { agoraService } from '../../services/agora.service';
import { callService } from '../../services';
import { useUIStore } from '../../store';
import { Avatar } from '../../components/common/Avatar';
import { cn } from '../../lib/utils';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

interface ActiveCallPageProps {
  callId: string;
  channel: string;
  token: string;
  uid: number;
  type: 'voice' | 'video';
  peerName: string;
  peerPhoto?: string;
}

export const ActiveCallPage: React.FC<Partial<ActiveCallPageProps>> = (props) => {
  const navigate = useNavigate();
  const { setActiveCall } = useUIStore();
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(props.type === 'voice');
  const [speakerOff, setSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connected, setConnected] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    if (!props.channel || !props.token || props.uid === undefined) return;

    let durationTimer: ReturnType<typeof setInterval>;

    const startCall = async () => {
      try {
        const { videoTrack } = await agoraService.join(
          props.channel!,
          props.token!,
          props.uid!,
          props.type ?? 'video',
          {
            onUserPublished: (remoteUser, mediaType) => {
              setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== remoteUser.uid), remoteUser]);
              setConnected(true);
              if (mediaType === 'video' && remoteVideoRef.current) {
                remoteUser.videoTrack?.play(remoteVideoRef.current);
              }
              if (mediaType === 'audio') {
                remoteUser.audioTrack?.play();
              }
            },
            onUserLeft: () => handleEndCall(),
          }
        );

        if (videoTrack && localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        durationTimer = setInterval(() => setDuration((d) => d + 1), 1000);
      } catch (err) {
        toast.error('Call connection failed. Please try again.');
        handleEndCall();
      }
    };

    startCall();
    return () => {
      clearInterval(durationTimer);
      agoraService.leave();
    };
  }, [props.channel, props.token, props.uid]);

  const handleEndCall = async () => {
    if (props.callId) {
      await callService.updateStatus(props.callId, 'ended', duration).catch(() => null);
    }
    await agoraService.leave();
    setActiveCall(null);
    navigate({ to: '/dashboard' });
  };

  const toggleMute = async () => {
    await agoraService.toggleMute(!muted);
    setMuted(!muted);
  };

  const toggleVideo = async () => {
    await agoraService.toggleVideo(videoOff);
    setVideoOff(!videoOff);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[90] bg-gradient-maroon flex flex-col safe-top safe-bottom">
      <div className="absolute inset-0 bg-hero-pattern opacity-5" />

      {/* Remote video / avatar */}
      <div className="flex-1 relative flex items-center justify-center">
        {props.type === 'video' && connected ? (
          <div ref={remoteVideoRef} className="absolute inset-0 bg-black" />
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Avatar name={props.peerName ?? 'User'} src={props.peerPhoto} size="2xl" className="ring-4 ring-white/20" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white mt-6">{props.peerName ?? 'Connecting...'}</h2>
            <p className="text-white/60 mt-1">{connected ? formatDuration(duration) : 'Ringing...'}</p>
          </div>
        )}

        {/* Connection indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5 z-20">
          <Signal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/80 text-sm">{connected ? formatDuration(duration) : 'Connecting...'}</span>
        </div>

        {/* Local video PiP */}
        {props.type === 'video' && (
          <div ref={localVideoRef} className="absolute bottom-6 right-6 w-28 h-40 rounded-2xl overflow-hidden bg-black/50 border-2 border-white/20 z-20" />
        )}
      </div>

      {/* Controls */}
      <div className="relative z-20 pb-12 pt-6">
        <div className="flex items-center justify-center gap-5">
          <ControlButton active={muted} onClick={toggleMute} icon={muted ? MicOff : Mic} activeColor="bg-red-500" />
          {props.type === 'video' && (
            <>
              <ControlButton active={videoOff} onClick={toggleVideo} icon={videoOff ? VideoOff : Video} activeColor="bg-red-500" />
              <ControlButton onClick={() => agoraService.switchCamera()} icon={SwitchCamera} />
            </>
          )}
          <ControlButton
            active={speakerOff}
            activeColor="bg-red-500"
            icon={speakerOff ? VolumeX : Volume2}
            onClick={() => setSpeakerOff((v) => !v)}
          />

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ElementType; onClick?: () => void; active?: boolean; activeColor?: string }> = ({
  icon: Icon, onClick, active, activeColor,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95',
      active ? activeColor ?? 'bg-white' : 'bg-white/15 backdrop-blur-sm hover:bg-white/25'
    )}
  >
    <Icon className={cn('w-6 h-6', active ? 'text-white' : 'text-white')} />
  </button>
);
