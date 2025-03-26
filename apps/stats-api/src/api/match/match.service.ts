import { matchData } from './match.data';
import logger from '../../utils/logger';

export const createMatch = async ({
  roundId,
  bestOf,
  player1Id,
  player2Id,
}: {
  roundId: string;
  bestOf: number;
  player1Id: string;
  player2Id: string;
}) => {
  // Check for existing match between these players in this round
  const existingMatches = await matchData.getRoundMatches({ roundId });
  const existingMatch = existingMatches.find((match) => {
    const matchPlayers = match.players.map((p) => p.playerId);
    return matchPlayers.includes(player1Id) && matchPlayers.includes(player2Id);
  });

  if (existingMatch) {
    return existingMatch;
  }

  return matchData.createMatch({ roundId, bestOf });
};

export const createPlayerMatch = async ({
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
  const existingPlayerMatch = await matchData.findPlayerMatch({
    playerId,
    matchId,
  });

  if (existingPlayerMatch) {
    logger.info(`Player match ${playerId}:${matchId} already exists`);
    return existingPlayerMatch;
  }

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
