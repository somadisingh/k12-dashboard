import { PrismaClient } from '@prisma/client';

// Singleton Prisma client (avoids exhausting DB connections during dev hot-reload)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
