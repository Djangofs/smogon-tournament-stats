import express from 'express';
import * as path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

import { tournamentsRouter } from './api/tournaments/tournaments.route';
import {
  getAllPlayersRoute,
  linkPlayerRecordsRoute,
  getPlayerByIdRoute,
  addPlayerAliasRoute,
} from './api/player/player.route';
import { getMatchByIdRoute } from './api/match/match.route';
import { requireAdminRole } from './middleware/auth.middleware';
import { DatabaseManager } from './database/client';
import logger from './utils/logger';

/**
 * Configure database connection with priority order
 */
const configureDatabaseConnection = (databaseUrl?: string) => {
  const finalDatabaseUrl =
    databaseUrl || // 1. Explicit parameter (tests)
    process.env.TEST_DATABASE_URL || // 2. Test environment
    process.env.DATABASE_URL_OVERRIDE || // 3. Runtime override
    process.env.DATABASE_URL; // 4. Default config

  if (databaseUrl) {
    logger.info('Using provided database configuration');
    DatabaseManager.setDatabaseUrl(finalDatabaseUrl);
  } else if (process.env.TEST_DATABASE_URL) {
    logger.info('Using test database configuration');
    DatabaseManager.setDatabaseUrl(finalDatabaseUrl);
  } else if (process.env.DATABASE_URL_OVERRIDE) {
    logger.info('Using overridden database configuration');
    DatabaseManager.setDatabaseUrl(finalDatabaseUrl);
  } else {
    logger.info('Using default database configuration');
  }
};

/**
 * Create and configure Express application
 * @param databaseUrl Optional database URL for dependency injection (useful for testing)
 * @returns Configured Express application instance
 */
export const createApp = (databaseUrl?: string): express.Application => {
  // Configure database before creating app
  configureDatabaseConnection(databaseUrl);

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
  app.post('/players/:id/alias', requireAdminRole, addPlayerAliasRoute);

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

  return app;
};
