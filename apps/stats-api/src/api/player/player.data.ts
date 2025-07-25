import { getDbClient } from '../../database/client';
import logger from '../../utils/logger';

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

  return getDbClient().player.findMany({
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
  return getDbClient().player.create({ data: { name } });
};

const createPlayers = async ({ names }: { names: string[] }) => {
  return getDbClient().player.createMany({ data: names.map((name) => ({ name })) });
};

const findPlayer = async ({ name }: { name: string }) => {
  return getDbClient().player.findFirst({ where: { name } });
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
  return getDbClient().tournament_Player.create({
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
  return getDbClient().tournament_Player.findFirst({
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
  const player = await getDbClient().player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // If the new name is different from the current name
  if (player.name !== newName) {
    // Create a new alias for the old name
    await getDbClient().playerAlias.create({
      data: {
        playerId,
        name: player.name,
      },
    });

    // Update the player's current name
    await getDbClient().player.update({
      where: { id: playerId },
      data: { name: newName },
    });
  }
};

const updatePlayerReferences = async ({
  oldPlayerId,
  newPlayerId,
}: {
  oldPlayerId: string;
  newPlayerId: string;
}): Promise<void> => {
  // Update all Player_Game records
  await getDbClient().player_Game.updateMany({
    where: { playerId: oldPlayerId },
    data: { playerId: newPlayerId },
  });

  // Update all Player_Match records
  await getDbClient().player_Match.updateMany({
    where: { playerId: oldPlayerId },
    data: { playerId: newPlayerId },
  });

  // Update all Tournament_Player records
  await getDbClient().tournament_Player.updateMany({
    where: { playerId: oldPlayerId },
    data: { playerId: newPlayerId },
  });
};

const linkPlayerRecords = async ({
  oldName,
  newName,
}: {
  oldName: string;
  newName: string;
}): Promise<PlayerRecord> => {
  // Find both players
  const oldPlayer = await findPlayerByName({ name: oldName });
  const newPlayer = await findPlayerByName({ name: newName });

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

  // Update all references to point to the new player ID
  await updatePlayerReferences({
    oldPlayerId: oldPlayer.id,
    newPlayerId: newPlayer.id,
  });

  // Create an alias for the old name
  await getDbClient().playerAlias.create({
    data: {
      playerId: newPlayer.id,
      name: oldPlayer.currentName,
    },
  });

  // Delete the old player record since we've moved everything to the new one
  await getDbClient().player.delete({
    where: { id: oldPlayer.id },
  });

  logger.info(`Linked player records: ${oldName} -> ${newPlayer.currentName}`);
  return {
    id: newPlayer.id,
    name: newPlayer.currentName,
  };
};

const getPlayerNames = async ({
  playerId,
}: {
  playerId: string;
}): Promise<string[]> => {
  const player = await getDbClient().player.findUnique({
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
  const player = await getDbClient().player.findFirst({
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
  const alias = await getDbClient().playerAlias.findFirst({
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
  return getDbClient().player.findUnique({
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
  const player = await getDbClient().player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  await getDbClient().playerAlias.create({
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
  updatePlayerReferences,
  linkPlayerRecords,
  getPlayerNames,
  findPlayerByName,
  getPlayerById,
  addPlayerAlias,
};
