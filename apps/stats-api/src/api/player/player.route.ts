import { Request, Response } from 'express';
import { getAllPlayers, linkPlayerRecords } from './player.service';
import logger from '../../utils/logger';

export const getAllPlayersRoute = async (req: Request, res: Response) => {
  try {
    const { generation, tier } = req.query;
    const players = await getAllPlayers({
      generation: generation as string | undefined,
      tier: tier as string | undefined,
    });
    res.send(players);
  } catch (error) {
    logger.error('Error getting players:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get players',
    });
  }
};

export const linkPlayerRecordsRoute = async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      res.status(400).json({
        error: 'Both oldName and newName are required',
      });
      return;
    }

    const result = await linkPlayerRecords({ oldName, newName });
    res.json(result);
  } catch (error) {
    logger.error('Error linking player records:', error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to link player records',
    });
  }
};
