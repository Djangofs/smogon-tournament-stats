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
  const { name, sheetName, sheetId } = req.body;

  const tournament = await createTournamentController({
    name,
    sheetName,
    sheetId,
  });

  res.send(tournament);
};

const createTournamentController = async ({
  name,
  sheetName,
  sheetId,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
}) => {
  const tournament = await createTournament({ name, sheetName, sheetId });

  return tournament;
};
