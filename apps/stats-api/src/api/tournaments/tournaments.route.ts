import { Request, Response } from 'express';
import { getAllTournaments, createTournament } from './tournaments.service';
import { TournamentDTO } from './tournaments.model';

export const getAllTournamentsRoute = async (req: Request, res: Response) => {
  const tournaments = await getAllTournamentsController();

  res.send(tournaments);
};

const getAllTournamentsController = async (): Promise<TournamentDTO[]> => {
  const tournaments = await getAllTournaments();

  return tournaments;
};

export const createTournamentRoute = async (req: Request, res: Response) => {
  const { name, sheetName, sheetId, isOfficial, isTeam } = req.body;

  const tournament = await createTournamentController({
    name,
    sheetName,
    sheetId,
    isOfficial,
    isTeam,
  });

  res.send(tournament);
};

const createTournamentController = async ({
  name,
  sheetName,
  sheetId,
  isOfficial,
  isTeam,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial: boolean;
  isTeam: boolean;
}) => {
  const tournament = await createTournament({
    name,
    sheetName,
    sheetId,
    isOfficial,
    isTeam,
  });

  return tournament;
};
