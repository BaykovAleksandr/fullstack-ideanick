import express from 'express';
import { type AppContext, createAppContext } from './lib/ctx';
import { applyTrpcToExpressApp } from './lib/trpc';
import { trpcRouter } from './router';
import cors from 'cors';
import { applyPassportToExpressApp } from './lib/passport';
import { env } from './lib/env';

void (async () => {
  let ctx: AppContext | null = null;
  try {
    ctx = createAppContext();
    const expressApp = express();
    expressApp.use(cors());
    expressApp.get('/ping', (req, res) => {
      res.send('pong');
    });
     applyPassportToExpressApp(expressApp, ctx);
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter);
    expressApp.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    await ctx?.stop();
  }
})();
