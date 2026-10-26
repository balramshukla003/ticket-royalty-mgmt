import { AppError } from '../core/errors/AppError.js';
import logger       from '../core/logger.js';
import { env }      from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    code:  err.code,
    path:  req.path,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code:    err.code,
      message: err.message,
    });
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      code:    'CONFLICT',
      message: `${err.meta?.target?.join(', ')} already exists`,
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      code:    'NOT_FOUND',
      message: 'Record not found',
    });
  }

  return res.status(500).json({
    success: false,
    code:    'INTERNAL_ERROR',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

export default errorHandler;
