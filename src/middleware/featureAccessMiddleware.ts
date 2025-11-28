import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { FeatureFlag, SubscriptionFeatureService } from '../services/subscription-feature-service';
import { User } from '../types/auth';

/**
 * Extract user from request
 * In a real implementation, this would parse the JWT token from Authorization header
 * or use next-auth's getServerSession
 */
async function getUserFromRequest(req: NextApiRequest): Promise<User | null> {
  // Check for Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // In a real implementation, this would verify and decode the JWT
      // For now, we'll assume a valid user for development purposes
      
      // DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
      const mockUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        subscription: {
          tier: 'professional',
          subscriptionId: 'sub_123',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        roles: ['teacher']
      };
      
      return mockUser;
    } catch (error) {
      console.error('Error decoding user token:', error);
      return null;
    }
  }
  
  // If using next-auth, you would use getServerSession here
  // const session = await getServerSession(req, res, authOptions);
  // return session?.user as User || null;
  
  return null;
}

/**
 * Middleware function to restrict API access based on subscription features
 * 
 * @param requiredFeature The feature flag required to access this API endpoint
 * @returns A middleware function that enforces feature access control
 */
export function requireFeatureAccess(requiredFeature: FeatureFlag) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      // Get user from request
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Check if the user has access to the required feature
      const hasAccess = SubscriptionFeatureService.hasFeatureAccess(user, requiredFeature);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your subscription does not include access to this feature',
          requiredFeature,
          upgradeUrl: '/pricing'
        });
      }
      
      // User has access, proceed to the API handler
      next();
    } catch (error) {
      console.error('Error in feature access middleware:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while checking feature access'
      });
    }
  };
}

/**
 * Higher-order function to wrap an API handler with feature access control
 * 
 * @param handler The API route handler function
 * @param requiredFeature The feature flag required to access this API endpoint
 * @returns A new handler function with feature access control
 */
export function withFeatureAccess(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  requiredFeature: FeatureFlag
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get user from request
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Check if the user has access to the required feature
      const hasAccess = SubscriptionFeatureService.hasFeatureAccess(user, requiredFeature);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your subscription does not include access to this feature',
          requiredFeature,
          tierRequired: SubscriptionFeatureService.getTierRequiredForFeature(requiredFeature),
          upgradeUrl: '/pricing'
        });
      }
      
      // User has access, proceed to the API handler
      return handler(req, res);
    } catch (error) {
      console.error('Error in feature access middleware:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while checking feature access'
      });
    }
  };
}

/**
 * Example usage:
 * 
 * // Using as middleware
 * export default apiRoutes()
 *   .use(requireFeatureAccess(FeatureFlag.ANONYMIZED_EXPORT_UNLIMITED))
 *   .get(handleGetRequest)
 *   .post(handlePostRequest);
 * 
 * // Using as a higher-order function
 * export default withFeatureAccess(async (req, res) => {
 *   // Handler implementation
 * }, FeatureFlag.ADVANCED_VISUALIZATION);
 */