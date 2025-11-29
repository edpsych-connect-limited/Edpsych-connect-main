import { logger } from "@/lib/logger";
/**
 * API Access Controller
 * 
 * This controller provides REST API endpoints for managing API keys,
 * viewing usage statistics, and configuring usage-based pricing.
 */

import { Router, Request, Response } from 'express';
import { ApiKeyService } from '../services/api-key-service';
import { UsageTrackingService } from '../services/usage-tracking-service';
import { API_PRICING_PLANS } from '../models/api-pricing';
import { verifyLicense, requireCapability } from '../../licensing/middleware/license-verification.middleware';
import { apiAccessControl } from '../middleware/api-access-middleware';

// Create Express router
const router = Router();
const apiKeyService = new ApiKeyService();
const usageTrackingService = new UsageTrackingService();

/**
 * Get available pricing plans
 * 
 * This endpoint returns all available pricing plans
 */
router.get('/pricing-plans',
  verifyLicense(),
  async (_req: Request, res: Response) => {
    try {
      // Filter out non-public plans for regular users
      // In a real implementation, we would check if the user is an admin
      const isAdmin = false;
      
      const plans = Object.values(API_PRICING_PLANS).filter(plan => 
        plan.isPublic || isAdmin
      );
      
      return res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Get pricing plans error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get pricing plans'
      });
    }
  }
);

/**
 * Get a specific pricing plan
 * 
 * This endpoint returns a specific pricing plan by ID
 */
router.get('/pricing-plans/:id',
  verifyLicense(),
  async (_req: Request, res: Response) => {
    try {
      const planId = _req.params.subscriptionId;
      const plan = API_PRICING_PLANS[planId];
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Pricing plan not found'
        });
      }
      
      // Hide non-public plans from regular users
      // In a real implementation, we would check if the user is an admin
      const isAdmin = false;
      
      if (!plan.isPublic && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access to this pricing plan is restricted'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Get pricing plan error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get pricing plan'
      });
    }
  }
);

/**
 * Create a new API key
 * 
 * This endpoint creates a new API key for the authenticated user's organization
 */
router.post('/keys', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const { name, expiresAt, allowedIpAddresses, allowedDomains, 
              allowedEndpoints, maxRequestsPerSecond, quotaOverrides } = req.body;
      
      // In a real implementation, we would get the organization ID from the authenticated user
      const organizationId = 'org_123456';
      const licenseId = req.licenseId as string;
      
      const apiKey = await apiKeyService.createApiKey({
        licenseId,
        organizationId,
        name,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        allowedIpAddresses,
        allowedDomains,
        allowedEndpoints,
        maxRequestsPerSecond,
        quotaOverrides
      });
      
      return res.status(201).json({
        success: true,
        data: apiKey,
        message: 'API key created successfully. This is the only time you will see the full key. Make sure to store it securely.'
      });
    } catch (error) {
      console.error('Create API key error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create API key'
      });
    }
  }
);

/**
 * Get all API keys for the authenticated user's organization
 * 
 * This endpoint returns all API keys for the authenticated user's organization
 */
router.get('/keys',
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (_req: Request, res: Response) => {
    try {
      // In a real implementation, we would get the organization ID from the authenticated user
      const organizationId = 'org_123456';
      
      const apiKeys = await apiKeyService.getOrganizationApiKeys(organizationId);
      
      // Remove sensitive key data from the response
      const sanitizedKeys = apiKeys.map(key => ({
        ...key,
        key: `${key.key.split('.')[0]}...` // Only show the prefix
      }));
      
      return res.status(200).json({
        success: true,
        data: sanitizedKeys
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get API keys'
      });
    }
  }
);

/**
 * Get a specific API key
 * 
 * This endpoint returns a specific API key by ID
 */
router.get('/keys/:id', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const apiKeyId = req.params.subscriptionId;
      const apiKey = await apiKeyService.getApiKey(apiKeyId);
      
      if (!apiKey) {
        return res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }
      
      // In a real implementation, we would verify that the API key belongs to the authenticated user's organization
      
      // Remove sensitive key data from the response
      const sanitizedKey = {
        ...apiKey,
        key: `${apiKey.key.split('.')[0]}...` // Only show the prefix
      };
      
      return res.status(200).json({
        success: true,
        data: sanitizedKey
      });
    } catch (error) {
      console.error('Get API key error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get API key'
      });
    }
  }
);

/**
 * Update an API key
 * 
 * This endpoint updates a specific API key by ID
 */
