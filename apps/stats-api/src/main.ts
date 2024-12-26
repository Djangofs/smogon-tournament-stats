import express from 'express';
import * as path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import {
  getAllTournamentsRoute,
  createTournamentRoute,
} from './api/tournaments/tournaments.route';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to stats-api!' });
});

app.get('/tournaments', (req, res) => {
  return getAllTournamentsRoute(req, res);
});

app.post('/tournament', (req, res) => {
  return createTournamentRoute(req, res);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
