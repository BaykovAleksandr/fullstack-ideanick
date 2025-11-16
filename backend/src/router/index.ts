import { trpc } from '../lib/trpc';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { getMeTrpcRoute } from './auth/getMe';
import { signInTrpcRoute } from './auth/signIn';
import { signUpTrpcRoute } from './auth/signUp';
import { createIdeaTrpcRoute } from './ideas/createIdea';
import { getIdeaTrpcRoute } from './ideas/getIdea';
import { getIdeasTrpcRoute } from './ideas/getIdeas';
import { updateIdeaTrpcRoute } from './ideas/updateIdea';
import { updateProfileTrpcRoute } from './auth/updateProfile';
// @endindex

export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)

  createIdea: createIdeaTrpcRoute,
  getIdea: getIdeaTrpcRoute,
  getIdeas: getIdeasTrpcRoute,
  getMe: getMeTrpcRoute,
  signIn: signInTrpcRoute,
  signUp: signUpTrpcRoute,
  updateProfile: updateProfileTrpcRoute,
  updateIdea: updateIdeaTrpcRoute,
  // @endindex
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>;
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>;
