import { PrismaClient } from '../../generated/prisma/index.js';
import { env } from './env.js';

const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;