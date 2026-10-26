import { getIO } from './socket.js';
import logger from '../logger.js';

const safeEmit = (room, event, payload) => {
  try {
    getIO().to(room).emit(event, payload);
  } catch (err) {
    // Socket not initialised yet (e.g., during tests) — fail silently
    logger.debug('Emit skipped (socket not ready)', { event, room });
  }
};

export const emitToUser    = (userId, event, payload) => safeEmit(`user:${userId}`, event, payload);
export const emitToAdmins  = (event, payload)         => safeEmit('admins', event, payload);
export const emitToTicket  = (ticketId, event, payload) => safeEmit(`ticket:${ticketId}`, event, payload);
