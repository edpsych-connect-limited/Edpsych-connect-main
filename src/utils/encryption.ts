import { logger } from "@/lib/logger";
/**
 * Enterprise-Grade Storage Utility
 * EdPsych Connect World - Authentication System
 *
 * SIMPLIFIED VERSION - No encryption for maximum reliability
 * - Zero external dependencies (no crypto-js)
 * - Synchronous operations (no race conditions)
 * - Universal compatibility (works for all users/roles)
 * - Production-grade error handling
 * - Comprehensive logging for debugging
 *
 * SECURITY NOTE: Encryption can be added in Phase 3 using Web Crypto API
 * For now, we prioritize reliability over encryption for authentication tokens
 *
 * @module encryption
 * @version 2.0 - Simplified & Reliable
 * @author Dr. Scott Ighavongbe-Patrick
 */

/**
 * Stores data in browser storage (localStorage or sessionStorage)
 *
 * @param key - Storage key identifier
 * @param data - Data to store (will be JSON stringified if not string)
 * @param useSession - If true, uses sessionStorage; otherwise localStorage
 * @throws Error if storage operation fails
 *
 * @example
 * secureStore('accessToken', 'eyJhbGc...', false);
 * secureStore('userData', { id: 1, email: 'user@example.com' }, false);
 */
export const secureStore = (key: string, data: any, useSession = false): void => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    storage.setItem(key, serialized);
    logger.debug(`✅ [Storage] Stored ${key} successfully`);
  } catch (_error) {
    console.error(`❌ [Storage] Failed to store ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieves data from browser storage
 *
 * @param key - Storage key identifier
 * @param useSession - If true, uses sessionStorage; otherwise localStorage
 * @returns Parsed data if valid JSON, raw string otherwise, or null if not found
 *
 * @example
 * const token = secureRetrieve('accessToken');
 * const user = secureRetrieve('userData');
 */
export const secureRetrieve = (key: string, useSession = false): any => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    const data = storage.getItem(key);

    if (!data) {
      logger.debug(`ℹ️ [Storage] No data found for ${key}`);
      return null;
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(data);
      logger.debug(`✅ [Storage] Retrieved ${key} successfully`);
      return parsed;
    } catch {
      // If not valid JSON, return as string
      logger.debug(`✅ [Storage] Retrieved ${key} as string`);
      return data;
    }
  } catch (_error) {
    console.error(`❌ [Storage] Failed to retrieve ${key}:`, error);
    return null;
  }
};

/**
 * Removes data from browser storage
 *
 * @param key - Storage key identifier
 * @param useSession - If true, uses sessionStorage; otherwise localStorage
 *
 * @example
 * secureRemove('accessToken');
 * secureRemove('userData');
 */
export const secureRemove = (key: string, useSession = false): void => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    storage.removeItem(key);
    logger.debug(`✅ [Storage] Removed ${key}`);
  } catch (_error) {
    console.error(`❌ [Storage] Failed to remove ${key}:`, error);
  }
};

/**
 * Validates if data can be safely stored
 *
 * @param data - Data to validate
 * @returns True if data can be JSON stringified
 *
 * @example
 * if (isValidForStorage(myData)) {
 *   secureStore('myKey', myData);
 * }
 */
export const isValidForStorage = (data: any): boolean => {
  try {
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clears all authentication-related storage
 * Useful for logout or session cleanup
 *
 * @param useSession - If true, clears sessionStorage; otherwise localStorage
 *
 * @example
 * clearAuthStorage(); // Removes all auth tokens and user data
 */
export const clearAuthStorage = (useSession = false): void => {
  try {
    secureRemove('accessToken', useSession);
    secureRemove('refreshToken', useSession);
    secureRemove('userData', useSession);
    logger.debug('✅ [Storage] Cleared all authentication data');
  } catch (_error) {
    console.error('❌ [Storage] Failed to clear authentication data:', error);
  }
};

/**
 * Legacy function aliases for backward compatibility
 * These are pass-through functions that don't perform encryption
 * Can be replaced with proper encryption in Phase 3 if needed
 */

/**
 * @deprecated Use secureStore directly
 */
export const encrypt = (data: string): string => {
  return data;
};

/**
 * @deprecated Use secureRetrieve directly
 */
export const decrypt = (encryptedData: string): string | null => {
  return encryptedData;
};
