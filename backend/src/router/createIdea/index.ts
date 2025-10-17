import { zCreateIdeaTrpcInput } from './input';
import { ideas } from '../../lib/ideas';
import { trpc } from '../../lib/trpc';

export const createIdeaTrpcRoute = trpc.procedure.input(zCreateIdeaTrpcInput).mutation(({ input }) => {
  ideas.unshift(input);
  return true;
});
