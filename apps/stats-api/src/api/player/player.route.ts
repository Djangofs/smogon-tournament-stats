import { Request, Response } from 'express';
import {
  getAllPlayers,
  linkPlayerRecords,
  getPlayerById,
  addPlayerAlias,
} from './player.service';
import logger from '../../utils/logger';

export const getAllPlayersRoute = async (req: Request, res: Response) => {
  try {
    const { generation, tier, startYear, endYear, stage } = req.query;
    const players = await getAllPlayers({
      generation: generation as string | undefined,
      tier: tier as string | undefined,
      startYear: startYear ? parseInt(startYear as string) : undefined,
      endYear: endYear ? parseInt(endYear as string) : undefined,
      stage: stage as string | undefined,
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

export const getPlayerByIdRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await getPlayerById(id);
    res.json(player);
  } catch (error) {
    logger.error('Error getting player:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get player',
    });
  }
};

export const addPlayerAliasRoute = async (req: Request, res: Response) => {
  try {
    const { playerId, alias } = req.body;

    if (!playerId || !alias) {
      res.status(400).json({
        error: 'Both playerId and alias are required',
      });
      return;
    }

    const result = await addPlayerAlias({ playerId, alias });
    res.json(result);
  } catch (error) {
    logger.error('Error adding player alias:', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to add player alias',
    });
  }
};
