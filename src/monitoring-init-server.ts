import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient } from '@prisma/client';
import { initializeMonitoring } from './services/monitoring/monitoring-init';
import { prisma } from './lib/prisma/client'; // Import the existing prisma client

/**
 * Initialize monitoring services for the application server
 * 
 * This function should be called during server startup to initialize
 * the monitoring infrastructure, including CloudWatch integration,
 * system metrics collection, and database performance tracking.
 */
export async function initializeServerMonitoring(): Promise<void> {
  logger.debug('Initializing server monitoring services...');

  try {
    // Skip initialization in development mode unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MONITORING_IN_DEV !== 'true') {
      logger.debug('Monitoring services disabled in development mode');
      return;
    }

    // Get Prisma client for database monitoring
    let prismaClient: PrismaClient | undefined;
    try {
      // Use the existing prisma client instance
      prismaClient = prisma;
    } catch (_error) {
      console.warn('Failed to use Prisma client for monitoring:', _error);
      // Continue initialization without database monitoring
    }

    // Get environment-specific configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const isStaging = process.env.DEPLOYMENT_ENV === 'staging';
    const isDevelopment = !isProduction && !isStaging;
    
    // Initialize monitoring services with appropriate options based on environment
    await initializeMonitoring(prismaClient as PrismaClient, {
      // Enable system metrics in production and staging
      enableSystemMetrics: !isDevelopment,
      
      // Enable database metrics if prisma client is available
      enableDatabaseMetrics: !!prismaClient,
      
      // Enable API monitoring in all environments
      enableApiMonitoring: true,
      
      // Set up CloudWatch alarms in production only
      setupAlarms: isProduction,
      
      // Adjust metric collection frequency based on environment
      systemMetricsIntervalMs:
        isProduction ? 60000 : // 1 minute in production
        isStaging ? 180000 : // 3 minutes in staging
        300000, // 5 minutes in other environments
      
      // Database metrics frequency
      databaseMetricsIntervalMs:
        isProduction ? 60000 : // 1 minute in production
        isStaging ? 180000 : // 3 minutes in staging
        300000, // 5 minutes in other environments
      
      // Threshold for slow query detection (ms)
      slowQueryThresholdMs:
        isProduction ? 500 : // 500ms in production
        isStaging ? 1000 : // 1s in staging
        2000, // 2s in development
    });

    logger.debug('Server monitoring services initialized successfully');
    
    // Register shutdown handler for clean termination
    process.on('SIGTERM', () => {
      logger.debug('SIGTERM signal received, shutting down monitoring services...');
      import('./services/monitoring/monitoring-init').then(({ MonitoringInitializer }) => {
        MonitoringInitializer.shutdown();
      }).catch(err => {
        console.error('Error shutting down monitoring services:', err);
      });
    });
  } catch (_error) {
    console.error('Failed to initialize server monitoring services:', _error);
    // Don't throw the _error - allow the server to start even if monitoring fails
  }
}
