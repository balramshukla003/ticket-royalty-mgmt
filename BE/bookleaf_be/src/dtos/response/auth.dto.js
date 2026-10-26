export const toUserDTO = (user) => ({
  id:          user.id,
  email:       user.email,
  name:        user.name,
  role:        user.role,
  lastLoginAt: user.last_login_at,
});

export const toAuthResponseDTO = (user, token) => ({
  token,
  user: toUserDTO(user),
});
