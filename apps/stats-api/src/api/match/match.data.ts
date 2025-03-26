import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const createMatch = async ({
  roundId,
  bestOf,
}: {
  roundId: string;
  bestOf: number;
}) => {
  return client.match.create({
    data: {
      roundId,
      bestOf,
    },
  });
};

const createPlayerMatch = async ({
  playerId,
  matchId,
  tournament_teamId,
  winner,
}: {
  playerId: string;
  matchId: string;
  tournament_teamId: string;
  winner: boolean;
}) => {
  return client.player_Match.create({
    data: {
      playerId,
      matchId,
      tournament_teamId,
      winner,
    },
  });
};

const getRoundMatches = async ({ roundId }: { roundId: string }) => {
  return client.match.findMany({
    where: {
      roundId,
    },
    include: {
      games: true,
      players: {
        include: {
          player: true,
          team: true,
        },
      },
    },
  });
};

const getMatch = async ({ matchId }: { matchId: string }) => {
  return client.match.findUnique({
    where: {
      id: matchId,
    },
    include: {
      games: true,
      players: {
        include: {
          player: true,
          team: true,
        },
      },
    },
  });
};

const findPlayerMatch = async ({
  playerId,
  matchId,
}: {
  playerId: string;
  matchId: string;
}) => {
  return client.player_Match.findUnique({
    where: {
      playerId_matchId: {
        playerId,
        matchId,
      },
    },
  });
};

export const matchData = {
  createMatch,
  createPlayerMatch,
  getRoundMatches,
  getMatch,
  findPlayerMatch,
};
