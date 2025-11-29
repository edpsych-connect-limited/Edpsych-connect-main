import { logger } from "@/lib/logger";
/**
 * EdPsych Connect - Environment Variable Protection
 * 
 * This module provides runtime protection for sensitive configuration.
 * It encrypts sensitive values in memory and provides secure access patterns.
 */

// Simple XOR-based obfuscation for runtime values (not cryptographic security)
const obfuscationKey = process.env.OBFUSCATION_KEY || 'EdPsych2025SecureKey';

/**
 * Obfuscate a string value for storage
 */
export function obfuscate(value: string): string {
  if (!value) return '';
  
  let result = '';
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i) ^ obfuscationKey.charCodeAt(i % obfuscationKey.length);
    result += String.fromCharCode(charCode);
  }
  
  // Convert to base64 for safe storage
  return Buffer.from(result).toString('base64');
}

/**
 * Deobfuscate a previously obfuscated string
 */
export function deobfuscate(encoded: string): string {
  if (!encoded) return '';
  
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ obfuscationKey.charCodeAt(i % obfuscationKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Secure configuration accessor
 * Provides a layer of indirection for sensitive values
 */
class SecureConfig {
  private static instance: SecureConfig;
  private cache: Map<string, string> = new Map();
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): SecureConfig {
    if (!SecureConfig.instance) {
      SecureConfig.instance = new SecureConfig();
    }
    return SecureConfig.instance;
  }
  
  /**
   * Get a configuration value with optional caching
   */
  public get(key: string, defaultValue = ''): string {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) || defaultValue;
    }
    
    // Get from environment
    const value = process.env[key] || defaultValue;
    
    // Don't cache sensitive values
    if (!key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD')) {
      this.cache.set(key, value);
    }
    
    return value;
  }
  
  /**
   * Clear the configuration cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const secureConfig = SecureConfig.getInstance();

/**
 * Mask sensitive data for logging
 */
export function maskSensitive(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars * 2) {
    return '****';
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '*'.repeat(Math.min(value.length - visibleChars * 2, 8));
  
  return `${start}${masked}${end}`;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Safely stringify objects, masking sensitive fields
 */
export function safeStringify(obj: Record<string, unknown>, sensitiveFields: string[] = []): string {
  const defaultSensitive = ['password', 'secret', 'key', 'token', 'authorization', 'cookie'];
  const allSensitive = [...defaultSensitive, ...sensitiveFields.map(f => f.toLowerCase())];
  
  return JSON.stringify(obj, (key, value) => {
    if (allSensitive.some(s => key.toLowerCase().includes(s))) {
      return typeof value === 'string' ? maskSensitive(value) : '[REDACTED]';
    }
    return value;
  }, 2);
}
