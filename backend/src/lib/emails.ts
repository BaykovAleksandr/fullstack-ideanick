import { promises as fs } from 'fs';
import path from 'path';
import { type Idea, type User } from '@prisma/client';
import fg from 'fast-glob';
import _ from 'lodash';
import { env } from './env';
import Handlebars from 'handlebars';
import { sendEmailThroughBrevo } from './brevo';

const getNewIdeaRoute = async (options?: { abs?: boolean }): Promise<string> => {
  try {
    const routes = await import('@ideanick/webapp/src/lib/routes.js');
    // Предполагаем, что функция getNewIdeaRoute в модуле routes тоже принимает параметры
    return routes.getNewIdeaRoute(options);
  } catch (error) {
    console.error('Failed to load routes module:', error);
    // fallback route с учетом параметров
    return options?.abs ? `${env.WEBAPP_URL}/new-idea` : '/new-idea';
  }
};

const getViewIdeaRoute = async (options: { abs?: boolean; ideaNick: string }): Promise<string> => {
  try {
    const routes = await import('@ideanick/webapp/src/lib/routes.js');
    // Предполагаем, что функция getViewIdeaRoute в модуле routes тоже существует
    return routes.getViewIdeaRoute(options);
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

const getEmailHtml = async (templateName: string, templateVariables: Record<string, string> = {}) => {
  const hbrTemplates = await getHbrTemplates();
  const hbrTemplate = hbrTemplates[templateName];
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
    const fullTemplateVaraibles = {
      ...templateVariables,
      homeUrl: env.WEBAPP_URL,
    };
    const html = await getEmailHtml(templateName, fullTemplateVaraibles);
    const { loggableResponse } = await sendEmailThroughBrevo({ to, html, subject });
    console.info('sendEmail', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    });
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
};

export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  if (!user.email) {
    throw new Error('User email is required to send email');
  }

  const newIdeaRoute = await getNewIdeaRoute();

  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: `${getNewIdeaRoute({ abs: true })}`,
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
  return await sendEmail({
    to: user.email,
    subject: 'Most Liked Ideas!',
    templateName: 'mostLikedIdeas',
    templateVariables: {
      ideas: ideas.map((idea) => ({ name: idea.name, url: getViewIdeaRoute({ abs: true, ideaNick: idea.nick }) })),
    },
  });
};
