import { dbClient } from '../../database/client';

const findRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
  return dbClient.round.findFirst({
    where: {
      tournamentId,
      name,
    },
  });
};

const createRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
  return dbClient.round.create({
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
  return dbClient.round.findMany({
    where: {
      tournamentId,
    },
    include: {
      matches: true,
    },
  });
};

const getRound = async ({ roundId }: { roundId: string }) => {
  return dbClient.round.findUnique({
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
  findRound,
};
