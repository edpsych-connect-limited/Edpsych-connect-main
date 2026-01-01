/**
 * Algorithm Service
 * Provides business logic and API for interacting with algorithms, licenses, and creators
 */
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

class AlgorithmService {
  /**
   * Gets algorithm categories
   * @returns {Promise<Array<Object>>} List of categories
   */
  static async getCategories() {
    return [
      { id: 'assessment', name: 'Assessment & Evaluation' },
      { id: 'feedback', name: 'Feedback & Recommendations' },
      { id: 'intervention', name: 'Intervention Strategies' },
      { id: 'prediction', name: 'Predictive Analytics' },
      { id: 'personalization', name: 'Learning Personalization' },
      { id: 'engagement', name: 'Student Engagement' },
      { id: 'analytics', name: 'Learning Analytics' },
      { id: 'research', name: 'Educational Research' }
    ];
  }

  /**
   * Creates a new algorithm
   * @param {Object} algorithmData - Algorithm data
   * @param {string|number} creatorId - ID of the creator
   * @returns {Promise<Object>} Created algorithm
   */
  static async createAlgorithm(algorithmData, creatorId) {
    logger.debug('Creating algorithm:', algorithmData, creatorId);
    return await prisma.algorithm.create({
      data: {
        name: algorithmData.name,
        description: algorithmData.description,
        category: algorithmData.category,
        tags: algorithmData.tags || [],
        price: parseFloat(algorithmData.price) || 0,
        currency: algorithmData.currency || 'GBP',
        creatorId: parseInt(creatorId.toString()),
        versions: {
          create: {
            version: '1.0.0',
            status: 'draft',
            code: algorithmData.code
          }
        }
      }
    });
  }

