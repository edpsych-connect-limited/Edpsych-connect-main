/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '@/lib/prisma';

interface UsageData {
  algorithmId: string;
  versionId: string;
  tenantId: number;
  userId: number;
  executionTime?: number;
  status?: string;
  cost?: number;
}

interface Pagination {
  page?: number;
  limit?: number;
}

/**
 * Service for tracking algorithm usage and calculating royalties
 *
 * This service provides methods for recording algorithm usage,
 * retrieving usage history, generating analytics, and managing
 * royalty calculations for algorithm creators.
 */
class AlgorithmUsageService {
  /**
   * Record a new algorithm usage instance
   *
   * @param {Object} usageData - Data about the algorithm usage
   * @returns {Promise<Object>} - Details of the recorded usage
   */
  static async recordUsage(usageData: UsageData) {
    return await prisma.algorithmUsage.create({
      data: {
        algorithmId: usageData.algorithmId,
        versionId: usageData.versionId,
        tenantId: usageData.tenantId,
        userId: usageData.userId,
        executionTime: usageData.executionTime || 0,
        status: usageData.status || 'success',
        cost: usageData.cost || 0
      }
    });
  }

  /**
   * Get usage history for an algorithm with filtering options
   *
   * @param {string} algorithmId - ID of the algorithm to get usage for
   * @param {Object} [paginationOptions={}] - Pagination options
   * @param {Object} [filterOptions={}] - Additional filter options
   * @returns {Promise<Object>} - Paginated usage history
   */
  static async getUsageHistory(algorithmId: string, paginationOptions: Pagination = {}, _filterOptions = {}) {
    const { page = 1, limit = 20 } = paginationOptions;
    const skip = (page - 1) * (limit || 20);

    const [items, total] = await Promise.all([
      prisma.algorithmUsage.findMany({
        where: { algorithmId },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { tenant: true }
      }),
      prisma.algorithmUsage.count({ where: { algorithmId } })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        institutionName: item.tenant?.name || 'Unknown Institution',
        recordedAt: item.timestamp
      })),
      total,
      page,
      limit
    };
  }

  /**
   * Get usage statistics and analytics for an algorithm
   *
   * @param {string} algorithmId - ID of the algorithm to get stats for
   * @param {Object} [filterOptions={}] - Filter options for the statistics
   * @returns {Promise<Object>} - Comprehensive usage statistics
   */
  static async getUsageStats(algorithmId: string, _filterOptions = {}) {
    const usages = await prisma.algorithmUsage.findMany({
      where: { algorithmId }
    });

    const totalUsage = usages.length;
    const totalRevenue = usages.reduce((sum, u) => sum + u.cost, 0);
    const uniqueTenants = new Set(usages.map(u => u.tenantId)).size;

    return {
      totalUsage,
      totalRevenue,
      activeLicenses: await prisma.algorithmLicense.count({
        where: { algorithmId, status: 'active' }
      }),
      institutions: uniqueTenants,
      usageTrend: 0, // Calculate based on time periods if needed
      revenueTrend: 0,
      licenseTrend: 0,
      institutionTrend: 0,
    };
  }
}

export default AlgorithmUsageService;
