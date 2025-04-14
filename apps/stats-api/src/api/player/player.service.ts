import { playerData } from './player.data';
import logger from '../../utils/logger';

interface PlayerWithStats {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
  deadGames: number;
}

interface PlayerMatch {
  id: string;
  winner: boolean | null;
  generation: string;
  tier: string;
  stage: string | null;
  year: number;
  tournamentName: string;
  opponentName: string;
  opponentId: string;
}

interface PlayerDetails {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
  deadGames: number;
  matches: PlayerMatch[];
  aliases: string[];
}

export interface PlayerRecord {
  id: string;
  name: string;
  aliases: string[];
}

export const getAllPlayers = async ({
  generation,
  tier,
  startYear,
  endYear,
  stage,
}: {
  generation?: string;
  tier?: string;
  startYear?: number;
  endYear?: number;
  stage?: string;
} = {}): Promise<PlayerWithStats[]> => {
  const players = await playerData.getAllPlayers({
    generation,
    tier,
    startYear,
    endYear,
    stage,
  });

  return players.map((player) => {
    const matchesWon = player.matches.filter(
      (match) => match.winner === true
    ).length;
    const matchesLost = player.matches.filter(
      (match) => match.winner === false
    ).length;
    const deadGames = player.matches.filter(
      (match) => match.winner === null
    ).length;

    return {
      id: player.id,
      name: player.name,
      matchesWon,
      matchesLost,
      deadGames,
    };
  });
};

export const createPlayer = async ({
  name,
}: {
  name: string;
}): Promise<PlayerRecord> => {
  // First try to find player by name or alias
  const existingPlayer = await playerData.findPlayerByName({ name });

  if (existingPlayer) {
    logger.info(
      `Found existing player ${existingPlayer.currentName} for name ${name}`
    );
    return {
      id: existingPlayer.id,
      name: existingPlayer.currentName,
      aliases: existingPlayer.aliases,
    };
  }

  // If no existing player found, create a new one
  logger.info(`Creating new player ${name}`);
  const newPlayer = await playerData.createPlayer({ name });
  return {
    id: newPlayer.id,
    name: newPlayer.name,
    aliases: [],
  };
};

export const createTournamentPlayer = async ({
  tournamentTeamId,
  playerId,
  price,
}: {
  tournamentTeamId: string;
  playerId: string;
  price: number;
}) => {
  const existingTournamentPlayer = await playerData.findTournamentPlayer({
    tournamentTeamId,
    playerId,
  });

  if (existingTournamentPlayer) {
    logger.info(
      `Tournament player ${playerId + `:` + tournamentTeamId} already exists`
    );
    return existingTournamentPlayer;
  }

  return playerData.createTournamentPlayer({
    tournamentTeamId,
    playerId,
    price,
  });
};

export const linkPlayerRecords = async ({
  oldName,
  newName,
}: {
  oldName: string;
  newName: string;
}): Promise<PlayerRecord> => {
  // Find both players
  const oldPlayer = await playerData.findPlayerByName({ name: oldName });
  const newPlayer = await playerData.findPlayerByName({ name: newName });

  if (!oldPlayer || !newPlayer) {
    throw new Error('Both players must exist to link records');
  }

  if (oldPlayer.id === newPlayer.id) {
    logger.info(
      `Players ${oldName} and ${newName} are already the same record`
    );
    return {
      id: oldPlayer.id,
      name: oldPlayer.currentName,
      aliases: oldPlayer.aliases,
    };
  }

  // Link the records by creating an alias and updating the current name
  await playerData.updatePlayerName({
    playerId: oldPlayer.id,
    newName: newPlayer.currentName,
  });

  logger.info(`Linked player records: ${oldName} -> ${newPlayer.currentName}`);
  return {
    id: oldPlayer.id,
    name: newPlayer.currentName,
    aliases: newPlayer.aliases,
  };
};

export const getPlayerById = async (id: string): Promise<PlayerDetails> => {
  const player = await playerData.getPlayerById({ id });
  if (!player) {
    throw new Error(`Player with ID ${id} not found`);
  }

  const matchesWon = player.matches.filter(
    (match) => match.winner === true
  ).length;
  const matchesLost = player.matches.filter(
    (match) => match.winner === false
  ).length;
  const deadGames = player.matches.filter(
    (match) => match.winner === null
  ).length;

  const matches = player.matches.map((match) => {
    // Find the opponent in the match
    const opponent = match.match.players.find((p) => p.playerId !== player.id);

    return {
      id: match.match.id,
      winner: match.winner,
      generation: match.match.generation,
      tier: match.match.tier,
      stage: match.match.stage,
      year: match.match.round.tournament.year,
      tournamentName: match.match.round.tournament.name,
      opponentName: opponent?.player.name || 'Unknown',
      opponentId: opponent?.playerId || '',
    };
  });

  return {
    id: player.id,
    name: player.name,
    matchesWon,
    matchesLost,
    deadGames,
    matches,
    aliases: player.aliases.map((alias) => alias.name),
  };
};

export const addPlayerAlias = async ({
  playerId,
  alias,
}: {
  playerId: string;
  alias: string;
}): Promise<{ id: string; name: string }> => {
  // First check if the player exists
  const player = await playerData.getPlayerById({ id: playerId });
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Check if the alias already exists for any player
  const existingPlayer = await playerData.findPlayerByName({ name: alias });
  if (existingPlayer) {
    throw new Error(
      `Alias ${alias} is already in use by player: ${existingPlayer.currentName}`
    );
  }

  // Add the alias to the player's aliases
  logger.info(`Adding alias ${alias} to player ${player.name}`);
  await playerData.addPlayerAlias({
    playerId,
    alias,
  });

  return {
    id: player.id,
    name: player.name,
  };
};
