import express from 'express';
import { type AppContext, createAppContext } from './lib/ctx';
import { applyTrpcToExpressApp } from './lib/trpc';
import { trpcRouter } from './router';
import cors from 'cors';
import { applyPassportToExpressApp } from './lib/passport';

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
    expressApp.listen(3000, () => {
      console.info('Listening at http://localhost:3000');
    });
  } catch (error) {
    console.error(error);
    await ctx?.stop();
  }
})();
