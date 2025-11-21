/**
 * AlgorithmCreator Model
 * Represents a creator of proprietary algorithms in the licensing platform
 * Manages creator profiles, earnings, payouts, and revenue sharing
 */
class AlgorithmCreator {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.profilePicture = data.profilePicture || null;
    this.bio = data.bio || '';
    this.institution = data.institution || '';
    this.department = data.department || '';
    this.title = data.title || '';
    this.specialties = data.specialties || [];
    this.socialLinks = data.socialLinks || {
      website: null,
      linkedin: null,
      twitter: null,
      github: null,
      orcid: null
    };
    this.academicCredentials = data.academicCredentials || [];
    this.publicationLinks = data.publicationLinks || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.status = data.status || 'active'; // active, suspended, closed
    this.verificationStatus = data.verificationStatus || 'pending'; // pending, verified, rejected
    this.verifiedAt = data.verifiedAt || null;
    this.defaultPaymentMethod = data.defaultPaymentMethod || null;
    this.paymentMethods = data.paymentMethods || [];
    this.taxInformation = data.taxInformation || {
      taxId: null,
      country: null,
      taxResidency: null,
      vatNumber: null,
      withholdingRate: null
    };
    this.algorithms = data.algorithms || []; // IDs of algorithms created
    this.earnings = data.earnings || {
      total: 0,
      pending: 0,
      paid: 0,
      lastPayout: null,
      monthly: [],
      yearly: []
    };
    this.payouts = data.payouts || [];
    this.defaultRevenueShare = data.defaultRevenueShare || {
      creator: 70, // percentage
      platform: 30  // percentage
    };
    this.customRevenueShareAgreements = data.customRevenueShareAgreements || [];
    this.licensePreferences = data.licensePreferences || {
      defaultLicenseType: 'subscription', // subscription, per_use, unlimited
      defaultTerms: null,
      restrictedUseCases: []
    };
    this.notifications = data.notifications || {
      sales: true,
      reviews: true,
      payouts: true,
      algorithmUsage: true
    };
  }

  /**
   * Creates a new algorithm creator in the database
   * @param {Object} data - Creator data
   * @returns {Promise<AlgorithmCreator>} Created creator
   */
  static async create(data) {
    // In a real implementation, this would create a record in the database
    console.log('Creating algorithm creator:', data);
    return new AlgorithmCreator(data);
  }

  /**
   * Updates an existing algorithm creator
   * @param {Object} data - Updated creator data
   * @returns {Promise<AlgorithmCreator>} Updated creator
   */
  async update(data) {
    // In a real implementation, this would update a record in the database
    console.log('Updating algorithm creator:', this.id, data);
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Retrieves a creator by ID
   * @param {string} id - Creator ID
   * @returns {Promise<AlgorithmCreator|null>} Retrieved creator or null
   */
  static async getById(id) {
    // In a real implementation, this would fetch from the database
    console.log('Getting algorithm creator by ID:', id);
    return new AlgorithmCreator({ id });
  }

  /**
   * Retrieves a creator by user ID
   * @param {string} userId - User ID
   * @returns {Promise<AlgorithmCreator|null>} Retrieved creator or null
   */
  static async getByUserId(userId) {
    // In a real implementation, this would fetch from the database
    console.log('Getting algorithm creator by user ID:', userId);
    return new AlgorithmCreator({ userId });
  }

  /**
   * Retrieves creators with optional filtering
   * @param {Object} filters - Search and filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} sorting - Sorting options
   * @returns {Promise<Array<AlgorithmCreator>>} List of creators
   */
  static async list(filters = {}, _pagination = {}, _sorting = {}) {
    // In a real implementation, this would query the database
    console.log('Listing algorithm creators with filters:', filters);
    return [new AlgorithmCreator()];
  }

  /**
   * Records revenue from algorithm sales or usage
   * @param {Object} revenueData - Revenue details
   * @returns {Promise<Object>} Updated earnings
   */
  async recordRevenue(revenueData) {
    const {
      algorithmId,
      algorithmName,
      licenseId,
      amount,
      currency = 'GBP',
      transactionId,
      institutionId,
      institutionName,
      timestamp = new Date().toISOString(),
      type = 'license_sale' // license_sale, usage_fee, royalty
    } = revenueData;

    // Determine revenue share percentages (custom agreement or default)
    const revenueShare = this.getRevenueShareForAlgorithm(algorithmId);
    
    // Calculate creator's share
    const creatorAmount = (amount * revenueShare.creator) / 100;
    
    // Create revenue record
    const revenueRecord = {
      id: `rev-${Date.now()}`,
      algorithmId,
      algorithmName,
      licenseId,
      transactionId,
      institutionId,
      institutionName,
      timestamp,
      type,
      amount,
      currency,
      creatorShare: creatorAmount,
      platformShare: amount - creatorAmount,
      revenueShareApplied: revenueShare,
      status: 'pending', // pending, processed, paid
      payoutId: null,
      createdAt: new Date().toISOString()
    };
    
    // Update earnings statistics
    this.earnings.total += creatorAmount;
    this.earnings.pending += creatorAmount;
    
    // Update monthly statistics
    const month = timestamp.substring(0, 7); // YYYY-MM
    let monthlyStats = this.earnings.monthly.find(m => m.month === month);
    if (monthlyStats) {
      monthlyStats.amount += creatorAmount;
    } else {
      this.earnings.monthly.push({ month, amount: creatorAmount });
    }
    
    // Update yearly statistics
    const year = timestamp.substring(0, 4); // YYYY
    let yearlyStats = this.earnings.yearly.find(y => y.year === year);
    if (yearlyStats) {
      yearlyStats.amount += creatorAmount;
    } else {
      this.earnings.yearly.push({ year, amount: creatorAmount });
    }
    
    // In a real implementation, this would store the revenue record
    // and update the creator record in the database
    console.log('Recording revenue for algorithm creator:', this.id, revenueRecord);
    
    return {
      revenueRecord,
      updatedEarnings: this.earnings
    };
  }

  /**
   * Processes a payout to the creator
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} Processed payout
   */
  async processPayout(payoutData = {}) {
    const {
      amount = this.earnings.pending,
      currency = 'GBP',
      paymentMethod = this.defaultPaymentMethod,
      notes = '',
      reference = `payout-${Date.now()}`
    } = payoutData;
    
    // Validate payout amount
    if (amount <= 0 || amount > this.earnings.pending) {
      throw new Error('Invalid payout amount');
    }
    
    // Create payout record
    const payout = {
      id: `pay-${Date.now()}`,
      creatorId: this.id,
      amount,
      currency,
      timestamp: new Date().toISOString(),
      paymentMethod,
      status: 'processing', // processing, completed, failed
      reference,
      notes,
      taxWithheld: 0, // Would be calculated based on tax information
      feesDeducted: 0, // Any processing fees
      netAmount: amount // Gross amount minus taxes and fees
    };
    
    // Update earnings
    this.earnings.pending -= amount;
    this.earnings.paid += amount;
    this.earnings.lastPayout = payout.timestamp;
    
    // Add to payouts history
    this.payouts.push(payout);
    
    // In a real implementation, this would store the payout record
    // and update the creator record in the database
    console.log('Processing payout for algorithm creator:', this.id, payout);
    
    return payout;
  }

  /**
   * Creates a custom revenue share agreement for specific algorithms
   * @param {Object} agreementData - Agreement details
   * @returns {Promise<Object>} Created agreement
   */
  async createCustomRevenueShareAgreement(agreementData) {
    // Validate the revenue share percentages sum to 100
    const { creator, platform } = agreementData.revenueShare;
    if (creator + platform !== 100) {
      throw new Error('Revenue share percentages must sum to 100%');
    }
    
    // Create the agreement
    const agreement = {
      id: `agr-${Date.now()}`,
      algorithmIds: agreementData.algorithmIds || [],
      revenueShare: agreementData.revenueShare,
      startDate: agreementData.startDate || new Date().toISOString(),
      endDate: agreementData.endDate || null,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: agreementData.createdBy || null,
      notes: agreementData.notes || '',
      terms: agreementData.terms || null
    };
    
    // Add to custom agreements
    this.customRevenueShareAgreements.push(agreement);
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would store the agreement
    // and update the creator record in the database
    console.log('Creating custom revenue share agreement:', agreement);
    
    return agreement;
  }

  /**
   * Gets the revenue share percentages for a specific algorithm
   * @param {string} algorithmId - Algorithm ID
   * @returns {Object} Revenue share percentages
   */
  getRevenueShareForAlgorithm(algorithmId) {
    // Check if there's a custom agreement for this algorithm
    const customAgreement = this.customRevenueShareAgreements.find(agreement => {
      return (
        agreement.status === 'active' &&
        agreement.algorithmIds.includes(algorithmId) &&
        (!agreement.endDate || new Date(agreement.endDate) > new Date())
      );
    });
    
    // Return custom or default revenue share
    return customAgreement ? customAgreement.revenueShare : this.defaultRevenueShare;
  }

  /**
   * Gets earnings summary for a specific period
   * @param {string} period - 'all', 'year', 'month', or 'YYYY-MM' or 'YYYY'
   * @returns {Object} Earnings summary
   */
  getEarningsSummary(period = 'all') {
    if (period === 'all') {
      return {
        total: this.earnings.total,
        pending: this.earnings.pending,
        paid: this.earnings.paid
      };
    }
    
    if (period === 'year') {
      // Current year
      const currentYear = new Date().getFullYear().toString();
      return this.getEarningsSummary(currentYear);
    }
    
    if (period === 'month') {
      // Current month
      const date = new Date();
      const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return this.getEarningsSummary(currentMonth);
    }
    
    // Specific year (YYYY)
    if (/^\d{4}$/.test(period)) {
      const yearStats = this.earnings.yearly.find(y => y.year === period) || { amount: 0 };
      return {
        period,
        amount: yearStats.amount
      };
    }
    
    // Specific month (YYYY-MM)
    if (/^\d{4}-\d{2}$/.test(period)) {
      const monthStats = this.earnings.monthly.find(m => m.month === period) || { amount: 0 };
      return {
        period,
        amount: monthStats.amount
      };
    }
    
    return {
      error: 'Invalid period format'
    };
  }

  /**
   * Verifies a creator's profile
   * @param {Object} verificationData - Verification details
   * @returns {Promise<AlgorithmCreator>} Updated creator
   */
  async verify(verificationData = {}) {
    this.verificationStatus = 'verified';
    this.verifiedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the creator record
    console.log('Verifying algorithm creator:', this.id, verificationData);
    
    return this;
  }

  /**
   * Suspends a creator's account
   * @param {Object} suspensionData - Suspension details
   * @returns {Promise<AlgorithmCreator>} Updated creator
   */
  async suspend(suspensionData = {}) {
    this.status = 'suspended';
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the creator record
    console.log('Suspending algorithm creator:', this.id, suspensionData);
    
    return this;
  }

  /**
   * Reactivates a suspended creator's account
   * @returns {Promise<AlgorithmCreator>} Updated creator
   */
  async reactivate() {
    this.status = 'active';
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the creator record
    console.log('Reactivating algorithm creator:', this.id);
    
    return this;
  }

  /**
   * Adds a payment method
   * @param {Object} paymentMethodData - Payment method details
   * @returns {Promise<Object>} Added payment method
   */
  async addPaymentMethod(paymentMethodData) {
    const paymentMethod = {
      id: `pm-${Date.now()}`,
      type: paymentMethodData.type, // bank_account, paypal, etc.
      details: paymentMethodData.details,
      isDefault: paymentMethodData.isDefault || false,
      createdAt: new Date().toISOString()
    };
    
    this.paymentMethods.push(paymentMethod);
    
    // If set as default or first payment method, update default
    if (paymentMethod.isDefault || this.paymentMethods.length === 1) {
      this.defaultPaymentMethod = paymentMethod.id;
      
      // Ensure only one default
      this.paymentMethods.forEach(pm => {
        if (pm.id !== paymentMethod.id) {
          pm.isDefault = false;
        }
      });
    }
    
    this.updatedAt = new Date().toISOString();
    
    // In a real implementation, this would update the creator record
    console.log('Adding payment method for algorithm creator:', this.id, paymentMethod);
    
    return paymentMethod;
  }
}

export default AlgorithmCreator;