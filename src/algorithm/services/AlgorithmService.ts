/**
 * Algorithm Service
 * Provides business logic and API for interacting with algorithms, licenses, and creators
 */
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface AlgorithmData {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  price: string | number;
  currency?: string;
  code: string;
}

interface SearchCriteria {
  categoryId?: string;
  searchTerm?: string;
  featured?: boolean;
  includePrivate?: boolean;
}

interface Pagination {
  page?: number;
  limit?: number;
}

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
  static async createAlgorithm(algorithmData: AlgorithmData, creatorId: string | number) {
    logger.debug('Creating algorithm:', { algorithmData, creatorId });
    return await prisma.algorithm.create({
      data: {
        name: algorithmData.name,
        description: algorithmData.description,
        category: algorithmData.category,
        tags: algorithmData.tags || [],
        price: typeof algorithmData.price === 'string' ? parseFloat(algorithmData.price) : algorithmData.price || 0,
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
  static async getById(id: string) {
    logger.debug('Getting algorithm by ID:', { id });
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
      status: algorithm.versions[0]?.status,
      visibility: 'public' // Default to public as field is missing in DB
    };
  }

  // Alias for getById to match routes
  static async getAlgorithmById(id: string) {
    return this.getById(id);
  }

  /**
   * Searches for algorithms
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results
   */
  static async searchAlgorithms(criteria: SearchCriteria = {}, pagination: Pagination = {}) {
    logger.debug('Searching algorithms:', { criteria });
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * (limit || 20);

    const where: any = {};
    
    if (criteria.categoryId) {
      where.category = criteria.categoryId;
    }
    
    if (criteria.searchTerm) {
      where.OR = [
        { name: { contains: criteria.searchTerm, mode: 'insensitive' } },
        { description: { contains: criteria.searchTerm, mode: 'insensitive' } }
      ];
    }
    
    // if (criteria.featured) {
    //   where.featured = true; // Assuming featured field exists
    // }

    // if (!criteria.includePrivate) {
    //   where.visibility = 'public';
    // }

    const [items, total] = await Promise.all([
      prisma.algorithm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { name: true }
          }
        }
      }),
      prisma.algorithm.count({ where })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        creatorName: item.creator.name
      })),
      total,
      page,
      limit
    };
  }

  static async updateAlgorithm(id: string, data: any, _userId: string) {
    return await prisma.algorithm.update({
      where: { id },
      data
    });
  }

  static async approveAlgorithm(id: string, _userId: string, _comments: string) {
    // Logic to approve algorithm
    // This might involve updating the status of the latest version
    const algorithm = await this.getById(id);
    if (!algorithm) throw new Error('Algorithm not found');
    
    // Mock implementation - update status to approved
    // In reality, we'd update the version status
    return algorithm;
  }

  static async addAlgorithmLicense(id: string, data: any, _userId: string) {
    return await prisma.algorithmLicense.create({
      data: {
        algorithmId: id,
        ...data
      }
    });
  }

  static async publishAlgorithm(id: string, _userId: string) {
    // Logic to publish algorithm
    const algorithm = await this.getById(id);
    if (!algorithm) throw new Error('Algorithm not found');
    return algorithm;
  }

  static async purchaseLicense(id: string, _licenseId: string, _institutionId: string, _userId: string, _purchaseData: any) {
    // Logic to purchase license
    return {
      id: 'mock-license-id',
      algorithmId: id,
      status: 'active'
    };
  }

  static async rejectAlgorithm(id: string, _userId: string, _reason: string) {
    // Logic to reject algorithm
    const algorithm = await this.getById(id);
    if (!algorithm) throw new Error('Algorithm not found');
    return algorithm;
  }

  static async submitAlgorithmForReview(id: string, _userId: string) {
    // Logic to submit for review
    const algorithm = await this.getById(id);
    if (!algorithm) throw new Error('Algorithm not found');
    return algorithm;
  }

  static async addAlgorithmVersion(id: string, data: any, _userId: string) {
    return await prisma.algorithmVersion.create({
      data: {
        algorithmId: id,
        version: data.version,
        code: data.code,
        status: 'draft'
      }
    });
  }

  static async getFeaturedAlgorithms(limit: number = 5) {
    return await this.searchAlgorithms({ featured: true }, { limit });
  }

  static async getPopularAlgorithms(limit: number = 5) {
    // Mock implementation - just return recent ones
    return await this.searchAlgorithms({}, { limit });
  }

  static async getLicenses(filters: any = {}, pagination: Pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * (limit || 20);
    
    const [items, total] = await Promise.all([
      prisma.algorithmLicense.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          algorithm: true
        }
      }),
      prisma.algorithmLicense.count({ where: filters })
    ]);

    return {
      items,
      total,
      page,
      limit
    };
  }
}

export default AlgorithmService;
