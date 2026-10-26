import { verifyToken }       from '../core/security/jwt.js';
import { UnauthorizedError } from '../core/errors/AppError.js';
import prisma                from '../config/db.js';
import asyncHandler          from '../core/asyncHandler.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token   = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  const user = await prisma.users.findUnique({
    where:  { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true, is_active: true },
  });

  if (!user || !user.is_active) {
    throw new UnauthorizedError('Account not found or deactivated');
  }

  req.user = user;
  next();
});

export default authenticate;
