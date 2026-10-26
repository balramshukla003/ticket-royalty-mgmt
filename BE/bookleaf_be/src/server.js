BigInt.prototype.toJSON = function () {
  return this.toString()
}

import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/db.js';
import logger from './core/logger.js';
import { initSocket } from './core/realtime/socket.js';

const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
initSocket(server);

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health: http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err.message });
  server.close(() => process.exit(1));
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

start();
