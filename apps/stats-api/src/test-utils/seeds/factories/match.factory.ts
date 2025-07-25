import { getDbClient } from '../../../database/client';
import {
  tierFixtures,
  generationFixtures,
  stageFixtures,
} from '../fixtures/tournaments.fixtures';

const getRandomTier = () => {
  return tierFixtures[Math.floor(Math.random() * tierFixtures.length)];
};

const getRandomGeneration = () => {
  return generationFixtures[
    Math.floor(Math.random() * generationFixtures.length)
  ];
};

const getRandomStage = () => {
  return stageFixtures[Math.floor(Math.random() * stageFixtures.length)];
};

export const createMatch = async (
  roundId: string,
  overrides: Partial<{
    bestOf: number;
    generation: string;
    tier: string;
    playedAt: Date;
    stage: string;
  }> = {}
) => {
  const defaultData = {
    roundId,
    bestOf: Math.random() > 0.7 ? 3 : 1, // 30% chance of Bo3, 70% Bo1
    generation: getRandomGeneration(),
    tier: getRandomTier(),
    playedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
    stage: getRandomStage(),
    ...overrides,
  };

  return await getDbClient().match.create({
    data: defaultData,
  });
};

export const createPlayerMatch = async (
  playerId: string,
  matchId: string,
  tournamentTeamId: string,
  winner?: boolean
) => {
  return await getDbClient().player_Match.create({
    data: {
      playerId,
      matchId,
      tournament_teamId: tournamentTeamId,
      winner,
    },
  });
};

export const createMatchWithPlayers = async (
  roundId: string,
  player1Data: { playerId: string; tournamentTeamId: string },
  player2Data: { playerId: string; tournamentTeamId: string },
  matchOverrides = {},
  winner?: 'player1' | 'player2' | null
) => {
  const match = await createMatch(roundId, matchOverrides);

  // Determine winners
  let player1Winner: boolean | undefined;
  let player2Winner: boolean | undefined;

  if (winner === 'player1') {
    player1Winner = true;
    player2Winner = false;
  } else if (winner === 'player2') {
    player1Winner = false;
    player2Winner = true;
  }
  // If winner is null, both remain undefined (ongoing match)

  const playerMatch1 = await createPlayerMatch(
    player1Data.playerId,
    match.id,
    player1Data.tournamentTeamId,
    player1Winner
  );

  const playerMatch2 = await createPlayerMatch(
    player2Data.playerId,
    match.id,
    player2Data.tournamentTeamId,
    player2Winner
  );

  return { match, playerMatches: [playerMatch1, playerMatch2] };
};

export const createRandomMatches = async (
  roundId: string,
  players: Array<{ id: string; tournamentTeamId: string }>,
  matchCount = 5
) => {
  const matches = [];

  for (let i = 0; i < matchCount; i++) {
    // Randomly select two different players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const player1 = shuffled[0];
    const player2 = shuffled[1];

    // Random winner (80% chance of having a result, 20% ongoing)
    const hasResult = Math.random() > 0.2;
    const winner = hasResult
      ? Math.random() > 0.5
        ? 'player1'
        : 'player2'
      : null;

    const matchData = await createMatchWithPlayers(
      roundId,
      { playerId: player1.id, tournamentTeamId: player1.tournamentTeamId },
      { playerId: player2.id, tournamentTeamId: player2.tournamentTeamId },
      {},
      winner as 'player1' | 'player2' | null
    );

    matches.push(matchData);
  }

  return matches;
};
