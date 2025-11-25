import { prisma } from '../../lib/prisma';

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
  async recordUsage(usageData) {
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
  async getUsageHistory(algorithmId, paginationOptions = {}, _filterOptions = {}) {
    const { page = 1, limit = 20 } = paginationOptions;
    const skip = (page - 1) * limit;

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
  async getUsageStats(algorithmId, _filterOptions = {}) {
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
      usageOverTime: [],
      revenueComparison: [],
      licenseDistribution: [],
      topInstitutions: [],
      performanceMetrics: [],
      successRate: totalUsage > 0
        ? (usages.filter(u => u.status === 'success').length / totalUsage) * 100
        : 100
    };
  }

  /**
   * Generate a report of algorithm usage for a specific period
   *
   * @param {string} algorithmId - ID of the algorithm to generate report for
   * @param {string} period - Time period for the report (e.g., '30days', 'month', 'year')
   * @param {string} [format='csv'] - Format of the report (csv, pdf, json)
   * @returns {Promise<Object>} - The report data
   */
  async generateUsageReport(algorithmId, period, format = 'csv') {
    // In a real implementation, this would generate a file
    // For now, we'll return a placeholder URL but verify the algorithm exists
    const algorithm = await prisma.algorithm.findUnique({ where: { id: algorithmId } });
    if (!algorithm) throw new Error('Algorithm not found');

    return {
      success: true,
      message: `Report generated for ${period} in ${format} format`,
      downloadUrl: `/api/reports/algorithm/${algorithmId}/${period}.${format}`
    };
  }

  /**
   * Check if a license is valid for algorithm execution
   *
   * @param {string} licenseId - ID of the license to check
   * @param {string} algorithmId - ID of the algorithm to be executed
   * @param {string} institutionId - ID of the institution using the algorithm
   * @returns {Promise<Object>} - Validity status and details
   */
  async checkLicenseValidity(licenseId, algorithmId, institutionId) {
    const license = await prisma.algorithmLicense.findFirst({
      where: {
        id: licenseId,
        algorithmId,
        // tenantId: parseInt(institutionId), // Assuming institutionId matches tenantId
        status: 'active'
      }
    });

    if (!license) {
      return { valid: false, reason: 'License not found or inactive' };
    }

    if (license.expiresAt && new Date() > license.expiresAt) {
      return { valid: false, reason: 'License expired' };
    }

    return {
      valid: true,
      licenseId,
      algorithmId,
      institutionId,
      expiresAt: license.expiresAt,
      usageLimit: null,
      currentUsage: await prisma.algorithmUsage.count({
        where: { algorithmId, tenantId: license.tenantId }
      })
    };
  }

  /**
   * Get royalty information for an algorithm creator
   *
   * @param {string} creatorId - ID of the creator
   * @param {Object} [options={}] - Options for filtering royalty information
   * @returns {Promise<Object>} - Royalty information
   */
  async getCreatorRoyalties(creatorId, _options = {}) {
    const algorithms = await prisma.algorithm.findMany({
      where: { creatorId: parseInt(creatorId) },
      include: { usages: true }
    });

    const totalEarnings = algorithms.reduce((sum, algo) => {
      return sum + algo.usages.reduce((uSum, usage) => uSum + (usage.cost * 0.7), 0); // 70% share
    }, 0);

    return {
      creatorId,
      totalEarnings,
      pendingPayouts: 0, // Need payout tracking table
      paidOut: 0,
      earningsByMonth: [],
      topAlgorithms: []
    };
  }

  /**
   * Get detailed royalty breakdown for a specific algorithm
   *
   * @param {string} algorithmId - ID of the algorithm to get royalty breakdown for
   * @param {Object} [options={}] - Options for filtering royalty information
   * @returns {Promise<Object>} - Detailed royalty breakdown
   */
  async getAlgorithmRoyalties(algorithmId, _options = {}) {
    const usages = await prisma.algorithmUsage.findMany({
      where: { algorithmId }
    });

    const totalRevenue = usages.reduce((sum, u) => sum + u.cost, 0);
    const creatorShare = totalRevenue * 0.7;
    const platformShare = totalRevenue * 0.3;

    return {
      algorithmId,
      totalRevenue,
      creatorShare,
      platformShare,
      revenueByLicense: [],
      revenueByInstitution: []
    };
  }

  /**
   * Execute an algorithm with usage tracking
   *
   * @param {string} algorithmId - ID of the algorithm to execute
   * @param {string} versionId - ID of the algorithm version to execute
   * @param {Object} input - Input data for the algorithm
   * @param {Object} context - Execution context including license and user info
   * @returns {Promise<Object>} - Algorithm execution results
   */
  async executeAlgorithm(algorithmId, versionId, input, context) {
    // Verify license
    const licenseCheck = await this.checkLicenseValidity(
      context.licenseId,
      algorithmId,
      context.institutionId
    );

    if (!licenseCheck.valid) {
      throw new Error(`Invalid license: ${licenseCheck.reason}`);
    }

    // In a real system, this would call the actual algorithm engine
    // For now, we'll simulate execution but record real usage
    const executionTime = Math.floor(Math.random() * 500) + 50; // Simulated time

    await this.recordUsage({
      algorithmId,
      versionId,
      tenantId: parseInt(context.institutionId),
      userId: context.userId ? parseInt(context.userId) : null,
      executionTime,
      status: 'success',
      cost: 0.5 // Fixed cost per execution for now
    });

    return {
      id: `execution-${Date.now()}`,
      algorithmId,
      versionId,
      result: { output: 'Algorithm output placeholder' },
      executionTime,
      status: 'success'
    };
  }
}

const algorithmUsageService = new AlgorithmUsageService();
export default algorithmUsageService;