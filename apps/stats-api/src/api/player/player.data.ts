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
}: {
  generation?: string;
  tier?: string;
} = {}) => {
  return client.player.findMany({
    include: {
      matches: {
        where: {
          match: {
            ...(generation && { generation }),
            ...(tier && { tier }),
          },
        },
        select: {
          winner: true,
          match: {
            select: {
              generation: true,
              tier: true,
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

const updatePlayerReferences = async ({
  oldPlayerId,
  newPlayerId,
}: {
  oldPlayerId: string;
  newPlayerId: string;
}): Promise<void> => {
  // Update all Player_Game records
  await client.player_Game.updateMany({
    where: { playerId: oldPlayerId },
    data: { playerId: newPlayerId },
  });

  // Update all Player_Match records
  await client.player_Match.updateMany({
    where: { playerId: oldPlayerId },
    data: { playerId: newPlayerId },
  });

  // Update all Tournament_Player records
  await client.tournament_Player.updateMany({
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
  await client.playerAlias.create({
    data: {
      playerId: newPlayer.id,
      name: oldPlayer.currentName,
    },
  });

  // Delete the old player record since we've moved everything to the new one
  await client.player.delete({
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
} | null> => {
  // Try to find by current name
  const player = await client.player.findFirst({
    where: { name },
  });

  if (player) {
    return {
      id: player.id,
      currentName: player.name,
    };
  }

  // Try to find by alias
  const alias = await client.playerAlias.findFirst({
    where: { name },
    include: {
      player: true,
    },
  });

  if (alias) {
    return {
      id: alias.playerId,
      currentName: alias.player.name,
    };
  }

  return null;
};

export const playerData = {
  getAllPlayers,
  createPlayer,
  createPlayers,
  findPlayer,
  createTournamentPlayer,
  findTournamentPlayer,
  updatePlayerName,
  getPlayerNames,
  findPlayerByName,
  linkPlayerRecords,
};
