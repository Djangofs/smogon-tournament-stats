import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const getAllPlayers = async () => {
  return client.player.findMany({
    include: {
      matches: {
        select: {
          winner: true,
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
};
