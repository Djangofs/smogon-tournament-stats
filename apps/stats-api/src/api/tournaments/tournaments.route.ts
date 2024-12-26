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
  const { name } = req.body;

  const tournament = await createTournamentController({ name });

  res.send(tournament);
};

const createTournamentController = async ({ name }: { name: string }) => {
  const tournament = await createTournament({ name });

  return tournament;
};
