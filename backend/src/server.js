import app from './app.js';
import { connectDB } from './config/database.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () => {
      logger.info(`HireFlow ATS Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      logger.info(`Interactive API docs available at http://localhost:${ENV.PORT}/api/docs`);
    });

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
