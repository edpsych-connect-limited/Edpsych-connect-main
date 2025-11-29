/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Universal logger that works in both browser and server environments

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Simple console-based logger that works everywhere
const consoleLogger = {
  error: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}] INFO: ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] DEBUG: ${message}`, ...args);
  },
  log: (level: string, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    const logMethod = (console as any)[level] || console.log;
    logMethod(`[${timestamp}] ${level.toUpperCase()}: ${message}`, ...args);
  }
};

// Enhanced logging functions
export const logError = (error: Error | string, context?: Record<string, any>) => {
  const message = typeof error === 'string' ? error : `${error.message}\n${error.stack}`;
  consoleLogger.error(message, { context });
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  consoleLogger.warn(message, { context });
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  consoleLogger.info(message, { context });
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  consoleLogger.debug(message, { context });
};

// Performance logging
export const logPerformance = (operation: string, startTime: number, context?: Record<string, any>) => {
  const duration = Date.now() - startTime;
  consoleLogger.info(`Performance: ${operation} took ${duration}ms`, { context, duration });
};

// User action logging
export const logUserAction = (action: string, id?: string, context?: Record<string, any>) => {
  consoleLogger.info(`User Action: ${action}`, { id, ...context });
};

// Security logging
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  consoleLogger.log(level, `Security Event: ${event} (${severity})`, { severity, ...context });
};

// Performance timer
export const startTimer = (label: string) => {
  const startTime = Date.now();
  consoleLogger.debug(`Timer started: ${label}`, { label, startTime });

  const timer = () => {
    const duration = Date.now() - startTime;
    consoleLogger.info(`Timer ended: ${label}`, { label, duration });
    return duration;
  };

  timer.startTime = startTime;
  return timer;
};

// API request logging
export const logApiRequest = (method: string, url: string, statusCode?: number, duration?: number, context?: Record<string, any>) => {
  const level = statusCode && statusCode >= 400 ? 'warn' : 'info';
  const message = `API ${method} ${url}${statusCode ? ` - ${statusCode}` : ''}${duration ? ` (${duration}ms)` : ''}`;

  consoleLogger.log(level, message, { method, url, statusCode, duration, ...context });
};

// Enhanced logger object with additional methods
const enhancedLogger = {
  startTimer,
  apiRequest: logApiRequest,
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  security: logSecurityEvent,
  performance: logPerformance,
  userAction: logUserAction
};

// Export named logger (will be null in browser, use enhancedLogger instead)
export { consoleLogger as logger, enhancedLogger };

export default enhancedLogger;