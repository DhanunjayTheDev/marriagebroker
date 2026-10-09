import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID ?? '';

export interface AgoraCallbacks {
  onUserPublished?: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
  onUserUnpublished?: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void;
  onUserLeft?: (user: IAgoraRTCRemoteUser) => void;
  onConnectionStateChange?: (state: string) => void;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;

  async join(
    channel: string,
    token: string,
    uid: number,
    type: 'voice' | 'video',
    callbacks: AgoraCallbacks
  ): Promise<{ audioTrack: ILocalAudioTrack; videoTrack: ILocalVideoTrack | null }> {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Register listeners
    this.client.on('user-published', async (user, mediaType) => {
      if (mediaType !== 'video' && mediaType !== 'audio') return;
      await this.client!.subscribe(user, mediaType);
      callbacks.onUserPublished?.(user, mediaType);
    });
    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType !== 'video' && mediaType !== 'audio') return;
      callbacks.onUserUnpublished?.(user, mediaType);
    });
    this.client.on('user-left', (user) => callbacks.onUserLeft?.(user));
    this.client.on('connection-state-change', (state) => callbacks.onConnectionStateChange?.(state));

    await this.client.join(APP_ID, channel, token, uid);

    // Create local tracks
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const tracks: (ILocalAudioTrack | ILocalVideoTrack)[] = [this.localAudioTrack];

    if (type === 'video') {
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      tracks.push(this.localVideoTrack);
    }

    await this.client.publish(tracks);

    return { audioTrack: this.localAudioTrack, videoTrack: this.localVideoTrack };
  }

  async leave(): Promise<void> {
    this.localAudioTrack?.stop();
    this.localAudioTrack?.close();
    this.localVideoTrack?.stop();
    this.localVideoTrack?.close();
    await this.client?.leave();
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.client = null;
  }

  async toggleMute(muted: boolean): Promise<void> {
    await this.localAudioTrack?.setEnabled(!muted);
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    await this.localVideoTrack?.setEnabled(enabled);
  }

  async switchCamera(): Promise<void> {
    const cameras = await AgoraRTC.getCameras();
    if (cameras.length > 1 && this.localVideoTrack) {
      const current = this.localVideoTrack.getTrackLabel();
      const next = cameras.find((c) => c.label !== current);
      if (next) await this.localVideoTrack.setDevice(next.deviceId);
    }
  }

  getLocalVideoTrack() {
    return this.localVideoTrack;
  }
}

export const agoraService = new AgoraService();
