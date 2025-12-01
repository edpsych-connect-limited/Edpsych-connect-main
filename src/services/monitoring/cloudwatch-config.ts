/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { config as _config } from '../../config';

export interface CloudWatchConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  namespace: string;
  enabled: boolean;
  logRetentionDays: number;
  alarmSnsTopicArn?: string;
  defaultDimensions?: Record<string, string>;
}

/**
 * CloudWatch configuration settings
 * These can be loaded from environment variables in a real deployment
 */
export const cloudWatchConfig: CloudWatchConfig = {
  region: process.env.AWS_REGION || 'eu-west-2', // Default to London region for UK focus
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  namespace: process.env.CLOUDWATCH_NAMESPACE || 'EdPsych/Connect',
  enabled: process.env.ENABLE_CLOUDWATCH === 'true',
  logRetentionDays: parseInt(process.env.CLOUDWATCH_LOG_RETENTION_DAYS || '30', 10),
  alarmSnsTopicArn: process.env.CLOUDWATCH_ALARM_SNS_TOPIC_ARN,
  defaultDimensions: {
    Environment: process.env.NODE_ENV || 'development',
    Service: 'EdPsychConnect',
    Version: process.env.APP_VERSION || '1.0.0',
  },
};

export const alertThresholds = {
  highCpu: 80, // Alert when CPU usage exceeds 80%
  highMemory: 85, // Alert when memory usage exceeds 85%
  apiLatency: 2000, // Alert when API response time exceeds 2 seconds (in ms)
  errorRate: 5, // Alert when error rate exceeds 5%
  databaseConnections: 80, // Alert when DB connections exceed 80% of pool limit
  diskUsage: 85, // Alert when disk usage exceeds 85%
};

export enum MetricName {
  API_REQUEST = 'ApiRequest',
  API_LATENCY = 'ApiLatency',
  API_ERROR = 'ApiError',
  DATABASE_QUERY = 'DatabaseQuery',
  DATABASE_QUERY_LATENCY = 'DatabaseQueryLatency',
  DATABASE_ERROR = 'DatabaseError',
  MEMORY_USAGE = 'MemoryUsage',
  CPU_USAGE = 'CpuUsage',
  AUTH_SUCCESS = 'AuthSuccess',
  AUTH_FAILURE = 'AuthFailure',
  ACTIVE_USERS = 'ActiveUsers',
  SUBSCRIPTION_CREATED = 'SubscriptionCreated',
  SUBSCRIPTION_CANCELLED = 'SubscriptionCancelled',
  ASSESSMENT_COMPLETED = 'AssessmentCompleted',
  INTERVENTION_CREATED = 'InterventionCreated',
  ERROR_COUNT = 'ErrorCount',
}

export enum MetricUnit {
  COUNT = 'Count',
  MILLISECONDS = 'Milliseconds',
  BYTES = 'Bytes',
  PERCENT = 'Percent',
  SECONDS = 'Seconds',
}

export enum Dimension {
  ENDPOINT = 'Endpoint',
  STATUS_CODE = 'StatusCode',
  USER_ROLE = 'UserRole',
  SUBSCRIPTION_TIER = 'SubscriptionTier',
  INSTITUTION = 'Institution',
  ASSESSMENT_TYPE = 'AssessmentType',
  ERROR_TYPE = 'ErrorType',
  COMPONENT = 'Component',
}
