/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/all.log',
          }),
        ]
      : []),
  ],
});

// Enhanced logging functions
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(`${error.message}\n${error.stack}`, { context });
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, { context });
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, { context });
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, { context });
};

// Performance logging
export const logPerformance = (operation: string, startTime: number, context?: Record<string, any>) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation} took ${duration}ms`, { context, duration });
};

// API logging
export const logApiRequest = (method: string, url: string, statusCode?: number, duration?: number) => {
  const level = statusCode && statusCode >= 400 ? 'warn' : 'info';
  const message = `API ${method} ${url}${statusCode ? ` - ${statusCode}` : ''}${duration ? ` (${duration}ms)` : ''}`;

  logger.log(level, message, { method, url, statusCode, duration });
};

// User action logging
export const logUserAction = (action: string, id?: string, context?: Record<string, any>) => {
  logger.info(`User Action: ${action}`, { id, ...context });
};

// Security logging
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  logger.log(level, `Security Event: ${event} (${severity})`, { severity, ...context });
};

// Export named logger
export { logger };

export default logger;