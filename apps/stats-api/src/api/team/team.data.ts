import { getDbClient } from '../../database/client';

const getAllTeams = async () => {
  return getDbClient().team.findMany();
};

const findTeam = async ({ name }: { name: string }) => {
  return getDbClient().team.findFirst({ where: { name } });
};

const createTeam = async ({ name }: { name: string }) => {
  return getDbClient().team.create({ data: { name } });
};

const createTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return getDbClient().tournament_Team.create({ data: { tournamentId, teamId } });
};

const findTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return getDbClient().tournament_Team.findFirst({
    where: { tournamentId, teamId },
  });
};

export const teamData = {
  getAllTeams,
  findTeam,
  createTeam,
  createTournamentTeam,
  findTournamentTeam,
};
