/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions, Session as AuthSession } from '../lib/auth';


export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function validateRequiredFields(obj: Record<string, any>, fields: string[]): void {
  const missingFields = fields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw new ApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }
}

type Handler<T = any> = (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>, session: AuthSession | null) => Promise<void>;

export function withApiHandler<T = any>(
  handler: Handler<T>,
  { requireAuth = true, roles = [] as string[] } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      let session: AuthSession | null = null;

      if (requireAuth) {
        const nextAuthSession = await getServerSession(req, res, authOptions);
        session = nextAuthSession as AuthSession | null;
        if (!session || !session.user) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Check if user has any of the required roles
        if (roles.length > 0) {
          const userRoles = session.user.role || [];
          const hasRequiredRole = roles.some(role => userRoles.includes(role));
          
          if (!hasRequiredRole) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
          }
        }
      }

      await handler(req, res, session);
    } catch (err: any) {
      console.error('API Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
    }
  };
}
