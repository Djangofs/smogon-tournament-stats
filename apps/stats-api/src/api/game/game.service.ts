import { gameData } from './game.data';
import logger from '../../utils/logger';

export const createGame = async ({
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
  // Create the game
  const game = await gameData.createGame({
    matchId,
    player1Id,
    player2Id,
    player1Winner,
    generation,
    tier,
    playedAt,
    replayUrl,
  });

  // Create player game records
  await createPlayerGame({
    playerId: player1Id,
    gameId: game.id,
    winner: player1Winner,
  });

  await createPlayerGame({
    playerId: player2Id,
    gameId: game.id,
    winner: !player1Winner,
  });

  return game;
};

export const createPlayerGame = async ({
  playerId,
  gameId,
  winner,
}: {
  playerId: string;
  gameId: string;
  winner: boolean;
}) => {
  const existingPlayerGame = await gameData.findPlayerGame({
    playerId,
    gameId,
  });

  if (existingPlayerGame) {
    logger.info(`Player game ${playerId}:${gameId} already exists`);
    return existingPlayerGame;
  }

  return gameData.createPlayerGame({
    playerId,
    gameId,
    winner,
  });
};

export const getMatchGames = async ({ matchId }: { matchId: string }) => {
  return gameData.getMatchGames({ matchId });
};

export const getGame = async ({ gameId }: { gameId: string }) => {
  return gameData.getGame({ gameId });
};
