import { getDbClient } from '../../../database/client';
import { playerFixtures } from '../fixtures/tournaments.fixtures';

const getRandomPlayerName = () => {
  return playerFixtures[Math.floor(Math.random() * playerFixtures.length)];
};

export const createPlayer = async (
  overrides: Partial<{
    name: string;
  }> = {}
) => {
  const defaultData = {
    name: getRandomPlayerName(),
    ...overrides,
  };

  return await getDbClient().player.create({
    data: defaultData,
  });
};

export const createPlayers = async (count: number) => {
  // Ensure unique player names
  const shuffledNames = [...playerFixtures].sort(() => Math.random() - 0.5);

  return await Promise.all(
    Array(count)
      .fill(0)
      .map((_, index) =>
        createPlayer({ name: shuffledNames[index % shuffledNames.length] })
      )
  );
};

export const createPlayerAlias = async (
  playerId: string,
  aliasName: string
) => {
  return await getDbClient().playerAlias.create({
    data: {
      playerId,
      name: aliasName,
    },
  });
};

export const createPlayerWithAliases = async (
  playerName?: string,
  aliases: string[] = []
) => {
  const player = await createPlayer(playerName ? { name: playerName } : {});

  const playerAliases = await Promise.all(
    aliases.map((alias) => createPlayerAlias(player.id, alias))
  );

  return { player, aliases: playerAliases };
};

export const createTournamentPlayer = async (
  playerId: string,
  tournamentTeamId: string,
  price = Math.floor(Math.random() * 20000) + 5000 // Random price between 5k-25k
) => {
  return await getDbClient().tournament_Player.create({
    data: {
      playerId,
      tournament_teamId: tournamentTeamId,
      price,
    },
  });
};

export const addPlayersToTournamentTeam = async (
  tournamentTeamId: string,
  playerCount = 6,
  playerOverrides: Partial<{ name: string }>[] = []
) => {
  // Create players
  const players = await Promise.all(
    Array(playerCount)
      .fill(0)
      .map((_, index) => createPlayer(playerOverrides[index] || {}))
  );

  // Add them to the tournament team
  const tournamentPlayers = await Promise.all(
    players.map((player) => createTournamentPlayer(player.id, tournamentTeamId))
  );

  return { players, tournamentPlayers };
};
