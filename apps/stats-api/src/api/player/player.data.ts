import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const client = new PrismaClient();

interface PlayerRecord {
  id: string;
  name: string;
}

const getAllPlayers = async ({
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
} = {}) => {
  // Split comma-separated values into arrays
  const generations = generation?.split(',');
  const tiers = tier?.split(',');
  const stages = stage?.split(',');

  return client.player.findMany({
    include: {
      matches: {
        where: {
          match: {
            ...(generations && { generation: { in: generations } }),
            ...(tiers && { tier: { in: tiers } }),
            ...(stages && { stage: { in: stages } }),
            ...((startYear || endYear) && {
              round: {
                tournament: {
                  year: {
                    ...(startYear && { gte: startYear }),
                    ...(endYear && { lte: endYear }),
                  },
                },
              },
            }),
          },
        },
        select: {
          winner: true,
          match: {
            select: {
              generation: true,
              tier: true,
              stage: true,
              round: {
                select: {
                  tournament: {
                    select: {
                      year: true,
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

const createPlayer = async ({ name }: { name: string }) => {
  return client.player.create({ data: { name } });
};

const createPlayers = async ({ names }: { names: string[] }) => {
  return client.player.createMany({ data: names.map((name) => ({ name })) });
};

const findPlayer = async ({ name }: { name: string }) => {
  return client.player.findFirst({ where: { name } });
};

const createTournamentPlayer = async ({
  tournamentTeamId,
  playerId,
  price,
}: {
  tournamentTeamId: string;
  playerId: string;
  price: number;
}) => {
  return client.tournament_Player.create({
    data: { playerId, tournament_teamId: tournamentTeamId, price },
  });
};

const findTournamentPlayer = async ({
  tournamentTeamId,
  playerId,
}: {
  tournamentTeamId: string;
  playerId: string;
}) => {
  return client.tournament_Player.findFirst({
    where: { playerId, tournament_teamId: tournamentTeamId },
  });
};

const updatePlayerName = async ({
  playerId,
  newName,
}: {
  playerId: string;
  newName: string;
}): Promise<void> => {
  const player = await client.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // If the new name is different from the current name
  if (player.name !== newName) {
    // Create a new alias for the old name
    await client.playerAlias.create({
      data: {
        playerId,
        name: player.name,
      },
    });

    // Update the player's current name
    await client.player.update({
      where: { id: playerId },
      data: { name: newName },
    });
  }
};

const findPlayerByName = async ({
  name,
}: {
  name: string;
}): Promise<{
  id: string;
  currentName: string;
  aliases: string[];
} | null> => {
  // Try to find by current name
  const player = await client.player.findFirst({
    where: { name },
    include: { aliases: true },
  });

  if (player) {
    return {
      id: player.id,
      currentName: player.name,
      aliases: player.aliases.map((alias) => alias.name),
    };
  }

  // Try to find by alias
  const alias = await client.playerAlias.findFirst({
    where: { name },
    include: {
      player: {
        include: {
          aliases: true,
        },
      },
    },
  });

  if (alias) {
    return {
      id: alias.playerId,
      currentName: alias.player.name,
      aliases: alias.player.aliases.map((alias) => alias.name),
    };
  }

  return null;
};

/**
 * Updates all player references to point to the new player
 * @param prisma - Prisma transaction client
 * @param oldPlayerId - ID of player to be merged
 * @param newPlayerId - ID of target player
 */
const updatePlayerReferences = async (
  prisma: any,
  oldPlayerId: string,
  newPlayerId: string
): Promise<void> => {
  await Promise.all([
    prisma.player_Game.updateMany({
      where: { playerId: oldPlayerId },
      data: { playerId: newPlayerId },
    }),
    prisma.player_Match.updateMany({
      where: { playerId: oldPlayerId },
      data: { playerId: newPlayerId },
    }),
    prisma.tournament_Player.updateMany({
      where: { playerId: oldPlayerId },
      data: { playerId: newPlayerId },
    }),
  ]);
};

/**
 * Creates an alias for the old player name if it doesn't already exist
 * @param prisma - Prisma transaction client
 * @param newPlayerId - ID of target player
 * @param oldPlayerName - Name to add as alias
 */
const createPlayerAlias = async (
  prisma: any,
  newPlayerId: string,
  oldPlayerName: string
): Promise<void> => {
  const existingAlias = await prisma.playerAlias.findFirst({
    where: {
      playerId: newPlayerId,
      name: oldPlayerName,
    },
  });

  if (!existingAlias) {
    await prisma.playerAlias.create({
      data: {
        playerId: newPlayerId,
        name: oldPlayerName,
      },
    });
  }
};

/**
 * Links two player records by merging all associated data
 * Moves all matches, games, and tournament records from oldPlayer to newPlayer,
 * creates an alias for the old name, and deletes the old player record
 * 
 * @param oldName - Name of the player to be merged (will be deleted)
 * @param newName - Name of the target player (will receive all data)
 * @returns Promise resolving to the updated player record
 * @throws Error if validation fails or players don't exist
 */
const linkPlayerRecords = async ({
  oldName,
  newName,
}: {
  oldName: string;
  newName: string;
}, 
// Allow dependency injection for testing
findPlayerByNameFn = findPlayerByName
): Promise<PlayerRecord> => {
  try {
    // Validate input parameters
    if (!oldName?.trim() || !newName?.trim()) {
      throw new Error(
        'Both oldName and newName are required and cannot be empty'
      );
    }

    if (oldName.trim().toLowerCase() === newName.trim().toLowerCase()) {
      throw new Error('Cannot link a player to themselves');
    }

    // Validate player existence and get records
    const oldPlayer = await findPlayerByNameFn({ name: oldName });
    const newPlayer = await findPlayerByNameFn({ name: newName });

    if (!oldPlayer) {
      throw new Error(`Player with name "${oldName}" not found`);
    }

    if (!newPlayer) {
      throw new Error(`Player with name "${newName}" not found`);
    }

    if (oldPlayer.id === newPlayer.id) {
      logger.info(
        `Players ${oldName} and ${newName} are already the same record`
      );
      throw new Error('Players are already the same record');
    }

    // Execute all operations in a transaction
    const result = await client.$transaction(async (prisma) => {
      // Update all references to point to the new player
      await updatePlayerReferences(prisma, oldPlayer.id, newPlayer.id);

      // Create alias for the old name
      await createPlayerAlias(prisma, newPlayer.id, oldPlayer.currentName);

      // Delete the old player record
      await prisma.player.delete({
        where: { id: oldPlayer.id },
      });

      return {
        id: newPlayer.id,
        name: newPlayer.currentName,
      };
    });

    logger.info(
      `Successfully linked player records: ${oldName} -> ${newPlayer.currentName}`
    );
    return result;
  } catch (error) {
    logger.error(
      `Failed to link player records ${oldName} -> ${newName}:`,
      error
    );
    throw new Error(
      `Failed to link player records: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

const getPlayerNames = async ({
  playerId,
}: {
  playerId: string;
}): Promise<string[]> => {
  const player = await client.player.findUnique({
    where: { id: playerId },
    include: {
      aliases: true,
    },
  });

  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  return [player.name, ...player.aliases.map((alias) => alias.name)];
};

const getPlayerById = async ({ id }: { id: string }) => {
  return client.player.findUnique({
    where: { id },
    include: {
      aliases: true,
      matches: {
        include: {
          match: {
            include: {
              players: {
                include: {
                  player: true,
                },
              },
              round: {
                include: {
                  tournament: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const addPlayerAlias = async ({
  playerId,
  alias,
}: {
  playerId: string;
  alias: string;
}): Promise<void> => {
  const player = await client.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  await client.playerAlias.create({
    data: {
      playerId,
      name: alias,
    },
  });
};

export const playerData = {
  getAllPlayers,
  createPlayer,
  createPlayers,
  findPlayer,
  createTournamentPlayer,
  findTournamentPlayer,
  updatePlayerName,
  linkPlayerRecords: (params: { oldName: string; newName: string }) => 
    linkPlayerRecords(params, findPlayerByName),
  getPlayerNames,
  findPlayerByName,
  getPlayerById,
  addPlayerAlias,
};

// Export for testing
export { linkPlayerRecords, findPlayerByName };
