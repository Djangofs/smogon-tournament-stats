import { Request, Response, Router } from 'express';
import { getAllTournaments, createTournament } from './tournaments.service';
import { TournamentDTO } from './tournaments.model';
import { tournamentsController } from './tournaments.controller';
import { requireAdminRole } from '../../middleware/auth.middleware';
import logger from '../../utils/logger';
import { TransformSPLMiddleTournamentData } from '../ETL/transformation/spl-middle.transformer';

const router = Router();

// Public routes - no authentication required
router.get('/', getAllTournamentsRoute);
router.get('/:id', getTournamentByIdRoute);

// Protected routes - require admin role
router.post('/', requireAdminRole, createTournamentRoute);

export const tournamentsRouter = router;

// Route handlers
async function getAllTournamentsRoute(req: Request, res: Response) {
  try {
    const tournaments = await getAllTournamentsController();
    res.send(tournaments);
  } catch (error) {
    logger.error('Error fetching tournaments', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tournaments',
    });
  }
}

async function getTournamentByIdRoute(req: Request, res: Response) {
  try {
    return await tournamentsController.getTournamentById(req, res);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tournament',
    });
  }
}

async function createTournamentRoute(req: Request, res: Response) {
  try {
    const {
      name,
      sheetName,
      sheetId,
      isOfficial,
      isTeam,
      year,
      replayPostUrl,
      transformer,
    } = req.body;

    // Validate transformer type
    if (
      transformer &&
      !['legacy', 'modern', 'spl-middle'].includes(transformer)
    ) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid transformer type',
      });
    }

    const tournament = await createTournamentController({
      name,
      sheetName,
      sheetId,
      isOfficial,
      isTeam,
      year,
      replayPostUrl,
      transformer,
    });

    res.status(201).send(tournament);
  } catch (error) {
    logger.error('Error creating tournament', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create tournament',
    });
  }
}

// Controller functions
async function getAllTournamentsController(): Promise<TournamentDTO[]> {
  return await getAllTournaments();
}

async function createTournamentController({
  name,
  sheetName,
  sheetId,
  isOfficial,
  isTeam,
  year,
  replayPostUrl,
  transformer,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
  isOfficial: boolean;
  isTeam: boolean;
  year: number;
  replayPostUrl?: string;
  transformer?: string;
}) {
  return await createTournament({
    name,
    sheetName,
    sheetId,
    isOfficial,
    isTeam,
    year,
    replayPostUrl,
    transformer,
  });
}
