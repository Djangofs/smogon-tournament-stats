import { createApp } from './app';
import logger from './utils/logger';

/**
 * Production entry point - creates app and starts server
 */
const startServer = () => {
  // Create the Express application (database URL will be read from environment)
  const app = createApp();

  // Start the server
  const port = process.env.PORT || 3333;
  const server = app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}/api`);
  });

  // Handle server errors
  server.on('error', (error) => logger.error('Server error:', error));

  return server;
};

// Start the server in production
startServer();
