import express from 'express';
import * as path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import {
  getAllTournamentsRoute,
  createTournamentRoute,
} from './api/tournaments/tournaments.route';
import logger from './utils/logger';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to stats-api!' });
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

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', (error) => logger.error('Server error:', error));
