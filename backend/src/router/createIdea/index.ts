import { zCreateIdeaTrpcInput } from './input';
import { ideas } from '../../lib/ideas';
import { trpc } from '../../lib/trpc';

export const createIdeaTrpcRoute = trpc.procedure.input(zCreateIdeaTrpcInput).mutation(({ input }) => {
  if (ideas.find((idea) => idea.nick === input.nick)) {
    throw Error('Idea with this nick already exists');
  }
  ideas.unshift(input);
  return true;
});
