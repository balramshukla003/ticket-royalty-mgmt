import authRepository        from '../repositories/auth.repository.js';
import { comparePassword }   from '../core/security/password.js';
import { signAccessToken }   from '../core/security/jwt.js';
import { toAuthResponseDTO } from '../dtos/response/auth.dto.js';
import { UnauthorizedError } from '../core/errors/AppError.js';

const authService = {
  login: async ({ email, password }) => {
    const user = await authRepository.findByEmail(email);

    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.is_active) throw new UnauthorizedError('Your account has been deactivated. Please contact support.');

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw new UnauthorizedError('Invalid email or password');

    authRepository.updateLastLogin(user.id).catch(() => {});

    const token = signAccessToken({ userId: user.id, role: user.role });
    return toAuthResponseDTO(user, token);
  },

  getMe: (userId) => authRepository.findById(userId),
};

export default authService;
