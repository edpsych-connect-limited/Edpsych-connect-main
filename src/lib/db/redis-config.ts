import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Redis configuration with edge runtime compatibility

export interface RateLimiter {
  isAllowed: (key: string, limit: number, window: number) => Promise<boolean>;
}
