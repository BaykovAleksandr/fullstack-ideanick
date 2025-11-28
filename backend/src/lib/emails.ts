import { promises as fs } from 'fs';
import path from 'path';
import { type Idea, type User } from '@prisma/client';
import fg from 'fast-glob';
import _ from 'lodash';
import { env } from './env';
import Handlebars from 'handlebars';
import { sendEmailThroughBrevo } from './brevo';

// Упрощенный динамический импорт
const getNewIdeaRoute = async (): Promise<string> => {
  try {
    const routes = await import('@ideanick/webapp/src/lib/routes.js');
    return routes.getNewIdeaRoute();
  } catch (error) {
    console.error('Failed to load routes module:', error);
    return '/new-idea'; // fallback route
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
      addIdeaUrl: `${env.WEBAPP_URL}${newIdeaRoute}`,
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
