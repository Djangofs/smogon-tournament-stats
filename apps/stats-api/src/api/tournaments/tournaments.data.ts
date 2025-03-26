import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const getAllTournaments = async () => {
  return client.tournament.findMany();
};

const findTournament = async ({ name }: { name: string }) => {
  return client.tournament.findFirst({
    where: { name },
  });
};

const getTournamentById = async (id: string) => {
  return client.tournament.findUnique({
    where: { id },
    include: {
      rounds: {
        include: {
          matches: {
            include: {
              players: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const createTournament = async ({
  name,
  isOfficial,
  isTeam,
}: {
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
}) => {
  return client.tournament.create({
    data: { name, isOfficial, isTeam },
  });
};

export const tournamentsData = {
  getAllTournaments,
  findTournament,
  getTournamentById,
  createTournament,
};
