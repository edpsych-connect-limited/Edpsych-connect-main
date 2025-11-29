import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import {
  CloudWatchClient as AwsCloudWatchClient,
  PutMetricDataCommand,
  PutMetricAlarmCommand,
  MetricDatum,
  ComparisonOperator,
} from '@aws-sdk/client-cloudwatch';
import { cloudWatchConfig, MetricUnit, alertThresholds } from './cloudwatch-config';

/**
 * Client for publishing metrics to AWS CloudWatch
 */
export class CloudWatchClient {
  private readonly client: AwsCloudWatchClient;
  private readonly enabled: boolean;
  private readonly namespace: string;
  private readonly defaultDimensions: Record<string, string>;

  constructor() {
    this.enabled = cloudWatchConfig.enabled;
    this.namespace = cloudWatchConfig.namespace;
    this.defaultDimensions = cloudWatchConfig.defaultDimensions || {};

    // Only initialize the AWS client if CloudWatch is enabled
    if (this.enabled) {
      this.client = new AwsCloudWatchClient({
        region: cloudWatchConfig.region,
        credentials: cloudWatchConfig.accessKeyId && cloudWatchConfig.secretAccessKey
          ? {
              accessKeyId: cloudWatchConfig.accessKeyId,
              secretAccessKey: cloudWatchConfig.secretAccessKey,
            }
          : undefined, // Use instance role if no credentials provided
      });
    } else {
      // Create a dummy client if CloudWatch is disabled
      this.client = null as any;
    }
  }

  /**
   * Record a count metric
   * @param metricName Name of the metric
   * @param count The count value
   * @param dimensions Additional dimensions for the metric
   */
  async recordCount(
    metricName: string,
    count: number = 1,
    dimensions?: Record<string, string>
  ): Promise<void> {
    await this.publishMetric({
      MetricName: metricName,
      Unit: MetricUnit.COUNT,
      Value: count,
      Dimensions: this.formatDimensions({ ...this.defaultDimensions, ...dimensions }),
    });
  }

  /**
   * Record a timing metric
   * @param metricName Name of the metric
   * @param milliseconds The timing value in milliseconds
   * @param dimensions Additional dimensions for the metric
   */
  async recordTiming(
    metricName: string,
    milliseconds: number,
    dimensions?: Record<string, string>
  ): Promise<void> {
    await this.publishMetric({
      MetricName: metricName,
      Unit: MetricUnit.MILLISECONDS,
      Value: milliseconds,
      Dimensions: this.formatDimensions({ ...this.defaultDimensions, ...dimensions }),
    });
  }

  /**
   * Record a gauge metric
   * @param metricName Name of the metric
   * @param value The gauge value
   * @param unit The unit of the gauge (default: Percent)
   * @param dimensions Additional dimensions for the metric
   */
  async recordGauge(
    metricName: string,
    value: number,
    unit: MetricUnit = MetricUnit.PERCENT,
    dimensions?: Record<string, string>
  ): Promise<void> {
    await this.publishMetric({
      MetricName: metricName,
      Unit: unit,
      Value: value,
      Dimensions: this.formatDimensions({ ...this.defaultDimensions, ...dimensions }),
    });
  }

  /**
   * Create or update a CloudWatch alarm for a metric
   * @param metricName Name of the metric
   * @param threshold Threshold value for the alarm
   * @param comparisonOperator How to compare the metric to the threshold
   * @param evaluationPeriods Number of periods to evaluate
   * @param alarmName Name for the alarm
   * @param dimensions Dimensions for the metric
   */
  async createAlarm(
    metricName: string,
    threshold: number,
    comparisonOperator: ComparisonOperator = ComparisonOperator.GreaterThanThreshold,
    evaluationPeriods: number = 1,
    alarmName?: string,
    dimensions?: Record<string, string>
  ): Promise<void> {
    if (!this.enabled || !cloudWatchConfig.alarmSnsTopicArn) {
      return;
    }

    try {
      const formattedDimensions = this.formatDimensions({ 
        ...this.defaultDimensions,
        ...dimensions 
      });

      const command = new PutMetricAlarmCommand({
        AlarmName: alarmName || `${this.namespace}-${metricName}-Alarm`,
        AlarmDescription: `Alarm for ${metricName}`,
        ActionsEnabled: true,
        OKActions: [cloudWatchConfig.alarmSnsTopicArn],
        AlarmActions: [cloudWatchConfig.alarmSnsTopicArn],
        MetricName: metricName,
        Namespace: this.namespace,
        Statistic: 'Average',
        Dimensions: formattedDimensions,
        Period: 60, // 1 minute
        EvaluationPeriods: evaluationPeriods,
        Threshold: threshold,
        ComparisonOperator: comparisonOperator,
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Failed to create alarm for ${metricName}:`, error);
    }
  }

  /**
   * Create standard alarms based on configured thresholds
   */
  async createStandardAlarms(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    // CPU usage alarm
    await this.createAlarm(
      'CpuUsage',
      alertThresholds.highCpu,
      ComparisonOperator.GreaterThanThreshold,
      3, // 3 consecutive periods
      `${this.namespace}-HighCpuUsage-Alarm`
    );

    // Memory usage alarm
    await this.createAlarm(
      'MemoryUsage',
      alertThresholds.highMemory,
      ComparisonOperator.GreaterThanThreshold,
      3, // 3 consecutive periods
      `${this.namespace}-HighMemoryUsage-Alarm`
    );

    // API latency alarm
    await this.createAlarm(
      'ApiLatency',
      alertThresholds.apiLatency,
      ComparisonOperator.GreaterThanThreshold,
      2, // 2 consecutive periods
      `${this.namespace}-HighApiLatency-Alarm`
    );

    // Error rate alarm
    await this.createAlarm(
      'ErrorRate',
      alertThresholds.errorRate,
      ComparisonOperator.GreaterThanThreshold,
      1, // 1 period (immediate alert)
      `${this.namespace}-HighErrorRate-Alarm`
    );

    // Database connections alarm
    await this.createAlarm(
      'DatabaseConnections',
      alertThresholds.databaseConnections,
      ComparisonOperator.GreaterThanThreshold,
      2, // 2 consecutive periods
      `${this.namespace}-HighDatabaseConnections-Alarm`
    );

    // Disk usage alarm
    await this.createAlarm(
      'DiskUsage',
      alertThresholds.diskUsage,
      ComparisonOperator.GreaterThanThreshold,
      3, // 3 consecutive periods
      `${this.namespace}-HighDiskUsage-Alarm`
    );
  }

  /**
   * Publish a metric to CloudWatch
   * @param metricDatum The metric data to publish
   */
  private async publishMetric(metricDatum: MetricDatum): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: [metricDatum],
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Failed to publish metric ${metricDatum.MetricName}:`, error);
    }
  }

  /**
   * Format dimensions for CloudWatch
   * @param dimensions The dimensions to format
   */
  private formatDimensions(dimensions: Record<string, string> = {}): { Name: string; Value: string }[] {
    return Object.entries(dimensions).map(([name, value]) => ({
      Name: name,
      Value: value,
    }));
  }
}

// Singleton instance
export const cloudWatchClient = new CloudWatchClient();