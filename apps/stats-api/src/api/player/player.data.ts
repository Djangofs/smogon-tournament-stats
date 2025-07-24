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

const linkPlayerRecords = async ({
  oldName,
  newName,
}: {
  oldName: string;
  newName: string;
}): Promise<PlayerRecord> => {
  // Validate input parameters
  if (!oldName?.trim() || !newName?.trim()) {
    throw new Error(
      'Both oldName and newName are required and cannot be empty'
    );
  }

  if (oldName.trim() === newName.trim()) {
    throw new Error('Cannot link a player to themselves');
  }

  // Find both players
  const oldPlayer = await findPlayerByName({ name: oldName });
  const newPlayer = await findPlayerByName({ name: newName });

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
    return {
      id: oldPlayer.id,
      name: oldPlayer.currentName,
    };
  }

  try {
    // Use a transaction to ensure data consistency
    const result = await client.$transaction(async (prisma) => {
      // Update all references to point to the new player ID
      await prisma.player_Game.updateMany({
        where: { playerId: oldPlayer.id },
        data: { playerId: newPlayer.id },
      });

      await prisma.player_Match.updateMany({
        where: { playerId: oldPlayer.id },
        data: { playerId: newPlayer.id },
      });

      await prisma.tournament_Player.updateMany({
        where: { playerId: oldPlayer.id },
        data: { playerId: newPlayer.id },
      });

      // Check if an alias already exists to avoid conflicts
      const existingAlias = await prisma.playerAlias.findFirst({
        where: {
          playerId: newPlayer.id,
          name: oldPlayer.currentName,
        },
      });

      if (!existingAlias) {
        // Create an alias for the old name
        await prisma.playerAlias.create({
          data: {
            playerId: newPlayer.id,
            name: oldPlayer.currentName,
          },
        });
      }

      // Delete the old player record since we've moved everything to the new one
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
  linkPlayerRecords,
  getPlayerNames,
  findPlayerByName,
  getPlayerById,
  addPlayerAlias,
};
