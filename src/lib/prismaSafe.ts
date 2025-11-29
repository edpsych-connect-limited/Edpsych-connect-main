import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient } from '@prisma/client';

let prisma: ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
  const baseClient = new PrismaClient();

  // Use Prisma Client Extensions (proper replacement for deprecated $use middleware)
  return baseClient.$extends({
    name: 'safe-query-logger',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const before = Date.now();
          try {
            const result = await query(args);
            const after = Date.now();
            const duration = after - before;

            // Log slow queries (taking more than 200ms)
            if (duration > 200) {
              logger.warn(`Slow query (${duration}ms): ${model}.${operation}`);
            }

            return result;
          } catch (error) {
            logger.error(`Query failed: ${model}.${operation}`, {
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          }
        },
      },
    },
  });
}

try {
  // Use a global singleton in dev to avoid hot-reload issues
  if (!(global as any).prismaSafe) {
    (global as any).prismaSafe = createPrismaClient();
  }
  prisma = (global as any).prismaSafe;
} catch (err) {
  logger.error('❌ Prisma client failed to initialize. Database connectivity required for production.', err);
  throw new Error('Critical: Prisma client initialization failed. Check DATABASE_URL and Prisma configuration.');
}

export default prisma;