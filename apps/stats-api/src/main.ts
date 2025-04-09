import express from 'express';
import * as path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import {
  getAllTournamentsRoute,
  createTournamentRoute,
  getTournamentByIdRoute,
} from './api/tournaments/tournaments.route';
import {
  getAllPlayersRoute,
  linkPlayerRecordsRoute,
  getPlayerByIdRoute,
} from './api/player/player.route';
import { getMatchByIdRoute } from './api/match/match.route';
import logger from './utils/logger';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to stats-api!' });
});

app.get('/tournaments/:id', async (req, res) => {
  return getTournamentByIdRoute(req, res);
});

app.get('/tournaments', async (req, res) => {
  return getAllTournamentsRoute(req, res);
});

app.post('/tournament', async (req, res, next) => {
  try {
    await createTournamentRoute(req, res);
  } catch (err) {
    next(err);
  }
});

app.get('/players', async (req, res) => {
  return getAllPlayersRoute(req, res);
});

app.get('/players/:id', async (req, res) => {
  return getPlayerByIdRoute(req, res);
});

app.post('/players/link', async (req, res) => {
  return linkPlayerRecordsRoute(req, res);
});

app.get('/matches/:id', async (req, res) => {
  return getMatchByIdRoute(req, res);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', (error) => logger.error('Server error:', error));
