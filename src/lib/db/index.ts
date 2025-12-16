/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import type { DbClient } from '@/lib/prisma';
import { logger } from "@/lib/logger";
import { prisma as db } from '@/lib/prisma';

export { db };

// Export utility functions for database operations
export async function executeQuery<T>(
  queryFn: (prisma: DbClient) => Promise<T>,
  errorMessage = 'Database query failed'
): Promise<T> {
  try {
    return await queryFn(db);
  } catch (_error) {
    logger.error(`${errorMessage}:`, _error as Error);
    throw new Error(errorMessage);
  }
}

type InteractiveTransactionClient = Parameters<Parameters<DbClient['$transaction']>[0]>[0];

export async function transaction<T>(
  txFn: (tx: InteractiveTransactionClient) => Promise<T>,
  errorMessage = 'Transaction failed'
): Promise<T> {
  try {
    return await db.$transaction(txFn);
  } catch (_error) {
    logger.error(`${errorMessage}:`, _error as Error);
    throw new Error(errorMessage);
  }
}

export default db;
