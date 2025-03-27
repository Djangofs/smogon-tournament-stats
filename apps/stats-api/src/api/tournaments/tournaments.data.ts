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
                  team: {
                    include: {
                      team: true,
                    },
                  },
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
  year,
}: {
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
}) => {
  return client.tournament.create({
    data: { name, isOfficial, isTeam, year },
  });
};

export const tournamentsData = {
  getAllTournaments,
  findTournament,
  getTournamentById,
  createTournament,
};
