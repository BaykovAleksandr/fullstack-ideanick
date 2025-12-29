import { env } from './env';
import { logger } from './logger';

export const getNewIdeaRoute = (options?: { abs?: boolean }): string => {
  const route = '/new-idea';

  // Для продакшена используем WEBAPP_URL, для разработки - localhost
  let baseUrl = env.WEBAPP_URL;

  // Если WEBAPP_URL не указан и мы в разработке, используем localhost
  if (!baseUrl && process.env.NODE_ENV !== 'production') {
    baseUrl = 'http://localhost:8000';
  }

  const url = options?.abs ? `${baseUrl}${route}` : route;

  logger.info('email-routes', 'getNewIdeaRoute', {
    webappUrl: env.WEBAPP_URL,
    nodeEnv: process.env.NODE_ENV,
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
