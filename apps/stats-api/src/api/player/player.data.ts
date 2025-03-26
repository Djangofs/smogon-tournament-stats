import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

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

export const playerData = {
  createPlayer,
  createPlayers,
  findPlayer,
  createTournamentPlayer,
  findTournamentPlayer,
};
