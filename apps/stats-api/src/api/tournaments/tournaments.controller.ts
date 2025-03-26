import { Request, Response } from 'express';
import { getAllTournaments, createTournament } from './tournaments.service';
import { CreateTournamentRequest } from './tournaments.model';
import logger from '../../utils/logger';

export const tournamentsController = {
  getAllTournaments: async (req: Request, res: Response) => {
    try {
      const tournaments = await getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      logger.error('Error getting tournaments:', error);
      res.status(500).json({ error: 'Failed to get tournaments' });
    }
  },

  createTournament: async (req: Request, res: Response) => {
    try {
      const { name, sheetName, sheetId, isOfficial, isTeam } =
        req.body as CreateTournamentRequest;
      const tournament = await createTournament({
        name,
        sheetName,
        sheetId,
        isOfficial,
        isTeam,
      });
      res.status(201).json(tournament);
    } catch (error) {
      logger.error('Error creating tournament:', error);
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  },
};
