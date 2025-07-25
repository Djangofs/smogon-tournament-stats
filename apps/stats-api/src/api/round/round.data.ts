import { getDbClient } from '../../database/client';

const findRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
  return getDbClient().round.findFirst({
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
  return getDbClient().round.create({
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
  return getDbClient().round.findMany({
    where: {
      tournamentId,
    },
    include: {
      matches: true,
    },
  });
};

const getRound = async ({ roundId }: { roundId: string }) => {
  return getDbClient().round.findUnique({
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
