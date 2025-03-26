import { playerData } from './player.data';
import logger from '../../utils/logger';

interface PlayerWithStats {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
}

export const getAllPlayers = async (): Promise<PlayerWithStats[]> => {
  const players = await playerData.getAllPlayers();

  return players.map((player) => {
    const matchesWon = player.matches.filter((match) => match.winner).length;
    const matchesLost = player.matches.filter((match) => !match.winner).length;

    return {
      id: player.id,
      name: player.name,
      matchesWon,
      matchesLost,
    };
  });
};

export const createPlayer = async ({ name }: { name: string }) => {
  const existingPlayer = await playerData.findPlayer({ name });

  if (existingPlayer) {
    logger.info(`Player ${name} already exists`);
    return existingPlayer;
  }

  return playerData.createPlayer({ name });
};

export const createTournamentPlayer = async ({
  tournamentTeamId,
  playerId,
  price,
}: {
  tournamentTeamId: string;
  playerId: string;
  price: number;
}) => {
  const existingTournamentPlayer = await playerData.findTournamentPlayer({
    tournamentTeamId,
    playerId,
  });

  if (existingTournamentPlayer) {
    logger.info(
      `Tournament player ${playerId + `:` + tournamentTeamId} already exists`
    );
    return existingTournamentPlayer;
  }

  return playerData.createTournamentPlayer({
    tournamentTeamId,
    playerId,
    price,
  });
};
