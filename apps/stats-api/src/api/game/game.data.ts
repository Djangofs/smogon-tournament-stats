import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const createGame = async ({
  matchId,
  player1Id,
  player2Id,
  player1Winner,
  generation,
  tier,
  playedAt,
  replayUrl,
}: {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Winner: boolean;
  generation: string;
  tier: string;
  playedAt: Date;
  replayUrl?: string;
}) => {
  return client.game.create({
    data: {
      matchId,
      generation,
      tier,
      playedAt,
      replayUrl,
    },
  });
};

const createPlayerGame = async ({
  playerId,
  gameId,
  winner,
}: {
  playerId: string;
  gameId: string;
  winner: boolean;
}) => {
  return client.player_Game.create({
    data: {
      playerId,
      gameId,
      winner,
    },
  });
};

const getMatchGames = async ({ matchId }: { matchId: string }) => {
  return client.game.findMany({
    where: {
      matchId,
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });
};

const getGame = async ({ gameId }: { gameId: string }) => {
  return client.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  });
};

const findPlayerGame = async ({
  playerId,
  gameId,
}: {
  playerId: string;
  gameId: string;
}) => {
  return client.player_Game.findUnique({
    where: {
      playerId_gameId: {
        playerId,
        gameId,
      },
    },
  });
};

export const gameData = {
  createGame,
  createPlayerGame,
  getMatchGames,
  getGame,
  findPlayerGame,
};
