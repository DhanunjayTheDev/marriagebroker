import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { env } from '../../config';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants';

export interface AgoraTokenResult {
  token: string;
  channel: string;
  uid: number;
  expiresAt: number;
}

export const generateAgoraToken = (
  channel: string,
  uid: number,
  role: 'publisher' | 'subscriber' = 'publisher'
): AgoraTokenResult => {
  if (!env.AGORA_APP_ID || !env.AGORA_APP_CERTIFICATE) {
    throw new AppError(ErrorCode.CALL_TOKEN_FAILED, 'Agora not configured', 500);
  }

  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expiresAt = Math.floor(Date.now() / 1000) + env.AGORA_TOKEN_EXPIRY_SECONDS;

  const token = RtcTokenBuilder.buildTokenWithUid(
    env.AGORA_APP_ID,
    env.AGORA_APP_CERTIFICATE,
    channel,
    uid,
    agoraRole,
    expiresAt,
    expiresAt
  );

  return { token, channel, uid, expiresAt };
};

export const generateCallChannel = (callId: string): string => `call_${callId}`;

export const generateUidFromUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 1000000000;
};
