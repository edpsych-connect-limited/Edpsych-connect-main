/**
 * AlgorithmLicense Model
 * Represents a license acquisition by an institution or user for a specific algorithm
 */
import { logger } from '@/lib/logger';

class AlgorithmLicense {
  constructor(data = {}) {
    this.id = data.id || null;
    this.algorithmId = data.algorithmId || null;
    this.algorithmName = data.algorithmName || '';
    this.licenseId = data.licenseId || null;
    this.licenseName = data.licenseName || '';
    this.licenseeId = data.licenseeId || null; // Institution ID
    this.licenseeName = data.licenseeName || ''; // Institution name
    this.departmentId = data.departmentId || null; // Optional department
    this.departmentName = data.departmentName || '';
    this.purchaserId = data.purchaserId || null; // User ID who purchased
    this.purchaserName = data.purchaserName || '';
    this.startDate = data.startDate || new Date().toISOString();
    this.endDate = data.endDate || null;
    this.status = data.status || 'active'; // active, expired, cancelled, suspended
    this.price = data.price || 0;
    this.currency = data.currency || 'GBP';
    this.billingCycle = data.billingCycle || 'monthly';
    this.autoRenew = data.autoRenew !== undefined ? data.autoRenew : true;
    this.paymentMethod = data.paymentMethod || null;
    this.usageLimit = data.usageLimit || null; // Max number of uses
    this.usageCount = data.usageCount || 0; // Current number of uses
    this.concurrentLimit = data.concurrentLimit || null; // Max concurrent uses
    this.currentConcurrentUses = data.currentConcurrentUses || 0;
    this.lastUsedAt = data.lastUsedAt || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.invoiceId = data.invoiceId || null;
    this.paymentStatus = data.paymentStatus || 'paid'; // paid, pending, failed
    this.renewalDate = data.renewalDate || null;
    this.renewalPrice = data.renewalPrice || null;
    this.cancellationDate = data.cancellationDate || null;
    this.cancellationReason = data.cancellationReason || null;
    this.accessKeys = data.accessKeys || [];
    this.restrictions = data.restrictions || {
      ipRanges: [],
      domains: [],
      userEmails: [],
      maxUsers: null
    };
    this.usage = data.usage || {
      daily: [],
      monthly: [],
      total: 0
    };
    this.revenueShare = data.revenueShare || {
      creator: 70, // percentage
      platform: 30  // percentage
    };
  }

  /**
   * Creates a new algorithm license in the database
   * @param {Object} data - License data
   * @returns {Promise<AlgorithmLicense>} Created license
   */
  static async create(data) {
    // In a real implementation, this would create a record in the database
    logger.debug('Creating algorithm license:', data);
    return new AlgorithmLicense(data);
  }

  /**
   * Updates an existing algorithm license
   * @param {Object} data - Updated license data
   * @returns {Promise<AlgorithmLicense>} Updated license
   */
  async update(data) {
    // In a real implementation, this would update a record in the database
    logger.debug('Updating algorithm license:', this.id, data);
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Retrieves a license by ID
   * @param {string} id - License ID
   * @returns {Promise<AlgorithmLicense|null>} Retrieved license or null
   */
  static async getById(id) {
    // In a real implementation, this would fetch from the database
    logger.debug('Getting algorithm license by ID:', id);
    return new AlgorithmLicense({ id });
  }

  /**
   * Retrieves licenses with optional filtering
   * @param {Object} filters - Search and filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} sorting - Sorting options
   * @returns {Promise<Array<AlgorithmLicense>>} List of licenses
   */
  static async list(filters = {}, _pagination = {}, _sorting = {}) {
    // In a real implementation, this would query the database
    logger.debug('Listing algorithm licenses with filters:', filters);
    return [new AlgorithmLicense()];
  }

  /**
   * Checks if the license is valid and can be used
   * @returns {boolean} Whether the license is valid
   */
  isValid() {
    // Check if license is active
    if (this.status !== 'active') {
      return false;
    }
    
    // Check if license has expired
    if (this.endDate && new Date(this.endDate) < new Date()) {
      return false;
    }
    
    // Check if usage limit has been reached
    if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
      return false;
    }
    
    // Check if payment status is valid
    if (this.paymentStatus !== 'paid') {
      return false;
    }
    
    return true;
  }

