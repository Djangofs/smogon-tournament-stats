import { getDbClient } from '../../../database/client';
import { tournamentFixtures } from '../fixtures/tournaments.fixtures';

const getRandomTournament = () => {
  return tournamentFixtures[
    Math.floor(Math.random() * tournamentFixtures.length)
  ];
};

export const createTournament = async (
  overrides: Partial<{
    name: string;
    year: number;
    isOfficial: boolean;
    isTeam: boolean;
    replayPostUrl: string | null;
  }> = {}
) => {
  const template = getRandomTournament();
  const defaultData = {
    name: `${template.name} (Test)`,
    year: template.year,
    isOfficial: template.isOfficial,
    isTeam: template.isTeam,
    replayPostUrl: template.replayPostUrl,
    ...overrides,
  };

  return await getDbClient().tournament.create({
    data: defaultData,
  });
};

export const createTournaments = async (count: number) => {
  return await Promise.all(
    Array(count)
      .fill(0)
      .map(() => createTournament())
  );
};
