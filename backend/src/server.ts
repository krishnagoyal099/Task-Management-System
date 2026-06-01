import app from './app';
import config from './config';
import prisma from './utils/prisma';
import logger from './utils/logger';

const PORT = config.port;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    app.listen(PORT, () => {
      logger.info(
        `🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`,
      );
      logger.info(
        `📖 API Docs available at http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (): Promise<void> => {
  logger.info('Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();