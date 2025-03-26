import { roundData } from './round.data';
import logger from '../../utils/logger';

export const createRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
  const existingRound = await roundData.findRound({ tournamentId, name });

  if (existingRound) {
    logger.info(`Round ${name} already exists in tournament ${tournamentId}`);
    return existingRound;
  }

  return roundData.createRound({ tournamentId, name });
};

export const getTournamentRounds = async ({
  tournamentId,
}: {
  tournamentId: string;
}) => {
  return roundData.getTournamentRounds({ tournamentId });
};

export const getRound = async ({ roundId }: { roundId: string }) => {
  return roundData.getRound({ roundId });
};
