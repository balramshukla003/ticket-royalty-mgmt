import authService    from '../services/auth.service.js';
import { ok }         from '../core/http/response.js';
import asyncHandler   from '../core/asyncHandler.js';
import { toUserDTO }  from '../dtos/response/auth.dto.js';

const authController = {
  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return ok(res, result, 'Login successful');
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return ok(res, toUserDTO(user), 'User profile fetched');
  }),
};

export default authController;
