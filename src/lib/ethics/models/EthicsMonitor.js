/**
 * @fileoverview Ethics Monitor Model
 * 
 * Core data model for the continuous ethics monitoring system.
 * Tracks ethical metrics, thresholds, and monitoring configurations.
 */

class EthicsMonitor {
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
    frequency = 'daily', // 'hourly', 'daily', 'weekly', 'monthly'
    notificationTargets = [],
    severity = 'medium', // 'low', 'medium', 'high', 'critical'
    tags = [],
    metadata = {}
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.metrics = metrics;
    this.thresholds = thresholds;
    this.enabled = enabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastRunAt = lastRunAt;
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
  isValid() {
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
  isThresholdExceeded(metricId, value) {
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
  toJSON() {
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

  /**
   * Creates an instance from a plain object
   * @param {Object} data - Plain object representation
   * @returns {EthicsMonitor} New instance
   */
  static fromJSON(data) {
    return new EthicsMonitor({
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      lastRunAt: data.lastRunAt ? new Date(data.lastRunAt) : null
    });
  }
}

module.exports = EthicsMonitor;