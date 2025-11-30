/**
 * @fileoverview Ethics Anomaly Detector
 * 
 * Utility for detecting anomalies in ethical metrics using various
 * statistical methods and machine learning techniques.
 */
// Logger available for future use: import { logger } from '@/lib/logger';

class EthicsAnomalyDetector {
  constructor({
    method = 'zscore', // 'zscore', 'iqr', 'moving_average', 'ml'
    sensitivity = 'medium', // 'low', 'medium', 'high'
    historySize = 100, // Number of data points to consider for history
    logger = console
  }) {
    this.method = method;
    this.sensitivity = sensitivity;
    this.historySize = historySize;
    this.logger = logger;
    
    // Set sensitivity thresholds based on selected sensitivity
    this.thresholds = this.getSensitivityThresholds(sensitivity);
  }

  /**
   * Detect anomalies in a metric value
   * @param {Array} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {Object} options - Additional options for detection
   * @returns {Object} Detection result with anomaly status and details
   */
  detectAnomaly(history, currentValue, options = {}) {
    try {
      // Ensure we have enough history
      if (!history || history.length < 3) {
        return {
          isAnomaly: false,
          confidence: 0,
          message: 'Insufficient historical data for anomaly detection',
          details: {
            method: this.method,
            threshold: this.thresholds,
            historySize: history ? history.length : 0,
            currentValue
          }
        };
      }
      
      // Select the appropriate detection method
      let result;
      switch (this.method) {
        case 'zscore':
          result = this.detectWithZScore(history, currentValue, options);
          break;
        case 'iqr':
          result = this.detectWithIQR(history, currentValue, options);
          break;
        case 'moving_average':
          result = this.detectWithMovingAverage(history, currentValue, options);
          break;
        case 'ml':
          result = this.detectWithML(history, currentValue, options);
          break;
        default:
          result = this.detectWithZScore(history, currentValue, options);
      }
      
      return result;
    } catch (_error) {
      this.logger.error('Error detecting anomaly', error);
      return {
        isAnomaly: false,
        confidence: 0,
        message: `Error in anomaly detection: ${error.message}`,
        details: {
          method: this.method,
          threshold: this.thresholds,
          error: error.message
        }
      };
    }
  }

  /**
   * Detect anomalies using Z-Score method
   * @param {Array} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {Object} options - Additional options for detection
   * @returns {Object} Detection result with anomaly status and details
   * @private
   */
  detectWithZScore(history, currentValue, _options = {}) {
    // Calculate mean and standard deviation
    const mean = this.calculateMean(history);
    const stdDev = this.calculateStandardDeviation(history, mean);
    
    // If stdDev is 0 or very small, we can't effectively use Z-Score
    if (stdDev < 0.0001) {
      return {
        isAnomaly: Math.abs(currentValue - mean) > 0.001, // Use a small threshold
        confidence: Math.abs(currentValue - mean) > 0.001 ? 0.8 : 0,
        message: stdDev < 0.0001 ? 'Standard deviation is too small for Z-Score method' : 'Value is within normal range',
        details: {
          method: 'zscore',
          mean,
          stdDev,
          currentValue,
          threshold: this.thresholds.zscore
        }
      };
    }
    
    // Calculate Z-Score
    const zScore = (currentValue - mean) / stdDev;
    const absZScore = Math.abs(zScore);
    
    // Determine if it's an anomaly based on threshold
    const isAnomaly = absZScore > this.thresholds.zscore;
    
    // Calculate confidence based on how far beyond the threshold
    const confidence = isAnomaly ? Math.min(0.5 + (absZScore - this.thresholds.zscore) / 10, 1) : 0;
    
    return {
      isAnomaly,
      confidence,
      message: isAnomaly ? `Value has Z-Score of ${zScore.toFixed(2)}, which exceeds threshold ${this.thresholds.zscore}` : 'Value is within normal range',
      details: {
        method: 'zscore',
        mean,
        stdDev,
        zScore,
        threshold: this.thresholds.zscore,
        currentValue
      }
    };
  }

  /**
   * Detect anomalies using Interquartile Range (IQR) method
   * @param {Array} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {Object} options - Additional options for detection
   * @returns {Object} Detection result with anomaly status and details
   * @private
   */
  detectWithIQR(history, currentValue, _options = {}) {
    // Sort the history
    const sortedHistory = [...history].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1 = this.calculatePercentile(sortedHistory, 25);
    const q3 = this.calculatePercentile(sortedHistory, 75);
    const iqr = q3 - q1;
    
    // Calculate upper and lower bounds
    const lowerBound = q1 - (iqr * this.thresholds.iqr);
    const upperBound = q3 + (iqr * this.thresholds.iqr);
    
    // Determine if it's an anomaly
    const isAnomaly = currentValue < lowerBound || currentValue > upperBound;
    
    // Calculate confidence
    let confidence = 0;
    if (isAnomaly) {
      const distance = Math.max(currentValue - upperBound, lowerBound - currentValue);
      confidence = Math.min(0.5 + (distance / iqr) / 2, 1);
    }
    
    return {
      isAnomaly,
      confidence,
      message: isAnomaly ? `Value ${currentValue} is outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]` : 'Value is within normal range',
      details: {
        method: 'iqr',
        q1,
        q3,
        iqr,
        lowerBound,
        upperBound,
        threshold: this.thresholds.iqr,
        currentValue
      }
    };
  }

