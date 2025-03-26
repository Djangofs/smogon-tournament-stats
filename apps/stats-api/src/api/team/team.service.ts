import { teamData } from './team.data';

export const createTeam = async ({ name }: { name: string }) => {
  const existingTeam = await teamData.findTeam({ name });

  if (existingTeam) {
    console.log(`Team ${name} already exists`);
    return existingTeam;
  }

  return teamData.createTeam({ name });
};

export const createTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  const existingTournamentTeam = await teamData.findTournamentTeam({
    tournamentId,
    teamId,
  });
  if (existingTournamentTeam) {
    console.log(
      `Tournament team ${teamId + `:` + tournamentId} already exists`
    );
    return existingTournamentTeam;
  }
  return teamData.createTournamentTeam({ tournamentId, teamId });
};
