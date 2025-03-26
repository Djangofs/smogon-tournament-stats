import { Request, Response } from 'express';
import { getAllPlayers } from './player.service';

export const getAllPlayersRoute = async (req: Request, res: Response) => {
  const players = await getAllPlayers();
  res.send(players);
};
