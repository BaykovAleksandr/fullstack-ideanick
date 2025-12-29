import { env } from './lib/env';
import express from 'express';
import { type AppContext, createAppContext } from './lib/ctx';
import { applyTrpcToExpressApp } from './lib/trpc';
import { trpcRouter } from './router';
import cors from 'cors';
import { applyPassportToExpressApp } from './lib/passport';
import { presetDb } from './scripts/presetDb';
import { applyCron } from './lib/cron';
import { logger } from './lib/logger';
import debug from 'debug';
import { applyServeWebApp } from './lib/serveWebApp';

void (async () => {
  let ctx: AppContext | null = null;
  try {
    debug.enable(env.DEBUG);
    ctx = createAppContext();
    await presetDb(ctx);
    const expressApp = express();
    expressApp.use(cors());
    expressApp.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: env.PORT,
        nodeEnv: process.env.NODE_ENV,
        hostEnv: env.HOST_ENV,
      });
    });

    expressApp.get('/env-check', (req, res) => {
      // Только безопасные переменные
      res.json({
        port: env.PORT,
        nodeEnv: process.env.NODE_ENV,
        hostEnv: env.HOST_ENV,
        webappUrl: env.WEBAPP_URL,
        hasBrevoKey: !!env.BREVO_API_KEY,
        fromEmail: env.FROM_EMAIL_ADDRESS,
        hasDbUrl: !!env.DATABASE_URL,
        hasJwtSecret: !!env.JWT_SECRET,
      });
    });

    expressApp.get('/ping', (req, res) => {
      res.send('pong');
    });
    expressApp.get('/ping', (req, res) => {
      res.send('pong');
    });
    applyPassportToExpressApp(expressApp, ctx);
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter);
    await applyServeWebApp(expressApp);
    applyCron(ctx);
    expressApp.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('express', error);
      if (res.headersSent) {
        next(error);
        return;
      }
      res.status(500).send('Internal server error');
    });

    // ========== ОБНОВИТЕ ЭТОТ БЛОК ==========
    expressApp.listen(env.PORT, () => {
      logger.info('express', `Listening at http://localhost:${env.PORT}`);

      // ДОБАВЬТЕ ЭТИ ЛОГИ:
      console.log(`✅ ============================================`);
      console.log(`✅ Server configuration:`);
      console.log(`✅ PORT: ${env.PORT}`);
      console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
      console.log(`✅ HOST_ENV: ${env.HOST_ENV}`);
      console.log(`✅ WEBAPP_URL: ${env.WEBAPP_URL}`);
      console.log(`✅ BREVO_API_KEY exists: ${!!env.BREVO_API_KEY}`);
      console.log(`✅ FROM_EMAIL: ${env.FROM_EMAIL_ADDRESS}`);
      console.log(`✅ DATABASE_URL exists: ${!!env.DATABASE_URL}`);
      console.log(`✅ ============================================`);
    });
    // ========================================
  } catch (error) {
    logger.error('app', error);
    await ctx?.stop();
  }
})();
