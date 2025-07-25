import { dbClient } from '../../database/client';

const getAllTeams = async () => {
  return dbClient.team.findMany();
};

const findTeam = async ({ name }: { name: string }) => {
  return dbClient.team.findFirst({ where: { name } });
};

const createTeam = async ({ name }: { name: string }) => {
  return dbClient.team.create({ data: { name } });
};

const createTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return dbClient.tournament_Team.create({ data: { tournamentId, teamId } });
};

const findTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return dbClient.tournament_Team.findFirst({
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
