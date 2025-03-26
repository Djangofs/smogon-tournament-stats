import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const createRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
  return client.round.create({
    data: {
      tournamentId,
      name,
    },
  });
};

const getTournamentRounds = async ({
  tournamentId,
}: {
  tournamentId: string;
}) => {
  return client.round.findMany({
    where: {
      tournamentId,
    },
    include: {
      matches: true,
    },
  });
};

const getRound = async ({ roundId }: { roundId: string }) => {
  return client.round.findUnique({
    where: {
      id: roundId,
    },
    include: {
      matches: true,
    },
  });
};

export const roundData = {
  createRound,
  getTournamentRounds,
  getRound,
};