  /**
   * Detect anomalies using Moving Average method
   * @param {Array} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {Object} options - Additional options for detection
   * @returns {Object} Detection result with anomaly status and details
   * @private
   */
  detectWithMovingAverage(history, currentValue, options = {}) {
    const windowSize = options.windowSize || Math.min(10, history.length);
    const recentHistory = history.slice(-windowSize);
    
    // Calculate moving average
    const movingAvg = this.calculateMean(recentHistory);
    
    // Calculate standard deviation of recent history
    const stdDev = this.calculateStandardDeviation(recentHistory, movingAvg);
    
    // Calculate deviation from moving average
    const deviation = Math.abs(currentValue - movingAvg);
    
    // If stdDev is very small, use absolute difference
    if (stdDev < 0.0001) {
      const isAnomaly = deviation > 0.1; // Use a small threshold for near-constant data
      return {
        isAnomaly,
        confidence: isAnomaly ? 0.8 : 0,
        message: isAnomaly ? `Value ${currentValue} deviates significantly from recent average ${movingAvg.toFixed(2)}` : 'Value is within normal range',
        details: {
          method: 'moving_average',
          movingAvg,
          deviation,
          windowSize,
          currentValue
        }
      };
    }
    
    // Normalize deviation by standard deviation
    const normalizedDeviation = deviation / stdDev;
    
    // Determine if it's an anomaly
    const isAnomaly = normalizedDeviation > this.thresholds.movingAverage;
    
    // Calculate confidence
    const confidence = isAnomaly ? Math.min(0.5 + (normalizedDeviation - this.thresholds.movingAverage) / 10, 1) : 0;
    
    return {
      isAnomaly,
      confidence,
      message: isAnomaly ? `Value deviates ${normalizedDeviation.toFixed(2)} standard deviations from recent average` : 'Value is within normal range',
      details: {
        method: 'moving_average',
        movingAvg,
        stdDev,
        deviation,
        normalizedDeviation,
        threshold: this.thresholds.movingAverage,
        windowSize,
        currentValue
      }
    };
  }

  /**
   * Detect anomalies using Machine Learning method
   * This is a placeholder for ML-based anomaly detection
   * @param {Array} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {Object} options - Additional options for detection
   * @returns {Object} Detection result with anomaly status and details
   * @private
   */
  detectWithML(history, currentValue, options = {}) {
    // This would typically involve a more complex ML model
    // For demonstration, we'll use a simple ensemble of other methods
    
    const results = [
      this.detectWithZScore(history, currentValue, options),
      this.detectWithIQR(history, currentValue, options),
      this.detectWithMovingAverage(history, currentValue, options)
    ];
    
    // Count anomalies and calculate average confidence
    const anomalyCount = results.filter(r => r.isAnomaly).length;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    // Determine if it's an anomaly based on ensemble voting
    const isAnomaly = anomalyCount >= 2 || (anomalyCount === 1 && averageConfidence > 0.7);
    
    return {
      isAnomaly,
      confidence: isAnomaly ? averageConfidence : 0,
      message: isAnomaly ? `Ensemble detected anomaly with ${anomalyCount} methods agreeing` : 'Value is within normal range',
      details: {
        method: 'ml_ensemble',
        anomalyCount,
        averageConfidence,
        methodResults: results.map(r => ({
          method: r.details.method,
          isAnomaly: r.isAnomaly,
          confidence: r.confidence
        })),
        currentValue
      }
    };
  }

  /**
   * Get sensitivity thresholds based on selected sensitivity
   * @param {string} sensitivity - Sensitivity level ('low', 'medium', 'high')
   * @returns {Object} Thresholds for different detection methods
   * @private
   */
  getSensitivityThresholds(sensitivity) {
    switch (sensitivity.toLowerCase()) {
      case 'low':
        return {
          zscore: 3.0,      // 99.7% of normal distribution
          iqr: 2.0,         // 2 times IQR for outliers
          movingAverage: 4.0 // 4 standard deviations from moving average
        };
      case 'medium':
        return {
          zscore: 2.5,      // 99% of normal distribution
          iqr: 1.5,         // 1.5 times IQR for outliers (standard)
          movingAverage: 3.0 // 3 standard deviations from moving average
        };
      case 'high':
        return {
          zscore: 2.0,      // 95% of normal distribution
          iqr: 1.0,         // 1 times IQR for outliers (sensitive)
          movingAverage: 2.0 // 2 standard deviations from moving average
        };
      default:
        return {
          zscore: 2.5,
          iqr: 1.5,
          movingAverage: 3.0
        };
    }
  }

  /**
   * Calculate the mean of an array of numbers
   * @param {Array<number>} values - Array of numerical values
   * @returns {number} The mean value
   * @private
   */
  calculateMean(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Calculate the standard deviation of an array of numbers
   * @param {Array<number>} values - Array of numerical values
   * @param {number} mean - The mean of the values (optional)
   * @returns {number} The standard deviation
   * @private
   */
  calculateStandardDeviation(values, mean = null) {
    if (!values || values.length <= 1) return 0;
    
    const avg = mean !== null ? mean : this.calculateMean(values);
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    
    const avgSquareDiff = this.calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate a percentile of an array of numbers
   * @param {Array<number>} sortedValues - Sorted array of numerical values
   * @param {number} percentile - The percentile to calculate (0-100)
   * @returns {number} The percentile value
   * @private
   */
  calculatePercentile(sortedValues, percentile) {
    if (!sortedValues || sortedValues.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sortedValues[lower];
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Configure the detector with new settings
   * @param {Object} config - Configuration options
   * @returns {EthicsAnomalyDetector} This detector instance
   */
  configure(config = {}) {
    if (config.method) this.method = config.method;
    if (config.sensitivity) {
      this.sensitivity = config.sensitivity;
      this.thresholds = this.getSensitivityThresholds(config.sensitivity);
    }
    if (config.historySize) this.historySize = config.historySize;
    
    return this;
  }
}

module.exports = EthicsAnomalyDetector;