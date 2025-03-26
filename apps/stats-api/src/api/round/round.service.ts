import { roundData } from './round.data';

export const createRound = async ({
  tournamentId,
  name,
}: {
  tournamentId: string;
  name: string;
}) => {
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
