import { playerData } from './player.data';

export const createPlayer = async ({ name }: { name: string }) => {
  const existingPlayer = await playerData.findPlayer({ name });

  if (existingPlayer) {
    console.log(`Player ${name} already exists`);
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
    console.log(
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
