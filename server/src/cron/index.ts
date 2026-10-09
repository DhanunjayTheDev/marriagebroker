import cron from 'node-cron';
import { logger } from '../utils/logger';
import { subscriptionExpiryCron } from './subscription.cron';
import { matchRecommendationCron } from './matchRecommendation.cron';
import { cleanupCron } from './cleanup.cron';
import { analyticsAggregationCron } from './analytics.cron';
import { engagementCron } from './engagement.cron';

interface CronJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  runOnStart?: boolean;
}

const jobs: CronJob[] = [
  { name: 'subscription-expiry', schedule: '0 0 * * *', handler: subscriptionExpiryCron },
  { name: 'match-recommendations', schedule: '0 6 * * *', handler: matchRecommendationCron },
  { name: 'analytics-aggregation', schedule: '0 2 * * *', handler: analyticsAggregationCron },
  { name: 'engagement-campaigns', schedule: '0 8 * * *', handler: engagementCron },
  { name: 'cleanup', schedule: '0 3 * * *', handler: cleanupCron },
];

export const initializeCrons = (): void => {
  for (const job of jobs) {
    cron.schedule(job.schedule, async () => {
      logger.info(`Cron started: ${job.name}`);
      try {
        await job.handler();
        logger.info(`Cron completed: ${job.name}`);
      } catch (error) {
        logger.error(`Cron failed: ${job.name}`, { error });
      }
    });
    logger.debug(`Cron registered: ${job.name} [${job.schedule}]`);
  }
};
