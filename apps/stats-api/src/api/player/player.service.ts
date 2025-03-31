import { playerData } from './player.data';
import logger from '../../utils/logger';

interface PlayerWithStats {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
}

interface PlayerMatch {
  id: string;
  winner: boolean;
  generation: string;
  tier: string;
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
  matches: PlayerMatch[];
}

interface PlayerRecord {
  id: string;
  name: string;
}

export const getAllPlayers = async ({
  generation,
  tier,
  startYear,
  endYear,
}: {
  generation?: string;
  tier?: string;
  startYear?: number;
  endYear?: number;
} = {}): Promise<PlayerWithStats[]> => {
  const players = await playerData.getAllPlayers({
    generation,
    tier,
    startYear,
    endYear,
  });

  return players.map((player) => {
    const matchesWon = player.matches.filter((match) => match.winner).length;
    const matchesLost = player.matches.filter((match) => !match.winner).length;

    return {
      id: player.id,
      name: player.name,
      matchesWon,
      matchesLost,
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
    };
  }

  // If no existing player found, create a new one
  logger.info(`Creating new player ${name}`);
  const newPlayer = await playerData.createPlayer({ name });
  return {
    id: newPlayer.id,
    name: newPlayer.name,
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
  };
};

export const getPlayerById = async (id: string): Promise<PlayerDetails> => {
  const player = await playerData.getPlayerById({ id });
  if (!player) {
    throw new Error(`Player with ID ${id} not found`);
  }

  const matchesWon = player.matches.filter((match) => match.winner).length;
  const matchesLost = player.matches.filter((match) => !match.winner).length;

  const matches = player.matches.map((match) => {
    // Find the opponent in the match
    const opponent = match.match.players.find((p) => p.playerId !== player.id);

    return {
      id: match.match.id,
      winner: match.winner,
      generation: match.match.generation,
      tier: match.match.tier,
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
    matches,
  };
};
