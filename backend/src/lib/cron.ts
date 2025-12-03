import { CronJob } from 'cron';
import { type AppContext } from './ctx';
import { notifyAboutMostLikedIdeas } from '../scripts/notifyAboutMostLikedIdeas';
import { logger } from './logger';

export const applyCron = (ctx: AppContext) => {
  new CronJob(
    '0 10 1 * *', // At 10:00 on day-of-month 1
    () => {
      console.info('Hello!');
      notifyAboutMostLikedIdeas(ctx).catch(logger.error);
    },
    null, // onComplete
    true // start right now
  );
};
