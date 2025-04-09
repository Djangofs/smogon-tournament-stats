import express from 'express';
import * as path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import { tournamentsRouter } from './api/tournaments/tournaments.route';
import {
  getAllPlayersRoute,
  linkPlayerRecordsRoute,
  getPlayerByIdRoute,
} from './api/player/player.route';
import { getMatchByIdRoute } from './api/match/match.route';
import { requireAdminRole } from './middleware/auth.middleware';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health check route
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to stats-api!' });
});

// API Routes
app.use('/tournaments', tournamentsRouter);

// Public GET routes
app.get('/players', getAllPlayersRoute);
app.get('/players/:id', getPlayerByIdRoute);
app.get('/matches/:id', getMatchByIdRoute);

// Protected routes - require admin role
app.post('/players/link', requireAdminRole, linkPlayerRecordsRoute);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', (error) => logger.error('Server error:', error));
