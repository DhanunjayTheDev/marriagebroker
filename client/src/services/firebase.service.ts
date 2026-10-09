import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { authService } from './auth.service';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const firebaseService = {
  init: () => {
    if (!firebaseConfig.apiKey) return;
    try {
      app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('Firebase init failed', err);
    }
  },

  requestPermissionAndToken: async (): Promise<string | null> => {
    if (!messaging) return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        const deviceId = localStorage.getItem('deviceId') ?? crypto.randomUUID();
        await authService.updateFcmToken(token, 'web', deviceId);
      }
      return token;
    } catch (err) {
      console.warn('FCM token error', err);
      return null;
    }
  },

  onForegroundMessage: (callback: (payload: unknown) => void) => {
    if (!messaging) return () => {};
    return onMessage(messaging, callback);
  },
};
