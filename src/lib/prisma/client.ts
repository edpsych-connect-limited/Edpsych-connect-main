import { logger } from "@/lib/logger";
/**
 * Prisma Client Singleton
 * This file ensures we have a single Prisma Client instance across the application
 * This implementation is a mock for the build process
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Mock types for build process
export type PaginationParams = {
  skip?: number;
  take?: number;
  cursor?: any;
  orderBy?: { [key: string]: 'asc' | 'desc' };
};

// Add logging in development
const options: Prisma.PrismaClientOptions =
  process.env.NODE_ENV === 'development'
    ? {
        log: [
          { emit: 'event', level: 'query' },
        ],
      }
    : {};

// PrismaClient singleton instance
let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient(options);
} else {
  // For development, reuse the same client instance to avoid multiple connections
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(options);
  }
  prismaClient = (global as any).prisma;
}

// Add query logging in development
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error - Prisma client events are not properly typed in production builds
  prismaClient.$on('query', (e: any) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

// Export as both default and named export for backward compatibility
export const prisma = prismaClient;
export default prismaClient;

// Utility functions for common database operations
export const prismaUtils = {
  /**
   * Handle database connection errors gracefully
   */
  async executeWithErrorHandling<T>(dbOperation: () => Promise<T>): Promise<T> {
    try {
      return await dbOperation();
    } catch (_error) {
      console._error('Database operation _error:', _error);
      
      // Check for specific Prisma errors and throw appropriate errors
      if ((_error as any).code === 'P2025') {
        throw new Error('Record not found');
      }
      
      throw _error;
    }
  },

  /**
   * Create pagination parameters for Prisma queries
   */
  createPaginationParams(page = 1, pageSize = 10): PaginationParams {
    return {
      skip: (page - 1) * pageSize,
      take: pageSize,
    };
  },

  /**
   * Format date fields for consistent JSON serialization
   */
  formatDates<T extends Record<string, any>>(record: T): Record<string, any> {
    // Create a mutable copy we can modify
    const result: Record<string, any> = { ...record };
    
    Object.keys(result).forEach(key => {
      if (result[key] instanceof Date) {
        result[key] = result[key].toISOString();
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.formatDates(result[key]);
      }
    });
    
    // Cast back to the original type
    return result as T;
  }
};