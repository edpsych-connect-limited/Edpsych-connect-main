/**
 * License Verification Middleware
 * 
 * This middleware verifies that incoming requests have a valid license
 * and that the license has the required capabilities for the requested operation.
 */

import { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../services/license-service';
import { LicenseCapabilities } from '../models/license-types';

/**
 * Middleware to verify that a license is valid
 *
 * @param requiresActive Whether the license must be active (default: true)
 * @returns Express middleware function
 */
export const verifyLicense = (requiresActive = true) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const licenseService = new LicenseService();
      
      // Extract license ID and key from request headers
      const licenseId = req.headers['x-license-id'] as string;
      const licenseKey = req.headers['x-license-key'] as string;
      
      if (!licenseId || !licenseKey) {
        res.status(401).json({
          success: false,
          message: 'License credentials missing'
        });
        return;
      }
      
      // Validate the license
      const isValid = await licenseService.validateLicense(licenseId, licenseKey);
      
      if (!isValid) {
        res.status(403).json({
          success: false,
          message: 'Invalid license'
        });
        return;
      }
      
      // Check if the license is active (if required)
      if (requiresActive) {
        const isActive = await licenseService.isLicenseActive(licenseId);
        
        if (!isActive) {
          res.status(403).json({
            success: false,
            message: 'License is inactive or expired'
          });
          return;
        }
      }
      
      // Attach the license ID to the request for later use
      req.licenseId = licenseId;
      
      next();
    } catch (_error) {
      console.error('License verification error:', _error);
      res.status(500).json({
        success: false,
        message: 'License verification failed'
      });
      return;
    }
  };
};

/**
 * Middleware to verify that a license has a specific capability
 * 
 * @param feature The capability required
 * @param minValue The minimum value required for the capability (if applicable)
 * @returns Express middleware function
 */
export const requireCapability = (
  feature: keyof LicenseCapabilities,
  minValue?: number | boolean
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure the license is verified first
      if (!req.licenseId) {
        res.status(401).json({
          success: false,
          message: 'License not verified'
        });
        return;
      }
      
      const licenseService = new LicenseService();
      
      // Check if the feature is available
      const hasFeature = await licenseService.isFeatureAvailable(req.licenseId, feature);
      
      if (!hasFeature) {
        res.status(403).json({
          success: false,
          message: `Required capability not available: ${feature}`
        });
        return;
      }
      
      // If a minimum value is specified, check if the license meets it
      if (minValue !== undefined) {
        const license = await licenseService.getLicense(req.licenseId);
        
        if (!license) {
          res.status(404).json({
            success: false,
            message: 'License not found'
          });
          return;
        }
        
        // Use capability overrides if present, otherwise use definition capabilities
        const capabilities = license.capabilityOverrides || license.definition.capabilities;
        const actualValue = capabilities[feature];
        
        // Compare the actual value to the minimum value
        if (typeof actualValue === 'number' && typeof minValue === 'number') {
          if (actualValue < minValue) {
            res.status(403).json({
              success: false,
              message: `Insufficient capability: ${feature} (required: ${minValue}, actual: ${actualValue})`
            });
            return;
          }
        } else if (typeof actualValue === 'boolean' && typeof minValue === 'boolean') {
          if (minValue === true && actualValue === false) {
            res.status(403).json({
              success: false,
              message: `Required capability not enabled: ${feature}`
            });
            return;
          }
        }
      }
      
      next();
    } catch (_error) {
      console.error('License capability verification error:', _error);
      res.status(500).json({
        success: false,
        message: 'License capability verification failed'
      });
      return;
    }
  };
};

/**
 * Middleware to check if a license has quota available
 * 
 * @param quotaType The type of quota to check
 * @param getAmount Function to extract the amount from the request
 * @returns Express middleware function
 */
export const checkQuota = (
  quotaType: 'users' | 'subjects' | 'storage' | 'apiRequests',
  getAmount: (req: Request) => number = () => 1
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure the license is verified first
      if (!req.licenseId) {
        res.status(401).json({
          success: false,
          message: 'License not verified'
        });
        return;
      }
      
      const licenseService = new LicenseService();
      const amount = getAmount(req);
      
      // Check if the license has quota available
      const hasQuota = await licenseService.hasQuotaAvailable(req.licenseId, quotaType, amount);
      
      if (!hasQuota) {
        res.status(403).json({
          success: false,
          message: `Quota exceeded: ${quotaType}`
        });
        return;
      }
      
      next();
    } catch (_error) {
      console.error('License quota verification error:', _error);
      res.status(500).json({
        success: false,
        message: 'License quota verification failed'
      });
      return;
    }
  };
};

// Extend the Express Request interface to include licenseId
declare module 'express-serve-static-core' {
  interface Request {
    licenseId?: string;
  }
}
