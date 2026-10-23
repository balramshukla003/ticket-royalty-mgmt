import { ForbiddenError } from '../core/errors/AppError.js';
import { ROLES } from '../constants/index.js';

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // SUPER_ADMIN passes every check
        if (req.user.role === ROLES.SUPER_ADMIN) return next();

        if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError('You do not have permission to perform this action');
        }
        next();
    };
};

export default authorize;