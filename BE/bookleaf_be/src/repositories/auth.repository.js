import prisma from '../config/db.js';

const authRepository = {
  findByEmail: (email) =>
    prisma.users.findUnique({
      where:  { email },
      select: { id: true, email: true, name: true, role: true, is_active: true, password_hash: true, last_login_at: true },
    }),

  findById: (id) =>
    prisma.users.findUnique({
      where:  { id },
      select: { id: true, email: true, name: true, role: true, is_active: true, last_login_at: true },
    }),

  updateLastLogin: (id) =>
    prisma.users.update({ where: { id }, data: { last_login_at: new Date() } }),
};

export default authRepository;
