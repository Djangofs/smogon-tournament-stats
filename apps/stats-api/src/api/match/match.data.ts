import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const createMatch = async ({
  roundId,
  bestOf,
  player1Id,
  player2Id,
  generation,
  tier,
  playedAt,
  stage,
}: {
  roundId: string;
  bestOf: number;
  player1Id: string;
  player2Id: string;
  generation: string;
  tier: string;
  playedAt: Date;
  stage: string | null;
}) => {
  return client.match.create({
    data: {
      roundId,
      bestOf,
      generation,
      tier,
      playedAt,
      stage,
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
      games: {
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      },
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

const findMatch = async ({
  roundId,
  player1Id,
  player2Id,
}: {
  roundId: string;
  player1Id: string;
  player2Id: string;
}) => {
  const matches = await client.match.findMany({
    where: {
      roundId,
      AND: [
        {
          players: {
            some: {
              playerId: player1Id,
            },
          },
        },
        {
          players: {
            some: {
              playerId: player2Id,
            },
          },
        },
      ],
    },
    include: {
      players: true,
    },
  });

  // Filter to ensure player1 and player2 are in the correct positions
  return matches.find((match) => {
    const player1Match = match.players.find((p) => p.playerId === player1Id);
    const player2Match = match.players.find((p) => p.playerId === player2Id);
    return player1Match && player2Match;
  });
};

export const matchData = {
  createMatch,
  createPlayerMatch,
  getRoundMatches,
  getMatch,
  findPlayerMatch,
  findMatch,
};
