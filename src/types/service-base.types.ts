/**
 * Enterprise Service Base Types
 * 
 * Provides foundational type definitions for all service layer implementations
 * to ensure consistency, maintainability, and type safety across the platform.
 * 
 * @module types/service-base
 * @version 1.0.0
 */

/**
 * Generic service configuration object
 * Used as base for all service initializations
 */
export interface ServiceConfig extends Record<string, any> {
  enabled?: boolean;
  debug?: boolean;
  timeout?: number;
  retryAttempts?: number;
  [key: string]: any;
}

/**
 * Service response wrapper with metadata
 * Ensures consistent error handling and logging across services
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: Error | null;
  message?: string;
  timestamp: string;
  executionTime?: number;
  [key: string]: any;
}

/**
 * Service health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Metrics record for all services
 */
export interface ServiceMetrics extends Record<string, any> {
  timestamp: string;
  count: number;
  duration: number;
  success: number;
  errors: number;
  [key: string]: any;
}

/**
 * Common event interface for all service events
 */
export interface ServiceEvent {
  type: string;
  timestamp: string;
  source: string;
  data: Record<string, any>;
}

/**
 * Database query result
 */
export interface QueryResult extends Record<string, any> {
  rowCount?: number;
  rows?: any[];
  [key: string]: any;
}

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> extends Record<string, any> {
  value: T;
  expires: number;
  _cachedAt: number;
  [key: string]: any;
}

/**
 * Encryption package structure
 */
export interface EncryptedPackage extends Record<string, any> {
  data: string;
  iv: string;
  keyId: string;
  algorithm: string;
  authTag: string;
  purpose?: string;
  encryptedAt: string;
  expiresAt?: string;
}

/**
 * Security event structure
 */
export interface SecurityEvent extends Record<string, any> {
  id: string;
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  userId?: string;
  ipAddress?: string;
  resource?: string;
  action?: string;
  result: string;
  details: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Performance metric entry
 */
export interface PerformanceMetric extends Record<string, any> {
  timestamp: string;
  endpoint?: string;
  responseTime: number;
  statusCode?: number;
  success: boolean;
}

/**
 * Prediction result for analytics
 */
export interface PredictionResult extends Record<string, any> {
  studentId?: string;
  courseId?: string;
  predictionDate: string;
  probability: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  factors?: Record<string, any>;
}

/**
 * Generic async operation result
 */
export interface AsyncOperationResult<T = any> extends Record<string, any> {
  success: boolean;
  result?: T;
  error?: string;
  duration: number;
  timestamp: string;
}
