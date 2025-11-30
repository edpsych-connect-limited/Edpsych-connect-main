import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { PrismaClient } from '@prisma/client';
import { monitoringService } from './monitoring-service';
import { systemMetricsCollector } from './system-metrics';
import { DatabaseMetricsCollector } from './database-metrics';
import { cloudWatchClient } from './cloudwatch-client';
import { cloudWatchConfig } from './cloudwatch-config';

/**
 * Initialize monitoring services for the application
 */
export class MonitoringInitializer {
  private static isInitialized: boolean = false;
  private static databaseMetricsCollector: DatabaseMetricsCollector | null = null;

  /**
   * Initialize all monitoring services
   * @param prismaClient Prisma client instance
   * @param options Initialization options
   */
  static async initialize(
    prismaClient: PrismaClient,
    options: {
      enableSystemMetrics?: boolean;
      enableDatabaseMetrics?: boolean;
      enableApiMonitoring?: boolean;
      setupAlarms?: boolean;
      systemMetricsIntervalMs?: number;
      databaseMetricsIntervalMs?: number;
      slowQueryThresholdMs?: number;
    } = {}
  ): Promise<void> {
    if (this.isInitialized) {
      logger.debug('Monitoring services already initialized');
      return;
    }

    const {
      enableSystemMetrics = true,
      enableDatabaseMetrics = true,
      enableApiMonitoring: _enableApiMonitoring = true,
      setupAlarms = true,
      systemMetricsIntervalMs = 60000,
      databaseMetricsIntervalMs = 60000,
      slowQueryThresholdMs = 500,
    } = options;

    logger.debug('Initializing monitoring services...');

    // Skip initialization if CloudWatch is disabled
    if (!cloudWatchConfig.enabled) {
      logger.debug('CloudWatch monitoring is disabled in configuration. Skipping initialization.');
      return;
    }

    try {
      // Initialize system metrics collection if enabled
      if (enableSystemMetrics) {
        logger.debug('Starting system metrics collection...');
        systemMetricsCollector.startCollecting(systemMetricsIntervalMs);
      }

      // Initialize database metrics collection if enabled
      if (enableDatabaseMetrics && prismaClient) {
        logger.debug('Starting database metrics collection...');
        this.databaseMetricsCollector = new DatabaseMetricsCollector(prismaClient);
        this.databaseMetricsCollector.startMonitoring(
          databaseMetricsIntervalMs,
          slowQueryThresholdMs
        );
      }

      // Set up standard CloudWatch alarms if enabled
      if (setupAlarms) {
        logger.debug('Setting up CloudWatch alarms...');
        await cloudWatchClient.createStandardAlarms();
      }

      // Log successful initialization
      logger.debug('Monitoring services initialized successfully');
      this.isInitialized = true;

      // Record initialization event
      await monitoringService.trackUserActivity(
        'SystemStartup',
        'System',
        1
      );
    } catch (_error) {
      console.error('Failed to initialize monitoring services:', error);
      // Attempt to record initialization failure
      try {
        await monitoringService.trackApiError(
          'monitoring-init', 
          error instanceof Error ? error.name : 'UnknownError',
          500
        );
      } catch (logError) {
        console.error('Failed to log monitoring initialization error:', logError);
      }
    }
  }

  /**
   * Shutdown monitoring services
   */
  static shutdown(): void {
    if (!this.isInitialized) {
      return;
    }

    logger.debug('Shutting down monitoring services...');

    // Stop system metrics collection
    systemMetricsCollector.stopCollecting();

    // Stop database metrics collection
    if (this.databaseMetricsCollector) {
      this.databaseMetricsCollector.stopMonitoring();
      this.databaseMetricsCollector = null;
    }

    this.isInitialized = false;
    logger.debug('Monitoring services shut down successfully');
  }

  /**
   * Check if monitoring services are initialized
   */
  static isInitializationComplete(): boolean {
    return this.isInitialized;
  }

  /**
   * Get initialization status details
   */
  static getStatus(): {
    initialized: boolean;
    systemMetricsActive: boolean;
    databaseMetricsActive: boolean;
    cloudWatchEnabled: boolean;
  } {
    return {
      initialized: this.isInitialized,
      systemMetricsActive: systemMetricsCollector !== null,
      databaseMetricsActive: this.databaseMetricsCollector !== null,
      cloudWatchEnabled: cloudWatchConfig.enabled,
    };
  }
}

// Export a default initialization function for easier imports
export const initializeMonitoring = MonitoringInitializer.initialize.bind(MonitoringInitializer);