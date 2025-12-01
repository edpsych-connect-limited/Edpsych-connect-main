import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client instance
 * Used to interact with the database throughout the application
 */

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Type for the extended Prisma client
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

// Create a global variable to store the prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

// Initialize Prisma Client with logging options and extensions
function createPrismaClient() {
  const baseClient = new PrismaClient({
    log: isProduction
      ? ['error'] // Only log errors in production
      : ['query', 'error', 'warn'], // More verbose in development
  });

  // Use Prisma Client Extensions (proper replacement for deprecated $use middleware)
  const extendedClient = baseClient.$extends({
    name: 'query-logger',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const before = Date.now();
          try {
            const result = await query(args);
            const after = Date.now();
            const executionTime = after - before;

            // Log slow queries (taking more than 100ms)
            if (executionTime > 100) {
              logger.warn(`Slow query detected (${executionTime}ms)`, {
                model,
                operation,
                executionTime,
              });
            }

            // Log all database operations in debug mode
            logger.debug(`Prisma query: ${model}.${operation}`, {
              model,
              operation,
              executionTime,
            });

            return result;
          } catch (_error) {
            const after = Date.now();
            const executionTime = after - before;

            logger.error(`Query failed: ${model}.${operation}`, {
              model,
              operation,
              executionTime,
              error: _error instanceof Error ? _error.message : String(_error),
            });

            throw _error;
          }
        },
      },
    },
  });

  return extendedClient;
}

// Export a singleton Prisma client instance
export const prisma = global.prisma || createPrismaClient();

// In development, we want to use a global variable so that the connection
// is maintained across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Safely handles a Prisma operation with proper error handling
 *
 * @param operation - Function that performs a Prisma operation
 * @param errorMessage - Custom error message for logging
 * @returns The result of the operation
 */
export async function prismaOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (_error) {
    const err = _error as Error;
    logger.error(`${errorMessage}: ${err.message}`, {
      stack: err.stack,
    });

    // Rethrow with a more user-friendly message
    throw new Error(`Database operation failed: ${errorMessage}`);
  }
}

/**
 * Initialize database connection and verify connectivity
 * Useful for startup health checks
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection by querying a simple value
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established successfully');
  } catch (_error) {
    const err = _error as Error;
    logger.error(`Failed to connect to database: ${err.message}`, {
      stack: err.stack,
    });
    throw new Error('Database connection failed');
  }
}
