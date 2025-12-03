import _ from 'lodash';
import { trpcLoggedProcedure } from '../../../lib/trpc';
import { zGetIdeasTrpcInput } from './input';

export const getIdeasTrpcRoute = trpcLoggedProcedure.input(zGetIdeasTrpcInput).query(async ({ ctx, input }) => {
  const normalizedSearch = input.search?.trim();

  const rawIdeas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
      serialNumber: true,
      _count: {
        select: {
          ideasLikes: true,
        },
      },
    },
    where: {
      blockedAt: null,
      ...(normalizedSearch
        ? {
            OR: [
              {
                name: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
              {
                text: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        serialNumber: 'desc',
      },
    ],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  });

  const nextIdea = rawIdeas.at(input.limit);
  const nextCursor = nextIdea?.serialNumber;
  const rawIdeasExceptNext = rawIdeas.slice(0, input.limit);
  const ideasExceptNext = rawIdeasExceptNext.map((idea) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }));

  return { ideas: ideasExceptNext, nextCursor };
});
