/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from "@/lib/logger";

// Ensure we have a single instance of PrismaClient throughout the app
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Export utility functions for database operations
export async function executeQuery<T>(
  queryFn: (prisma: PrismaClient) => Promise<T>,
  errorMessage = 'Database query failed'
): Promise<T> {
  try {
    return await queryFn(db);
  } catch (error) {
    logger.error(`${errorMessage}:`, error as Error);
    throw new Error(errorMessage);
  }
}

export async function transaction<T>(
  txFn: (tx: Prisma.TransactionClient) => Promise<T>,
  errorMessage = 'Transaction failed'
): Promise<T> {
  try {
    return await db.$transaction(txFn);
  } catch (error) {
    logger.error(`${errorMessage}:`, error as Error);
    throw new Error(errorMessage);
  }
}

export default db;