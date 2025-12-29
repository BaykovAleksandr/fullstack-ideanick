import { env } from './env';
import { logger } from './logger';

export const getNewIdeaRoute = (options?: { abs?: boolean }): string => {
  const route = '/new-idea';
  const url = options?.abs ? `${env.WEBAPP_URL}${route}` : route;

  logger.info('email-routes', 'getNewIdeaRoute', {
    webappUrl: env.WEBAPP_URL,
    route,
    result: url,
  });

  return url;
};

export const getViewIdeaRoute = (options: { abs?: boolean; ideaNick: string }): string => {
  const route = `/idea/${options.ideaNick}`;
  const url = options.abs ? `${env.WEBAPP_URL}${route}` : route;

  logger.info('email-routes', 'getViewIdeaRoute', {
    webappUrl: env.WEBAPP_URL,
    route,
    ideaNick: options.ideaNick,
    result: url,
  });

  return url;
};
