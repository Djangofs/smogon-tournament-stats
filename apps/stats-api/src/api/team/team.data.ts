import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const getAllTeams = async () => {
  return client.team.findMany();
};

const findTeam = async ({ name }: { name: string }) => {
  return client.team.findFirst({ where: { name } });
};

const createTeam = async ({ name }: { name: string }) => {
  return client.team.create({ data: { name } });
};

const createTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return client.tournament_Team.create({ data: { tournamentId, teamId } });
};

const findTournamentTeam = async ({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) => {
  return client.tournament_Team.findFirst({ where: { tournamentId, teamId } });
};

export const teamData = {
  getAllTeams,
  findTeam,
  createTeam,
  createTournamentTeam,
  findTournamentTeam,
};
