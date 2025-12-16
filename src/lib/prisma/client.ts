/**
 * Prisma Client (Legacy Compat)
 *
 * This module historically exported its own Prisma singleton.
 * To support BYOD tenant routing, it now re-exports the canonical tenant-aware
 * Prisma client from `@/lib/prisma`.
 */

import { prisma as tenantPrisma } from '@/lib/prisma';

// Mock types for build process
export type PaginationParams = {
  skip?: number;
  take?: number;
  cursor?: any;
  orderBy?: { [key: string]: 'asc' | 'desc' };
};

// Export as both default and named export for backward compatibility
export const prisma = tenantPrisma;
export default tenantPrisma;

// Utility functions for common database operations
export const prismaUtils = {
  /**
   * Handle database connection errors gracefully
   */
  async executeWithErrorHandling<T>(dbOperation: () => Promise<T>): Promise<T> {
    try {
      return await dbOperation();
    } catch (_error) {
      console.error('Database operation error:', _error);
      
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
