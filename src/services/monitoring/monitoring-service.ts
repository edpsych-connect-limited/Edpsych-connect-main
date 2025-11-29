import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { cloudWatchClient } from './cloudwatch-client';
import { MetricUnit, alertThresholds } from './cloudwatch-config';

/**
 * Service for monitoring application performance and health
 */
export class MonitoringService {
  /**
   * Track API request latency
   * @param endpoint The API endpoint path
   * @param durationMs Duration in milliseconds
   * @param statusCode HTTP status code
   */
  async trackApiLatency(
    endpoint: string,
    durationMs: number,
    statusCode: number
  ): Promise<void> {
    // Record the API latency metric
    await cloudWatchClient.recordTiming('ApiLatency', durationMs, {
      Endpoint: endpoint,
      StatusCode: statusCode.toString(),
    });

    // Check if latency exceeds warning threshold and log
    if (durationMs > alertThresholds.apiLatency * 0.7) {
      console.warn(`High API latency detected: ${endpoint} took ${durationMs}ms`);
    }
  }

  /**
   * Track API error
   * @param endpoint The API endpoint path
   * @param errorType Type of error
   * @param statusCode HTTP status code
   */
  async trackApiError(
    endpoint: string,
    errorType: string,
    statusCode: number
  ): Promise<void> {
    await cloudWatchClient.recordCount('ApiErrors', 1, {
      Endpoint: endpoint,
      ErrorType: errorType,
      StatusCode: statusCode.toString(),
    });
  }

  /**
   * Track database operation latency
   * @param operation The database operation (query, insert, update, etc.)
   * @param entity The entity being operated on
   * @param durationMs Duration in milliseconds
   */
  async trackDatabaseLatency(
    operation: string,
    entity: string,
    durationMs: number
  ): Promise<void> {
    await cloudWatchClient.recordTiming('DatabaseLatency', durationMs, {
      Operation: operation,
      Entity: entity,
    });

    // Log slow database operations
    if (durationMs > 100) {
      console.warn(`Slow database operation: ${operation} on ${entity} took ${durationMs}ms`);
    }
  }

  /**
   * Track user activity
   * @param activityType Type of activity
   * @param userType Type of user (teacher, admin, etc.)
   * @param count Number of activities (default: 1)
   */
  async trackUserActivity(
    activityType: string,
    userType: string,
    count: number = 1
  ): Promise<void> {
    await cloudWatchClient.recordCount('UserActivity', count, {
      ActivityType: activityType,
      UserType: userType,
    });
  }

  /**
   * Track resource usage
   * @param resourceType Type of resource (cpu, memory, etc.)
   * @param value Usage value
   * @param unit Unit of measurement
   */
  async trackResourceUsage(
    resourceType: string,
    value: number,
    unit: MetricUnit
  ): Promise<void> {
    await cloudWatchClient.recordGauge(`${resourceType}Usage`, value, unit);

    // Check if resource usage exceeds warning threshold and log
    const threshold = this.getThresholdForResource(resourceType);
    if (threshold && value > threshold) {
      console.warn(`High ${resourceType} usage detected: ${value}${unit}`);
    }
  }

  /**
   * Track feature usage
   * @param featureName Name of the feature
   * @param userType Type of user (teacher, admin, etc.)
   * @param count Number of uses (default: 1)
   */
  async trackFeatureUsage(
    featureName: string,
    userType: string,
    count: number = 1
  ): Promise<void> {
    await cloudWatchClient.recordCount('FeatureUsage', count, {
      FeatureName: featureName,
      UserType: userType,
    });
  }

  /**
   * Track assessment completion
   * @param assessmentType Type of assessment
   * @param durationSeconds Duration in seconds
   * @param questionCount Number of questions
   */
  async trackAssessmentCompletion(
    assessmentType: string,
    durationSeconds: number,
    questionCount: number
  ): Promise<void> {
    await cloudWatchClient.recordCount('AssessmentCompletions', 1, {
      AssessmentType: assessmentType,
    });

    await cloudWatchClient.recordTiming('AssessmentDuration', durationSeconds * 1000, {
      AssessmentType: assessmentType,
      QuestionCount: questionCount.toString(),
    });
  }

  /**
   * Track intervention creation and updates
   * @param interventionType Type of intervention
   * @param action The action performed (create, update, etc.)
   */
  async trackInterventionActivity(
    interventionType: string,
    action: string
  ): Promise<void> {
    await cloudWatchClient.recordCount('InterventionActivity', 1, {
      InterventionType: interventionType,
      Action: action,
    });
  }

  /**
   * Track institution activity
   * @param activityType Type of activity
   * @param institutionType Type of institution
   * @param count Number of activities (default: 1)
   */
  async trackInstitutionActivity(
    activityType: string,
    institutionType: string,
    count: number = 1
  ): Promise<void> {
    await cloudWatchClient.recordCount('InstitutionActivity', count, {
      ActivityType: activityType,
      InstitutionType: institutionType,
    });
  }

  /**
   * Track training program activity
   * @param programType Type of training program
   * @param action The action performed (start, complete, etc.)
   * @param count Number of activities (default: 1)
   */
  async trackTrainingActivity(
    programType: string,
    action: string,
    count: number = 1
  ): Promise<void> {
    await cloudWatchClient.recordCount('TrainingActivity', count, {
      ProgramType: programType,
      Action: action,
    });
  }

  /**
   * Set up standard alarms
   */
  async setupStandardAlarms(): Promise<void> {
    await cloudWatchClient.createStandardAlarms();
  }

  /**
   * Get the threshold for a resource type
   * @param resourceType Type of resource
   * @returns The threshold value or undefined if not found
   */
  private getThresholdForResource(resourceType: string): number | undefined {
    switch (resourceType.toLowerCase()) {
      case 'cpu':
        return alertThresholds.highCpu;
      case 'memory':
        return alertThresholds.highMemory;
      case 'disk':
        return alertThresholds.diskUsage;
      case 'database':
      case 'databaseconnections':
        return alertThresholds.databaseConnections;
      default:
        return undefined;
    }
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();