router.put('/keys/:id', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const apiKeyId = req.params.subscriptionId;
      const { name, expiresAt, allowedIpAddresses, allowedDomains, 
              allowedEndpoints, maxRequestsPerSecond, quotaOverrides, isActive } = req.body;
      
      // In a real implementation, we would verify that the API key belongs to the authenticated user's organization
      
      // First retrieve the existing API key
      const existingApiKey = await apiKeyService.getApiKey(apiKeyId);
      
      if (!existingApiKey) {
        return res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }
      
      // Then update it with the new values
      const apiKey = await apiKeyService.updateApiKey(apiKeyId, {
        name,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        allowedIpAddresses,
        allowedDomains,
        allowedEndpoints,
        isActive,
        rateLimit: maxRequestsPerSecond ? {
          licenseId: existingApiKey.licenseId,
          apiKeyId: existingApiKey.id,
          maxRequestsPerSecond,
          currentRequestCount: existingApiKey.rateLimit.currentRequestCount,
          periodStart: existingApiKey.rateLimit.periodStart,
          periodEnd: existingApiKey.rateLimit.periodEnd,
          exceeded: existingApiKey.rateLimit.exceeded,
          resetAt: existingApiKey.rateLimit.resetAt
        } : undefined,
        quotaOverrides
      });
      
      if (!apiKey) {
        return res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }
      
      // Remove sensitive key data from the response
      const sanitizedKey = {
        ...apiKey,
        key: `${apiKey.key.split('.')[0]}...` // Only show the prefix
      };
      
      return res.status(200).json({
        success: true,
        data: sanitizedKey
      });
    } catch (error) {
      console.error('Update API key error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update API key'
      });
    }
  }
);

/**
 * Deactivate an API key
 * 
 * This endpoint deactivates a specific API key by ID
 */
router.post('/keys/:id/deactivate', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (_req: Request, res: Response) => {
    try {
      const apiKeyId = _req.params.subscriptionId;
      
      // In a real implementation, we would verify that the API key belongs to the authenticated user's organization
      
      const success = await apiKeyService.deactivateApiKey(apiKeyId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'API key not found or already deactivated'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'API key deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate API key error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate API key'
      });
    }
  }
);

/**
 * Rotate an API key
 * 
 * This endpoint rotates a specific API key by ID
 */
router.post('/keys/:id/rotate', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const apiKeyId = req.params.subscriptionId;
      
      // In a real implementation, we would verify that the API key belongs to the authenticated user's organization
      
      const apiKey = await apiKeyService.rotateApiKey(apiKeyId);
      
      if (!apiKey) {
        return res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: apiKey,
        message: 'API key rotated successfully. This is the only time you will see the full new key. Make sure to store it securely.'
      });
    } catch (error) {
      console.error('Rotate API key error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to rotate API key'
      });
    }
  }
);

/**
 * Get usage summary for the authenticated user's organization
 * 
 * This endpoint returns usage summary for the authenticated user's organization
 */
router.get('/usage', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const licenseId = req.licenseId as string;

      // Parse date parameters
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const usageSummary = await usageTrackingService.getUsageSummary(
        licenseId,
        startDate,
        endDate
      );
      
      return res.status(200).json({
        success: true,
        data: usageSummary || {
          licenseId,
          periodStart: startDate,
          periodEnd: endDate,
          usageByResourceType: {},
          totalCost: 0,
          billed: false,
          topEndpoints: [],
          usagePatterns: []
        }
      });
    } catch (error) {
      console.error('Get usage summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get usage summary'
      });
    }
  }
);

/**
 * Get usage report for the authenticated user's organization
 * 
 * This endpoint returns a detailed usage report for the authenticated user's organization
 */
router.get('/usage/report', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const licenseId = req.licenseId as string;
      
      // Parse date parameters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
        
      const groupBy = (req.query.groupBy || 'day') as 'day' | 'week' | 'month' | 'endpoint' | 'resource';
      
      const report = await usageTrackingService.generateUsageReport(
        licenseId,
        startDate,
        endDate,
        groupBy
      );
      
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Generate usage report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate usage report'
      });
    }
  }
);

/**
 * Get quota consumption for the authenticated user's organization
 * 
 * This endpoint returns quota consumption for the authenticated user's organization
 */
router.get('/quotas',
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (_req: Request, res: Response) => {
    try {
      // In a real implementation, we would get quota consumption for all resource types
      // For now, we'll return an empty array
      
      return res.status(200).json({
        success: true,
        data: []
      });
    } catch (error) {
      console.error('Get quota consumption error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get quota consumption'
      });
    }
  }
);

/**
 * Get usage alerts for the authenticated user's organization
 * 
 * This endpoint returns usage alerts for the authenticated user's organization
 */
router.get('/alerts', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const licenseId = req.licenseId as string;
      
      const alerts = await usageTrackingService.getApiUsageAlerts(licenseId);
      
      return res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Get usage alerts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get usage alerts'
      });
    }
  }
);

/**
 * Get invoice for the authenticated user's organization
 * 
 * This endpoint returns an invoice for the authenticated user's organization
 */
router.get('/billing/invoice', 
  verifyLicense(),
  requireCapability('customIntegration', true),
  async (req: Request, res: Response) => {
    try {
      const licenseId = req.licenseId as string;
      
      // Parse date parameters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
      
      const invoice = await usageTrackingService.generateInvoice(
        licenseId,
        startDate,
        endDate
      );
      
      return res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice'
      });
    }
  }
);

/**
 * Test endpoint that uses the API access control middleware
 */
router.get('/test',
  apiAccessControl(),
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: 'API access control test successful',
      data: {
        timestamp: new Date()
      }
    });
  }
);

export default router;