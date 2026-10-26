import prisma from '../config/db.js';

const aiLogRepository = {
  create: (data) => prisma.ai_usage_logs.create({ data }),
};

export default aiLogRepository;
