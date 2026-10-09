import { notificationQueue, emailQueue, smsQueue, whatsappQueue } from './index';
import { NotificationChannel, NotificationType } from '../constants';

export interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  email?: { to: string; subject: string; html: string };
  sms?: { to: string; message: string };
  whatsapp?: { to: string; message: string };
  fcmTokens?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export const enqueueNotification = async (data: NotificationJobData): Promise<void> => {
  const priority = data.priority === 'high' ? 1 : data.priority === 'normal' ? 5 : 10;

  await notificationQueue.add('send', data, {
    priority,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  });
};

export const enqueueEmail = async (to: string, subject: string, html: string, text?: string): Promise<void> => {
  await emailQueue.add('send', { to, subject, html, text }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  });
};

export const enqueueSms = async (to: string, message: string): Promise<void> => {
  await smsQueue.add('send', { to, message }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  });
};

export const enqueueWhatsApp = async (to: string, message: string): Promise<void> => {
  await whatsappQueue.add('send', { to, message }, {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { count: 500 },
  });
};
