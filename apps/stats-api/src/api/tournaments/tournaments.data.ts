import { getDbClient } from '../../database/client';

const getAllTournaments = async () => {
  return getDbClient().tournament.findMany();
};

const findTournament = async ({ name }: { name: string }) => {
  return getDbClient().tournament.findFirst({
    where: { name },
  });
};

const getTournamentById = async (id: string) => {
  return getDbClient().tournament.findUnique({
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
  replayPostUrl,
}: {
  name: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
  replayPostUrl?: string;
}) => {
  return getDbClient().tournament.create({
    data: { name, isOfficial, isTeam, year, replayPostUrl },
  });
};

export const tournamentsData = {
  getAllTournaments,
  findTournament,
  getTournamentById,
  createTournament,
};
