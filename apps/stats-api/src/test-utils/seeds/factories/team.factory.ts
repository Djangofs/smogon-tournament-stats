import { getDbClient } from '../../../database/client';
import { teamFixtures } from '../fixtures/tournaments.fixtures';

const getRandomTeamName = () => {
  return teamFixtures[Math.floor(Math.random() * teamFixtures.length)];
};

export const createTeam = async (
  overrides: Partial<{
    name: string;
  }> = {}
) => {
  const defaultData = {
    name: getRandomTeamName(),
    ...overrides,
  };

  return await getDbClient().team.create({
    data: defaultData,
  });
};

export const createTeams = async (count: number) => {
  // Ensure unique team names
  const shuffledNames = [...teamFixtures].sort(() => Math.random() - 0.5);

  return await Promise.all(
    Array(count)
      .fill(0)
      .map((_, index) =>
        createTeam({ name: shuffledNames[index % shuffledNames.length] })
      )
  );
};

export const createTournamentTeam = async (
  tournamentId: string,
  teamId: string
) => {
  return await getDbClient().tournament_Team.create({
    data: {
      tournamentId,
      teamId,
    },
  });
};

export const createTournamentWithTeams = async (
  teamCount = 4,
  tournamentOverrides = {}
) => {
  const tournament = await createTournament(tournamentOverrides);
  const teams = await createTeams(teamCount);

  // Link teams to tournament
  const tournamentTeams = await Promise.all(
    teams.map((team) => createTournamentTeam(tournament.id, team.id))
  );

  return { tournament, teams, tournamentTeams };
};

// Helper function - need to import createTournament
const createTournament = async (overrides = {}) => {
  const { createTournament: tournamentFactory } = await import(
    './tournament.factory'
  );
  return tournamentFactory(overrides);
};
