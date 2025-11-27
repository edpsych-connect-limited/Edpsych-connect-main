/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Mock implementation of Sentry for Phase 1
// Will be replaced with real @sentry/nextjs in Phase 2

import { logger } from './logger';

// Mock Sentry object with no-op functions
const Sentry = {
  init: (options: any) => {
    logger.info('Mock Sentry initialized with options:', options);
  },
  captureException: (error: any) => {
    logger.error('Mock Sentry captured exception:', error);
  },
  captureMessage: (message: string, level?: string) => {
    logger.info(`Mock Sentry captured message (${level || 'info'}):`, message);
  },
  withScope: (callback: (scope: any) => void) => {
    const mockScope = {
      setTag: (_name: string, _value: string) => {},
      setLevel: (_level: string) => {},
      setExtra: (_name: string, _value: any) => {},
    };
    callback(mockScope);
  },
};

export default Sentry;
export const init = Sentry.init;
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const withScope = Sentry.withScope;