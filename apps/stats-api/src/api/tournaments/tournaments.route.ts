import { Request, Response } from 'express';
import { getAllTournaments, createTournament } from './tournaments.service';
import { TournamentDTO } from './tournaments.model';
import { tournamentsController } from './tournaments.controller';

export const getAllTournamentsRoute = async (req: Request, res: Response) => {
  const tournaments = await getAllTournamentsController();

  res.send(tournaments);
};

export const getTournamentByIdRoute = async (req: Request, res: Response) => {
  return tournamentsController.getTournamentById(req, res);
};

const getAllTournamentsController = async (): Promise<TournamentDTO[]> => {
  const tournaments = await getAllTournaments();

  return tournaments;
};

export const createTournamentRoute = async (req: Request, res: Response) => {
  const { name, sheetName, sheetId, isOfficial, isTeam, year } = req.body;

  const tournament = await createTournamentController({
    name,
    sheetName,
    sheetId,
    isOfficial,
    isTeam,
    year,
  });

  res.send(tournament);
};

const createTournamentController = async ({
  name,
  sheetName,
  sheetId,
  isOfficial,
  isTeam,
  year,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
}) => {
  const tournament = await createTournament({
    name,
    sheetName,
    sheetId,
    isOfficial,
    isTeam,
    year,
  });

  return tournament;
};