  /**
   * Gets an algorithm by ID
   * @param {string} id - Algorithm ID
   * @returns {Promise<Object|null>} Algorithm data
   */
  static async getById(id) {
    logger.debug('Getting algorithm by ID:', id);
    const algorithm = await prisma.algorithm.findUnique({
      where: { id },
      include: {
        creator: {
          select: { name: true }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!algorithm) return null;

    return {
      ...algorithm,
      creatorName: algorithm.creator.name,
      currentVersion: algorithm.versions[0]?.version,
      status: algorithm.versions[0]?.status
    };
  }

  // Alias for getById to match routes
  static async getAlgorithmById(id) {
    return this.getById(id);
  }

  /**
   * Searches for algorithms
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results
   */
  static async searchAlgorithms(criteria = {}, pagination = {}) {
    logger.debug('Searching algorithms:', criteria);
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {};
    if (criteria.category) where.category = criteria.category;
    if (criteria.search) {
      where.OR = [
        { name: { contains: criteria.search, mode: 'insensitive' } },
        { description: { contains: criteria.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.algorithm.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: { name: true }
          },
          _count: {
            select: { usages: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.algorithm.count({ where })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        creatorName: item.creator.name,
        totalUsage: item._count.usages,
        averageRating: 0,
        ratingCount: 0
      })),
      total,
      page,
      limit
    };
  }

  static async getPopularAlgorithms(limit = 10) {
      const items = await prisma.algorithm.findMany({
          take: limit,
          include: {
              creator: { select: { name: true } },
              _count: { select: { usages: true } }
          },
          orderBy: {
              usages: { _count: 'desc' }
          }
      });
      return items.map(item => ({
          ...item,
          creatorName: item.creator.name,
          totalUsage: item._count.usages
      }));
  }

  static async getFeaturedAlgorithms(limit = 10) {
      return this.getPopularAlgorithms(limit);
  }

  static async updateAlgorithm(id, data, userId) {
      return await prisma.algorithm.update({
          where: { id },
          data: {
              name: data.name,
              description: data.description,
              category: data.category,
              tags: data.tags,
              price: data.price ? parseFloat(data.price) : undefined,
              currency: data.currency
          }
      });
  }

  static async submitAlgorithmForReview(id, userId) {
      const latestVersion = await prisma.algorithmVersion.findFirst({
          where: { algorithmId: id },
          orderBy: { createdAt: 'desc' }
      });
      if (latestVersion) {
          await prisma.algorithmVersion.update({
              where: { id: latestVersion.id },
              data: { status: 'review' }
          });
      }
      return this.getById(id);
  }

  static async approveAlgorithm(id, reviewerId, comments) {
       const latestVersion = await prisma.algorithmVersion.findFirst({
          where: { algorithmId: id },
          orderBy: { createdAt: 'desc' }
      });
      if (latestVersion) {
          await prisma.algorithmVersion.update({
              where: { id: latestVersion.id },
              data: { status: 'published' }
          });
      }
      return this.getById(id);
  }

  static async rejectAlgorithm(id, reviewerId, reason) {
       const latestVersion = await prisma.algorithmVersion.findFirst({
          where: { algorithmId: id },
          orderBy: { createdAt: 'desc' }
      });
      if (latestVersion) {
          await prisma.algorithmVersion.update({
              where: { id: latestVersion.id },
              data: { status: 'rejected' }
          });
      }
      return this.getById(id);
  }

  static async publishAlgorithm(id, userId) {
       const latestVersion = await prisma.algorithmVersion.findFirst({
          where: { algorithmId: id },
          orderBy: { createdAt: 'desc' }
      });
      if (latestVersion) {
          await prisma.algorithmVersion.update({
              where: { id: latestVersion.id },
              data: { status: 'published' }
          });
      }
      return this.getById(id);
  }

  static async addAlgorithmVersion(id, data, userId) {
      return await prisma.algorithmVersion.create({
          data: {
              algorithmId: id,
              version: data.version,
              code: data.code,
              changelog: data.changelog,
              status: 'draft'
          }
      });
  }

  static async addAlgorithmLicense(id, data, userId) {
      if (data.price) {
          await prisma.algorithm.update({
              where: { id },
              data: { price: parseFloat(data.price) }
          });
      }
      return { message: 'License options updated (Single price model)' };
  }

  /**
   * Purchases a license for an algorithm
   * @param {string} algorithmId - Algorithm ID
   * @param {string} _licenseId - License ID (unused, generated by DB)
   * @param {string|number} institutionId - Institution ID (Tenant ID)
   * @param {string|number} _purchaserId - User ID making the purchase
   * @param {Object} purchaseData - Additional purchase data
   * @returns {Promise<Object>} Created license
   */
  static async purchaseLicense(algorithmId, _licenseId, institutionId, _purchaserId, purchaseData = {}) {
    return await prisma.algorithmLicense.create({
      data: {
        algorithmId,
        tenantId: parseInt(institutionId.toString()),
        type: purchaseData.type || 'subscription',
        status: 'active',
        expiresAt: purchaseData.expiresAt ? new Date(purchaseData.expiresAt) : null
      }
    });
  }
  
  static async getLicenses(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {};
    if (filters.licenseeId) where.tenantId = parseInt(filters.licenseeId.toString());
    if (filters.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      prisma.algorithmLicense.findMany({
        where,
        skip,
        take: limit,
        include: {
          algorithm: {
            select: { name: true, version: true } // Assuming version is on algorithm or we need to join versions
          },
          tenant: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.algorithmLicense.count({ where })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        algorithmName: item.algorithm.name,
        institutionName: item.tenant?.name
      })),
      total,
      page,
      limit
    };
  }

  static async createCreator(data) {
      return { id: 0, name: 'Mock Creator' };
  }
  
  static async updateCreator(id, data, userId) {
      return { id, ...data };
  }
  
  static async getCreatorEarnings(id, period) {
      return { total: 0, period };
  }
  
  static async createCustomRevenueShareAgreement(data) {
      return { ...data, status: 'active' };
  }
  
  static async processCreatorPayout(data) {
      return { status: 'processed' };
  }
  
  static async recordAlgorithmUsage(licenseId, usageData) {
      const license = await prisma.algorithmLicense.findUnique({
          where: { id: licenseId }
      });
      
      if (!license) throw new Error('License not found');
      
      return await prisma.algorithmUsage.create({
          data: {
              algorithmId: license.algorithmId,
              tenantId: license.tenantId,
              executionTime: usageData.executionTime || 0,
              status: usageData.status || 'success',
              cost: usageData.cost || 0
          }
      });
  }
}

export default AlgorithmService;
