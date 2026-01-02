/**
 * @fileoverview Ethics Anomaly Detector
 * 
 * Utility for detecting anomalies in ethical metrics using various
 * statistical methods and machine learning techniques.
 */

export type DetectionMethod = 'zscore' | 'iqr' | 'moving_average' | 'ml';
export type SensitivityLevel = 'low' | 'medium' | 'high';

export interface AnomalyDetectorOptions {
  method?: DetectionMethod;
  sensitivity?: SensitivityLevel;
  historySize?: number;
  logger?: any;
}

export interface DetectionResult {
  isAnomaly: boolean;
  confidence: number;
  message: string;
  details: {
    method: string;
    threshold?: any;
    historySize?: number;
    currentValue: number;
    mean?: number;
    stdDev?: number;
    zScore?: number;
    q1?: number;
    q3?: number;
    iqr?: number;
    lowerBound?: number;
    upperBound?: number;
    movingAvg?: number;
    deviation?: number;
    normalizedDeviation?: number;
    windowSize?: number;
    error?: string;
    anomalyCount?: number;
    averageConfidence?: number;
    methodResults?: Array<{
      method: string;
      isAnomaly: boolean;
      confidence: number;
    }>;
  };
}

export interface DetectionOptions {
  windowSize?: number;
  [key: string]: any;
}

export class EthicsAnomalyDetector {
  method: DetectionMethod;
  sensitivity: SensitivityLevel;
  historySize: number;
  logger: any;
  thresholds: any;

  constructor({
    method = 'zscore',
    sensitivity = 'medium',
    historySize = 100,
    logger = console
  }: AnomalyDetectorOptions = {}) {
    this.method = method;
    this.sensitivity = sensitivity;
    this.historySize = historySize;
    this.logger = logger;
    
    // Set sensitivity thresholds based on selected sensitivity
    this.thresholds = this.getSensitivityThresholds(sensitivity);
  }

  /**
   * Detect anomalies in a metric value
   * @param {Array<number>} history - Historical values of the metric
   * @param {number} currentValue - Current value to check for anomaly
   * @param {DetectionOptions} options - Additional options for detection
   * @returns {DetectionResult} Detection result with anomaly status and details
   */
  detectAnomaly(history: number[], currentValue: number, options: DetectionOptions = {}): DetectionResult {
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
      let result: DetectionResult;
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
    } catch (error: any) {
      this.logger.error('Error detecting anomaly', error);
      return {
        isAnomaly: false,
        confidence: 0,
        message: `Error in anomaly detection: ${error.message}`,
        details: {
          method: this.method,
          threshold: this.thresholds,
          currentValue,
          error: error.message
        }
      };
    }
  }

  /**
   * Detect anomalies using Z-Score method
   */
  private detectWithZScore(history: number[], currentValue: number, _options: DetectionOptions = {}): DetectionResult {
    // Calculate mean and standard deviation
    const mean = this.calculateMean(history);
    const stdDev = this.calculateStandardDeviation(history, mean);
    
    // If stdDev is 0 or very small, we can't effectively use Z-Score
    if (stdDev < 0.0001) {
      const isAnomaly = Math.abs(currentValue - mean) > 0.001;
      return {
        isAnomaly,
        confidence: isAnomaly ? 0.8 : 0,
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
   */
  private detectWithIQR(history: number[], currentValue: number, _options: DetectionOptions = {}): DetectionResult {
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
   */
  private detectWithMovingAverage(history: number[], currentValue: number, options: DetectionOptions = {}): DetectionResult {
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
   */
  private detectWithML(history: number[], currentValue: number, options: DetectionOptions = {}): DetectionResult {
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
   */
  private getSensitivityThresholds(sensitivity: SensitivityLevel): any {
    switch (sensitivity) {
      case 'low':
        return {
          zscore: 3.5, // Higher threshold = less sensitive
          iqr: 2.5,
          movingAverage: 3.5
        };
      case 'high':
        return {
          zscore: 2.0, // Lower threshold = more sensitive
          iqr: 1.2,
          movingAverage: 2.0
        };
      case 'medium':
      default:
        return {
          zscore: 3.0,
          iqr: 1.5,
          movingAverage: 3.0
        };
    }
  }

  /**
   * Calculate mean of an array of numbers
   */
  private calculateMean(data: number[]): number {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }

  /**
   * Calculate standard deviation of an array of numbers
   */
  private calculateStandardDeviation(data: number[], mean: number): number {
    if (!data || data.length < 2) return 0;
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = this.calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate percentile of an array of numbers
   */
  private calculatePercentile(sortedData: number[], percentile: number): number {
    if (!sortedData || sortedData.length === 0) return 0;
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= sortedData.length) return sortedData[lower];
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }
}
