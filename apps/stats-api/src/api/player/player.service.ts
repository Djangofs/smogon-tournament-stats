import { playerData } from './player.data';
import logger from '../../utils/logger';

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
