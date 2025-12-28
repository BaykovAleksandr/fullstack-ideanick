import { env } from './env';
import { promises as fs } from 'fs';
import path from 'path';
import { type Idea, type User } from '@prisma/client';
import fg from 'fast-glob';
import _ from 'lodash';
import Handlebars from 'handlebars';
import { sendEmailThroughBrevo } from './brevo';
import { logger } from './logger';

const getNewIdeaRoute = async (options?: { abs?: boolean }): Promise<string> => {
  try {
    // Используем относительный путь к проекту
    const routes = await import('../../../webapp/src/lib/routes.js');
    return await routes.getNewIdeaRoute(options);
  } catch (error) {
    console.error('Failed to load routes module:', error);
    // fallback route с учетом параметров
    return options?.abs ? `${env.WEBAPP_URL}/new-idea` : '/new-idea';
  }
};

const getViewIdeaRoute = async (options: { abs?: boolean; ideaNick: string }): Promise<string> => {
  try {
    const routes = await import('../../../webapp/src/lib/routes.js');
    return await routes.getViewIdeaRoute(options);
  } catch (error) {
    console.error('Failed to load routes module:', error);
    // fallback route с учетом параметров
    const baseRoute = `/idea/${options?.ideaNick}`;
    return options?.abs ? `${env.WEBAPP_URL}${baseRoute}` : baseRoute;
  }
};

const getHbrTemplates = _.memoize(async () => {
  const htmlPathsPattern = path.resolve(__dirname, '../emails/dist');
  const htmlPaths = fg.sync([`${htmlPathsPattern.replace(/\\/g, '/')}/*.html`]);
  const hbrTemplates: Record<string, HandlebarsTemplateDelegate> = {};
  for (const htmlPath of htmlPaths) {
    const templateName = path.basename(htmlPath, '.html');
    const htmlTemplate = await fs.readFile(htmlPath, 'utf8');
    hbrTemplates[templateName] = Handlebars.compile(htmlTemplate);
  }
  return hbrTemplates;
});

const getEmailHtml = async (templateName: string, templateVariables: Record<string, any> = {}) => {
  const hbrTemplates = await getHbrTemplates();
  const hbrTemplate = hbrTemplates[templateName];
  if (!hbrTemplate) {
    throw new Error(`Template ${templateName} not found`);
  }
  const html = hbrTemplate(templateVariables);
  return html;
};

const sendEmail = async ({
  to,
  subject,
  templateName,
  templateVariables = {},
}: {
  to: string;
  subject: string;
  templateName: string;
  templateVariables?: Record<string, any>;
}) => {
  try {
    const fullTemplateVariables = {
      ...templateVariables,
      homeUrl: env.WEBAPP_URL,
    };
    const html = await getEmailHtml(templateName, fullTemplateVariables);
    const { loggableResponse } = await sendEmailThroughBrevo({ to, html, subject });
    logger.info('email', 'sendEmail', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    });
    return { ok: true };
  } catch (error) {
    logger.error('email', error, {
      to,
      templateName,
      templateVariables,
    });
    return { ok: false };
  }
};

export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  if (!user.email) {
    throw new Error('User email is required to send email');
  }

  // ОДИН вызов с await
  const addIdeaUrl = await getNewIdeaRoute({ abs: true });
  console.log('Generated URL for welcome email:', addIdeaUrl);

  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: addIdeaUrl, // Уже строка, не Promise
    },
  });
};

export const sendIdeaBlockedEmail = async ({ user, idea }: { user: Pick<User, 'email'>; idea: Pick<Idea, 'nick'> }) => {
  if (!user.email) {
    throw new Error('User email is required to send email');
  }

  return await sendEmail({
    to: user.email,
    subject: 'Your Idea Blocked!',
    templateName: 'ideaBlocked',
    templateVariables: {
      ideaNick: idea.nick,
    },
  });
};

export const sendMostLikedIdeasEmail = async ({
  user,
  ideas,
}: {
  user: Pick<User, 'email'>;
  ideas: Array<Pick<Idea, 'nick' | 'name'>>;
}) => {
  if (!user.email) {
    throw new Error('User email is required to send email');
  }

  // Генерируем все URL для идей
  const ideasWithUrls = await Promise.all(
    ideas.map(async (idea) => ({
      name: idea.name,
      url: await getViewIdeaRoute({ abs: true, ideaNick: idea.nick }),
    }))
  );

  return await sendEmail({
    to: user.email,
    subject: 'Most Liked Ideas!',
    templateName: 'mostLikedIdeas',
    templateVariables: {
      ideas: ideasWithUrls,
    },
  });
};
