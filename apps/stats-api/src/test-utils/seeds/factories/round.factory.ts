import { getDbClient } from '../../../database/client';
import { roundFixtures } from '../fixtures/tournaments.fixtures';

const getRandomRoundName = () => {
  return roundFixtures[Math.floor(Math.random() * roundFixtures.length)];
};

export const createRound = async (
  tournamentId: string,
  overrides: Partial<{
    name: string;
  }> = {}
) => {
  const defaultData = {
    tournamentId,
    name: getRandomRoundName(),
    ...overrides,
  };

  return await getDbClient().round.create({
    data: defaultData,
  });
};

export const createRounds = async (tournamentId: string, count: number) => {
  return await Promise.all(
    Array(count)
      .fill(0)
      .map((_, index) =>
        createRound(tournamentId, {
          name: roundFixtures[index % roundFixtures.length],
        })
      )
  );
};

export const createRegularSeasonRounds = async (
  tournamentId: string,
  weekCount = 9
) => {
  return await Promise.all(
    Array(weekCount)
      .fill(0)
      .map((_, index) =>
        createRound(tournamentId, { name: `Week ${index + 1}` })
      )
  );
};

export const createPlayoffRounds = async (tournamentId: string) => {
  const playoffRounds = [
    'Playoffs Week 1',
    'Playoffs Week 2',
    'Playoffs Week 3',
    'Finals',
  ];

  return await Promise.all(
    playoffRounds.map((name) => createRound(tournamentId, { name }))
  );
};
