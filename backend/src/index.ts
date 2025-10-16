import express from 'express';
import { applyTrpcToExpressApp } from './lib/trpc';
import { trpcRouter } from './router';
import cors from 'cors';

const expressApp = express();
expressApp.use(cors());
expressApp.get('/ping', (req, res) => {
  res.send('pong');
});

applyTrpcToExpressApp(expressApp, trpcRouter);
expressApp.listen(3000, () => {
  console.info('Listening at http://localhost:3000');
});
