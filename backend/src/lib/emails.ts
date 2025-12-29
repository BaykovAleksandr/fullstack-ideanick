import { env } from './env';
import { promises as fs } from 'fs';
import path from 'path';
import { type Idea, type User } from '@prisma/client';
import fg from 'fast-glob';
import _ from 'lodash';
import Handlebars from 'handlebars';
import { sendEmailThroughBrevo } from './brevo';
import { logger } from './logger';

import { getNewIdeaRoute, getViewIdeaRoute } from './email-routes';

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

  // УБРАТЬ await, так как теперь синхронная функция
  const addIdeaUrl = getNewIdeaRoute({ abs: true });
  console.log('Generated URL for welcome email:', addIdeaUrl);

  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: addIdeaUrl,
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

  // УБРАТЬ Promise.all и await, так как теперь синхронные функции
  const ideasWithUrls = ideas.map((idea) => ({
    name: idea.name,
    url: getViewIdeaRoute({ abs: true, ideaNick: idea.nick }),
  }));

  return await sendEmail({
    to: user.email,
    subject: 'Most Liked Ideas!',
    templateName: 'mostLikedIdeas',
    templateVariables: {
      ideas: ideasWithUrls,
    },
  });
};
