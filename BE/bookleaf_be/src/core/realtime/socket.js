import { Server } from 'socket.io';
import { verifyToken } from '../security/jwt.js';
import { ROLES } from '../../constants/index.js';
import logger from '../logger.js';
import { env } from '../../config/env.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // JWT authentication on every socket connection
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('No token provided'));

      const decoded    = verifyToken(token);
      socket.userId    = decoded.userId;
      socket.userRole  = decoded.role;
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Auto-join personal room and role room
    socket.join(`user:${socket.userId}`);

    if (socket.userRole === ROLES.ADMIN || socket.userRole === ROLES.SUPER_ADMIN) {
      socket.join('admins');
    }

    logger.debug('Socket connected', { userId: socket.userId, role: socket.userRole });

    // Client requests to watch a specific ticket
    socket.on('ticket:join', ({ ticketId }) => {
      if (ticketId) socket.join(`ticket:${ticketId}`);
    });

    socket.on('ticket:leave', ({ ticketId }) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId: socket.userId });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
};
