import { matchData } from './match.data';
import { gameData } from '../game/game.data';
import logger from '../../utils/logger';

export const createMatch = async ({
  roundId,
  bestOf,
  player1Id,
  player2Id,
  generation,
  tier,
  playedAt,
}: {
  roundId: string;
  bestOf: number;
  player1Id: string;
  player2Id: string;
  generation: string;
  tier: string;
  playedAt: Date;
}) => {
  // First check for an existing match with these players in this round
  const existingMatch = await matchData.findMatch({
    roundId,
    player1Id,
    player2Id,
  });

  if (existingMatch) {
    logger.info(
      `Match ${player1Id}:${player2Id} in round ${roundId} already exists (ID: ${existingMatch.id})`
    );
    return existingMatch;
  }

  // Create the new match
  const newMatch = await matchData.createMatch({
    roundId,
    bestOf,
    player1Id,
    player2Id,
    generation,
    tier,
    playedAt,
  });

  return newMatch;
};

export const createPlayerMatch = async ({
  playerId,
  matchId,
  tournament_teamId,
}: {
  playerId: string;
  matchId: string;
  tournament_teamId: string;
}) => {
  const existingPlayerMatch = await matchData.findPlayerMatch({
    playerId,
    matchId,
  });

  if (existingPlayerMatch) {
    logger.info(`Player match ${playerId}:${matchId} already exists`);
    return existingPlayerMatch;
  }

  // Get all games for this match
  const games = await gameData.getMatchGames({ matchId });

  // Count wins for this player
  const playerWins = games.reduce((count, game) => {
    const playerGame = game.players.find((p) => p.playerId === playerId);
    return count + (playerGame?.winner ? 1 : 0);
  }, 0);

  // Determine if this player won the match
  const winner = playerWins > games.length / 2;

  return matchData.createPlayerMatch({
    playerId,
    matchId,
    tournament_teamId,
    winner,
  });
};

export const getRoundMatches = async ({ roundId }: { roundId: string }) => {
  return matchData.getRoundMatches({ roundId });
};

export const getMatch = async ({ matchId }: { matchId: string }) => {
  return matchData.getMatch({ matchId });
};
