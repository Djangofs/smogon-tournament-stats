import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';

export const getAllTournaments = async (): Promise<TournamentDatabase[]> => {
  return tournamentsData.getAllTournaments();
};

export const createTournament = async ({ name }: { name: string }) => {
  return tournamentsData.createTournament({ name });
};