  /**
   * Records usage of the licensed algorithm
   * @param {Object} usageData - Details about the usage
   * @returns {Promise<Object>} Updated usage stats
   */
  async recordUsage(usageData = {}) {
    // Check if license is valid
    if (!this.isValid()) {
      throw new Error('License is not valid for use');
    }
    
    // Check concurrent usage limit
    if (
      this.concurrentLimit !== null && 
      this.currentConcurrentUses >= this.concurrentLimit
    ) {
      throw new Error('Concurrent usage limit reached');
    }
    
    // Record the usage
    const now = new Date();
    const usage = {
      id: `usage-${Date.now()}`,
      licenseId: this.id,
      algorithmId: this.algorithmId,
      timestamp: now.toISOString(),
      userId: usageData.userId || null,
      userName: usageData.userName || null,
      ip: usageData.ip || null,
      inputSize: usageData.inputSize || null,
      outputSize: usageData.outputSize || null,
      executionTime: usageData.executionTime || null,
      status: usageData.status || 'success',
      errorMessage: usageData.errorMessage || null,
      cost: usageData.cost || 0,
    };
    
    // Update license usage counters
    this.usageCount += 1;
    this.lastUsedAt = now.toISOString();
    this.updatedAt = now.toISOString();
    
    // Update daily and monthly usage statistics
    const today = now.toISOString().split('T')[0];
    const month = today.substring(0, 7); // YYYY-MM
    
    // Update daily stats
    let dailyStats = this.usage.daily.find(day => day.date === today);
    if (dailyStats) {
      dailyStats.count += 1;
    } else {
      this.usage.daily.push({ date: today, count: 1 });
    }
    
    // Update monthly stats
    let monthlyStats = this.usage.monthly.find(m => m.month === month);
    if (monthlyStats) {
      monthlyStats.count += 1;
    } else {
      this.usage.monthly.push({ month, count: 1 });
    }
    
    // Update total usage
    this.usage.total += 1;
    
    // In a real implementation, this would store the usage record
    // and update the license record in the database
    logger.debug('Recording algorithm usage:', usage);
    
    return {
      usageRecord: usage,
      licenseUsage: this.usage
    };
  }

  /**
   * Renews the license
   * @param {Object} renewalData - Renewal details
   * @returns {Promise<AlgorithmLicense>} Updated license
   */
  async renew(renewalData = {}) {
    // Calculate new end date based on billing cycle
    const startDate = renewalData.startDate || new Date().toISOString();
    let endDate = null;
    
    if (renewalData.endDate) {
      endDate = renewalData.endDate;
    } else {
      const start = new Date(startDate);
      switch (this.billingCycle) {
        case 'monthly':
          endDate = new Date(start.setMonth(start.getMonth() + 1)).toISOString();
          break;
        case 'quarterly':
          endDate = new Date(start.setMonth(start.getMonth() + 3)).toISOString();
          break;
        case 'annually':
          endDate = new Date(start.setFullYear(start.getFullYear() + 1)).toISOString();
          break;
        default:
          endDate = new Date(start.setMonth(start.getMonth() + 1)).toISOString();
      }
    }
    
    // Update license details
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = 'active';
    this.renewalDate = endDate;
    this.price = renewalData.price || this.price;
    this.updatedAt = new Date().toISOString();
    
    // Reset usage counters if specified
    if (renewalData.resetUsage) {
      this.usageCount = 0;
    }
    
    // In a real implementation, this would update the license record
    // and create a renewal record in the database
    logger.debug('Renewing algorithm license:', this.id, { startDate, endDate });
    
    return this;
  }

  /**
   * Cancels the license
   * @param {Object} cancellationData - Cancellation details
   * @returns {Promise<AlgorithmLicense>} Updated license
   */
  async cancel(cancellationData = {}) {
    this.status = 'cancelled';
    this.cancellationDate = cancellationData.date || new Date().toISOString();
    this.cancellationReason = cancellationData.reason || '';
    this.autoRenew = false;
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the license record
    // and create a cancellation record in the database
    logger.debug('Cancelling algorithm license:', this.id, {
      date: this.cancellationDate,
      reason: this.cancellationReason
    });
    
    return this;
  }

  /**
   * Suspends the license
   * @param {Object} suspensionData - Suspension details
   * @returns {Promise<AlgorithmLicense>} Updated license
   */
  async suspend(suspensionData = {}) {
    this.status = 'suspended';
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the license record
    // and create a suspension record in the database
    logger.debug('Suspending algorithm license:', this.id, suspensionData);
    
    return this;
  }

  /**
   * Reactivates a suspended or cancelled license
   * @returns {Promise<AlgorithmLicense>} Updated license
   */
  async reactivate() {
    this.status = 'active';
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the license record
    logger.debug('Reactivating algorithm license:', this.id);
    
    return this;
  }

  /**
   * Generates a new access key for the license
   * @returns {Promise<string>} Generated access key
   */
  async generateAccessKey() {
    // Generate a random access key
    const key = `alg_${Math.random().toString(36).substring(2, 15)}`;
    
    this.accessKeys.push({
      key,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      active: true
    });
    
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the license record
    logger.debug('Generating access key for algorithm license:', this.id, key);
    
    return key;
  }

  /**
   * Revokes an access key
   * @param {string} key - Access key to revoke
   * @returns {Promise<boolean>} Success status
   */
  async revokeAccessKey(key) {
    const keyIndex = this.accessKeys.findIndex(k => k.key === key);
    
    if (keyIndex >= 0) {
      this.accessKeys[keyIndex].active = false;
      this.updatedAt = new Date().toISOString();
      
      // In a real implementation, this would update the license record
      logger.debug('Revoking access key for algorithm license:', this.id, key);
      
      return true;
    }
    
    return false;
  }
}

export default AlgorithmLicense;