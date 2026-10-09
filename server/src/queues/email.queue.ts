import { emailQueue } from './index';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  template?: string;
  templateData?: Record<string, unknown>;
}

export const enqueueEmailJob = async (data: EmailJobData, delay?: number): Promise<void> => {
  await emailQueue.add('send', data, {
    delay,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  });
};

export const scheduleBulkEmails = async (jobs: Array<{ data: EmailJobData; delay?: number }>): Promise<void> => {
  await emailQueue.addBulk(
    jobs.map(j => ({
      name: 'send',
      data: j.data,
      opts: {
        delay: j.delay,
        attempts: 2,
        removeOnComplete: { count: 1000 },
      },
    }))
  );
};
