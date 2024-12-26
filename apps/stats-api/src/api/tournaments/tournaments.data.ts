import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const getAllTournaments = async () => {
  return client.tournament.findMany();
};

const createTournament = async ({ name }: { name: string }) => {
  return client.tournament.create({ data: { name } });
};

export const tournamentsData = {
  getAllTournaments,
  createTournament,
};
