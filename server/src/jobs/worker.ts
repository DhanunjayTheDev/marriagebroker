import 'dotenv/config';
import { Worker } from 'bullmq';
import { connectDatabase } from '../database/connection';
import { connectRedis } from '../config/redis.config';
import { env } from '../config';
import { logger } from '../utils/logger';
import { sendEmail } from '../helpers/email.helper';
import { sendSms } from '../helpers/sms.helper';
import { sendWhatsApp } from '../helpers/whatsapp.helper';
import { sendPushNotification, sendMulticastPush, initializeFirebase } from '../integrations/firebase/firebase.integration';
import { NotificationModel } from '../modules/notifications/model/notification.model';
import { UserModel } from '../modules/users/model/user.model';
import { matchmakingService } from '../modules/matchmaking/service/matchmaking.service';

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};

const createWorker = (queueName: string, processor: (job: any) => Promise<void>): Worker => {
  const worker = new Worker(queueName, processor, {
    connection,
    concurrency: 10,
    limiter: { max: 50, duration: 1000 },
  });

  worker.on('completed', job => logger.debug(`Job completed: ${queueName}/${job.id}`));
  worker.on('failed', (job, err) => logger.error(`Job failed: ${queueName}/${job?.id}`, { error: err.message }));

  return worker;
};

// Email worker
createWorker('email', async (job) => {
  const { to, subject, html, text } = job.data;
  await sendEmail({ to, subject, html, text });
});

// SMS worker
createWorker('sms', async (job) => {
  const { to, message } = job.data;
  await sendSms(to, message);
});

// WhatsApp worker
createWorker('whatsapp', async (job) => {
  const { to, message } = job.data;
  await sendWhatsApp(to, message);
});

// Notification worker  orchestrates all channels
createWorker('notification', async (job) => {
  const data = job.data;
  const { userId, title, body, type, channels, email, sms, whatsapp, fcmTokens } = data;

  // Save to DB
  await NotificationModel.create({
    userId,
    type,
    title,
    body,
    channels,
    isSent: true,
    sentAt: new Date(),
  });

  // Push via FCM
  if (channels.includes('push')) {
    const user = await UserModel.findById(userId, 'fcmTokens').lean();
    const tokens = (fcmTokens ?? user?.fcmTokens?.map((t: any) => t.token)) ?? [];
    if (tokens.length > 0) {
      await sendMulticastPush(tokens, title, body, { type, userId });
    }
  }

  // Email
  if (channels.includes('email') && email) {
    await sendEmail(email);
  }

  // SMS
  if (channels.includes('sms') && sms) {
    await sendSms(sms.to, sms.message);
  }

  // WhatsApp
  if (channels.includes('whatsapp') && whatsapp) {
    await sendWhatsApp(whatsapp.to, whatsapp.message);
  }
});

// Matchmaking worker
createWorker('matchmaking', async (job) => {
  const { userId } = job.data;
  await matchmakingService.generateMatches(userId);
});

// Analytics worker
createWorker('analytics', async (job) => {
  if (job.name === 'daily_aggregate') {
    logger.info('Analytics aggregation job processing', { date: job.data.date });
    // In production: aggregate metrics into AnalyticsModel
  }
});

// Thumbnail worker
createWorker('thumbnail', async (job) => {
  const { buffer, userId } = job.data;
  const { generateThumbnail } = await import('../helpers/gcs.helper');
  await generateThumbnail(Buffer.from(buffer), userId);
});

// Export worker
createWorker('export', async (job) => {
  const { userId, format, email: emailAddr } = job.data;
  logger.info(`Export job processing`, { userId, format });
  // In production: generate export file and email link
});

// Verification worker
createWorker('verification', async (job) => {
  const { verificationId, type } = job.data;
  logger.info(`Verification processing`, { verificationId, type });
  // In production: integrate with Aadhaar/DigiLocker/face match APIs
});

// Bootstrap
(async () => {
  await connectDatabase();
  await connectRedis();
  initializeFirebase();
  logger.info('Worker process started  all queues initialized');
})();
