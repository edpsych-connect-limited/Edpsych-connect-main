/**
 * @fileoverview Ethics Monitor Model
 * 
 * Core data model for the continuous ethics monitoring system.
 * Tracks ethical metrics, thresholds, and monitoring configurations.
 */

export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: string;
  [key: string]: any;
}

export interface Threshold {
  type: 'max' | 'min' | 'equals' | 'not_equals';
  value: number | string | boolean;
}

export interface NotificationTarget {
  channel: 'email' | 'slack' | 'webhook' | 'in-app';
  recipient: string;
}

export interface EthicsMonitorOptions {
  id?: string | null;
  name: string;
  description: string;
  metrics?: Metric[];
  thresholds?: Record<string, Threshold>;
  enabled?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastRunAt?: Date | string | null;
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  notificationTargets?: NotificationTarget[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  metadata?: Record<string, any>;
}

export class EthicsMonitor {
  id: string | null;
  name: string;
  description: string;
  metrics: Metric[];
  thresholds: Record<string, Threshold>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt: Date | null;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  notificationTargets: NotificationTarget[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  metadata: Record<string, any>;

  constructor({
    id = null,
    name,
    description,
    metrics = [],
    thresholds = {},
    enabled = true,
    createdAt = new Date(),
    updatedAt = new Date(),
    lastRunAt = null,
    frequency = 'daily',
    notificationTargets = [],
    severity = 'medium',
    tags = [],
    metadata = {}
  }: EthicsMonitorOptions) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.metrics = metrics;
    this.thresholds = thresholds;
    this.enabled = enabled;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.lastRunAt = lastRunAt ? (lastRunAt instanceof Date ? lastRunAt : new Date(lastRunAt)) : null;
    this.frequency = frequency;
    this.notificationTargets = notificationTargets;
    this.severity = severity;
    this.tags = tags;
    this.metadata = metadata;
  }

  /**
   * Validates if the current configuration is valid
   * @returns {boolean} True if valid, false otherwise
   */
  isValid(): boolean {
    // Basic validation
    if (!this.name || !this.description) return false;
    if (!this.metrics || this.metrics.length === 0) return false;
    
    // Validate thresholds exist for all metrics
    for (const metric of this.metrics) {
      if (!this.thresholds[metric.id]) return false;
    }
    
    return true;
  }

  /**
   * Determines if a specific metric value exceeds its threshold
   * @param {string} metricId - ID of the metric to check
   * @param {number} value - Current value to check against threshold
   * @returns {boolean} True if threshold is exceeded
   */
  isThresholdExceeded(metricId: string, value: any): boolean {
    if (!this.thresholds[metricId]) return false;
    
    const threshold = this.thresholds[metricId];
    const { type, value: thresholdValue } = threshold;
    
    switch (type) {
      case 'max':
        return value > thresholdValue;
      case 'min':
        return value < thresholdValue;
      case 'equals':
        return value === thresholdValue;
      case 'not_equals':
        return value !== thresholdValue;
      default:
        return false;
    }
  }

  /**
   * Serializes the monitor to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      metrics: this.metrics,
      thresholds: this.thresholds,
      enabled: this.enabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastRunAt: this.lastRunAt,
      frequency: this.frequency,
      notificationTargets: this.notificationTargets,
      severity: this.severity,
      tags: this.tags,
      metadata: this.metadata
    };
  }
}
