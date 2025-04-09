import { Request, Response } from 'express';
import { getMatch } from './match.service';
import logger from '../../utils/logger';

export const getMatchByIdRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await getMatch({ matchId: id });

    if (!match) {
      return res.status(404).json({ message: `Match with ID ${id} not found` });
    }

    return res.json(match);
  } catch (error) {
    logger.error('Error getting match by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
