import * as admin from 'firebase-admin';
import { env } from '../../config';
import { logger } from '../../utils/logger';

let firebaseApp: admin.app.App;

export const initializeFirebase = (): void => {
  if (firebaseApp || !env.FIREBASE_PROJECT_ID) {
    return;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  logger.info('Firebase initialized');
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseApp) {
    logger.warn('Firebase not initialized  push notification skipped');
    return;
  }

  try {
    await admin.messaging(firebaseApp).send({
      token,
      notification: { title, body },
      data: data ?? {},
      android: {
        priority: 'high',
        notification: { sound: 'default', clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    });
  } catch (error) {
    logger.error('Push notification failed', { error, token: token.slice(0, 20) });
  }
};

export const sendMulticastPush = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseApp || tokens.length === 0) return;

  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) {
    chunks.push(tokens.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    try {
      const response = await admin.messaging(firebaseApp).sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });

      logger.debug('Multicast push sent', {
        success: response.successCount,
        failure: response.failureCount,
      });
    } catch (error) {
      logger.error('Multicast push failed', { error });
    }
  }
};
