/**
 * Algorithm API Routes
 * Provides endpoints for interacting with algorithms, licenses, and creators
 */
import express from 'express';
import AlgorithmService from '../services/AlgorithmService';
import { requireAuth, requireAdmin, requireReviewer } from '../../auth/middleware';

const router = express.Router();

// ----- Algorithm Routes -----

/**
 * Get all algorithms (with optional filtering)
 * GET /api/algorithms
 */
router.get('/', async (req, res) => {
  try {
    const { category, query, featured, limit, page } = req.query;
    
    // Build search criteria
    const criteria = {};
    if (category) criteria.categoryId = category;
    if (query) criteria.searchTerm = query;
    if (featured) criteria.featured = featured === 'true';
    
    // Build pagination
    const pagination = {
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1
    };
    
    // Include private algorithms if authenticated
    if (req.user) {
      criteria.includePrivate = true;
    }
    
    const algorithms = await AlgorithmService.searchAlgorithms(criteria, pagination);
    res.json(algorithms);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get popular algorithms
 * GET /api/algorithms/popular
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const algorithms = await AlgorithmService.getPopularAlgorithms(limit);
    res.json(algorithms);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get featured algorithms
 * GET /api/algorithms/featured
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const algorithms = await AlgorithmService.getFeaturedAlgorithms(limit);
    res.json(algorithms);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single algorithm by ID
 * GET /api/algorithms/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const algorithm = await AlgorithmService.getAlgorithmById(req.params.id);
    
    if (!algorithm) {
      return res.status(404).json({ error: 'Algorithm not found' });
    }
    
    // Check if private algorithm is accessible
    if (algorithm.visibility === 'private' && (!req.user || (req.user.id !== algorithm.creatorId && !req.user.isAdmin))) {
      return res.status(403).json({ error: 'Unauthorized to view this algorithm' });
    }
    
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a new algorithm
 * POST /api/algorithms
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const algorithmData = req.body;
    const creatorId = req.user.creatorId;
    
    if (!creatorId) {
      return res.status(403).json({ error: 'User is not registered as a creator' });
    }
    
    const algorithm = await AlgorithmService.createAlgorithm(algorithmData, creatorId);
    res.status(201).json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update an algorithm
 * PUT /api/algorithms/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const updatedData = req.body;
    const userId = req.user.id;
    
    // Admin override for admins
    if (req.user.isAdmin) {
      updatedData.isAdminOverride = true;
    }
    
    const algorithm = await AlgorithmService.updateAlgorithm(algorithmId, updatedData, userId);
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Submit algorithm for review
 * POST /api/algorithms/:id/submit-review
 */
router.post('/:id/submit-review', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const userId = req.user.id;
    
    const algorithm = await AlgorithmService.submitAlgorithmForReview(algorithmId, userId);
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Approve algorithm after review
 * POST /api/algorithms/:id/approve
 */
router.post('/:id/approve', requireReviewer, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const reviewerId = req.user.id;
    const { comments } = req.body;
    
    const algorithm = await AlgorithmService.approveAlgorithm(algorithmId, reviewerId, comments);
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reject algorithm after review
 * POST /api/algorithms/:id/reject
 */
router.post('/:id/reject', requireReviewer, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const reviewerId = req.user.id;
    const { reason } = req.body;
    
    const algorithm = await AlgorithmService.rejectAlgorithm(algorithmId, reviewerId, reason);
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Publish algorithm
 * POST /api/algorithms/:id/publish
 */
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const userId = req.user.id;
    
    const algorithm = await AlgorithmService.publishAlgorithm(algorithmId, userId);
    res.json(algorithm);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add algorithm version
 * POST /api/algorithms/:id/versions
 */
router.post('/:id/versions', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const versionData = req.body;
    const userId = req.user.id;
    
    const version = await AlgorithmService.addAlgorithmVersion(algorithmId, versionData, userId);
    res.status(201).json(version);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add license option to algorithm
 * POST /api/algorithms/:id/licenses
 */
router.post('/:id/licenses', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const licenseData = req.body;
    const userId = req.user.id;
    
    // Admin override for admins
    if (req.user.isAdmin) {
      licenseData.isAdminOverride = true;
    }
    
    const license = await AlgorithmService.addAlgorithmLicense(algorithmId, licenseData, userId);
    res.status(201).json(license);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

// ----- License Routes -----

/**
 * Purchase algorithm license
 * POST /api/algorithms/:id/purchase
 */
router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const algorithmId = req.params.id;
    const { licenseId, institutionId, departmentId } = req.body;
    const purchaserId = req.user.id;
    
    // Additional purchase data
    const purchaseData = {
      purchaserName: req.user.name,
      institutionName: req.body.institutionName,
      departmentId,
      departmentName: req.body.departmentName
    };
    
    const license = await AlgorithmService.purchaseLicense(
      algorithmId, 
      licenseId, 
      institutionId, 
      purchaserId, 
      purchaseData
    );
    
    res.status(201).json(license);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get licenses for institution
 * GET /api/licenses
 */
router.get('/licenses', requireAuth, async (req, res) => {
  try {
    const { institutionId, status, sort, limit, page } = req.query;
    
    // Ensure user has permission to view institution licenses
    if (!req.user.institutionId === institutionId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view these licenses' });
    }
    
    // Build filters
    const filters = { licenseeId: institutionId };
    if (status) filters.status = status;
    
    // Build pagination
    const pagination = {
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1
    };
    
    // Build sorting
    const sorting = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sorting.sortBy = field;
      sorting.sortDirection = direction || 'asc';
    }
    
    const licenses = await AlgorithmLicense.list(filters, pagination, sorting);
    res.json(licenses);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get license by ID
 * GET /api/licenses/:id
 */
router.get('/licenses/:id', requireAuth, async (req, res) => {
  try {
    const licenseId = req.params.id;
    const license = await AlgorithmLicense.getById(licenseId);
    
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    // Ensure user has permission to view this license
    if (license.licenseeId !== req.user.institutionId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view this license' });
    }
    
    res.json(license);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Record algorithm usage
 * POST /api/licenses/:id/usage
 */
router.post('/licenses/:id/usage', requireAuth, async (req, res) => {
  try {
    const licenseId = req.params.id;
    const usageData = {
      ...req.body,
      userId: req.user.id,
      userName: req.user.name,
      ip: req.ip
    };
    
    const usageResult = await AlgorithmService.recordAlgorithmUsage(licenseId, usageData);
    res.json(usageResult);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Renew license
 * POST /api/licenses/:id/renew
 */
router.post('/licenses/:id/renew', requireAuth, async (req, res) => {
  try {
    const licenseId = req.params.id;
    const license = await AlgorithmLicense.getById(licenseId);
    
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    // Ensure user has permission to renew this license
    if (license.licenseeId !== req.user.institutionId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to renew this license' });
    }
    
    const renewalData = req.body;
    const renewedLicense = await license.renew(renewalData);
    
    res.json(renewedLicense);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cancel license
 * POST /api/licenses/:id/cancel
 */
router.post('/licenses/:id/cancel', requireAuth, async (req, res) => {
  try {
    const licenseId = req.params.id;
    const license = await AlgorithmLicense.getById(licenseId);
    
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    // Ensure user has permission to cancel this license
    if (license.licenseeId !== req.user.institutionId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to cancel this license' });
    }
    
    const cancellationData = req.body;
    const cancelledLicense = await license.cancel(cancellationData);
    
    res.json(cancelledLicense);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

// ----- Creator Routes -----

/**
 * Get creators
 * GET /api/creators
 */
router.get('/creators', async (req, res) => {
  try {
    const { verified, status, sort, limit, page } = req.query;
    
    // Build filters
    const filters = {};
    if (verified) filters.verificationStatus = verified;
    if (status) filters.status = status;
    
    // Build pagination
    const pagination = {
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1
    };
    
    // Build sorting
    const sorting = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sorting.sortBy = field;
      sorting.sortDirection = direction || 'asc';
    }
    
    const creators = await AlgorithmCreator.list(filters, pagination, sorting);
    res.json(creators);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get creator by ID
 * GET /api/creators/:id
 */
router.get('/creators/:id', async (req, res) => {
  try {
    const creatorId = req.params.id;
    const creator = await AlgorithmCreator.getById(creatorId);
    
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    res.json(creator);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create creator profile
 * POST /api/creators
 */
router.post('/creators', requireAuth, async (req, res) => {
  try {
    const creatorData = {
      ...req.body,
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email
    };
    
    const creator = await AlgorithmService.createCreator(creatorData);
    res.status(201).json(creator);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update creator profile
 * PUT /api/creators/:id
 */
router.put('/creators/:id', requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const updatedData = req.body;
    const userId = req.user.id;
    
    // Admin override for admins
    if (req.user.isAdmin) {
      updatedData.isAdminOverride = true;
    }
    
    const creator = await AlgorithmService.updateCreator(creatorId, updatedData, userId);
    res.json(creator);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify creator profile
 * POST /api/creators/:id/verify
 */
router.post('/creators/:id/verify', requireAdmin, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const creator = await AlgorithmCreator.getById(creatorId);
    
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    const verificationData = req.body;
    const verifiedCreator = await creator.verify(verificationData);
    
    res.json(verifiedCreator);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get creator earnings
 * GET /api/creators/:id/earnings
 */
router.get('/creators/:id/earnings', requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const creator = await AlgorithmCreator.getById(creatorId);
    
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Ensure user has permission to view earnings
    if (creator.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view these earnings' });
    }
    
    const period = req.query.period || 'all';
    const earnings = await AlgorithmService.getCreatorEarnings(creatorId, period);
    
    res.json(earnings);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create custom revenue share agreement
 * POST /api/creators/:id/revenue-agreements
 */
router.post('/creators/:id/revenue-agreements', requireAdmin, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const agreementData = {
      ...req.body,
      isAdminRequest: true
    };
    const userId = req.user.id;
    
    const agreement = await AlgorithmService.createCustomRevenueShareAgreement(
      creatorId, 
      agreementData, 
      userId
    );
    
    res.status(201).json(agreement);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process payout to creator
 * POST /api/creators/:id/payouts
 */
router.post('/creators/:id/payouts', requireAdmin, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const payoutData = req.body;
    const adminId = req.user.id;
    
    const payout = await AlgorithmService.processCreatorPayout(
      creatorId, 
      payoutData, 
      adminId
    );
    
    res.status(201).json(payout);
  } catch (_error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;