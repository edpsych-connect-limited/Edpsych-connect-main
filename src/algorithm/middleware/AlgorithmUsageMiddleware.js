/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import AlgorithmUsageService from '../services/AlgorithmUsageService';
import { getPerformanceMetrics } from '../../utils/performance';

/**
 * Middleware for algorithm usage tracking and license enforcement
 * 
 * This middleware provides functions to:
 * 1. Check license validity before algorithm execution
 * 2. Track usage statistics during execution
 * 3. Record performance metrics
 * 4. Handle proper error tracking and reporting
 */
class AlgorithmUsageMiddleware {
  /**
   * Create middleware for a specific algorithm execution
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.algorithmId - ID of the algorithm being executed
   * @param {string} options.versionId - Version ID of the algorithm
   * @param {string} options.licenseId - ID of the license being used
   * @param {string} options.institutionId - ID of the institution making the request
   * @param {string} options.userId - ID of the user making the request
   * @param {string} [options.departmentId] - Optional department ID
   * @param {boolean} [options.enforceUsageLimits=true] - Whether to enforce usage limits
   * @param {boolean} [options.trackPerformance=true] - Whether to track performance metrics
   * @param {boolean} [options.trackErrors=true] - Whether to track and report errors
   */
  constructor(options) {
    this.options = {
      enforceUsageLimits: true,
      trackPerformance: true,
      trackErrors: true,
      ...options
    };

    this.metrics = {
      startTime: null,
      endTime: null,
      cpuUsage: null,
      memoryUsage: null,
      executionTime: null
    };

    this.executionStatus = {
      resultStatus: 'pending',
      errorMessage: null,
      errorType: null
    };

    this.licenseValidated = false;
  }

  /**
   * Check if license is valid for algorithm execution
   * 
   * @returns {Promise<boolean>} - Whether the license is valid
   * @throws {Error} If license is invalid
   */
  async validateLicense() {
    try {
      if (!this.options.licenseId) {
        throw new Error('No license ID provided');
      }

      if (!this.options.algorithmId) {
        throw new Error('No algorithm ID provided');
      }

      if (!this.options.institutionId) {
        throw new Error('No institution ID provided');
      }

      // Check license validity
      const licenseCheck = await AlgorithmUsageService.checkLicenseValidity(
        this.options.licenseId,
        this.options.algorithmId,
        this.options.institutionId
      );

      if (!licenseCheck.valid) {
        throw new Error(`License invalid: ${licenseCheck.reason}`);
      }

      // If usage limits should be enforced, check if there's remaining usage
      if (this.options.enforceUsageLimits && licenseCheck.licenseType === 'per_use') {
        if (licenseCheck.usageRemaining <= 0) {
          throw new Error('Usage limit exceeded for this license');
        }
      }

      // License is valid
      this.licenseValidated = true;
      return true;
    } catch (_error) {
      this.executionStatus.resultStatus = 'error';
      this.executionStatus.errorMessage = error.message;
      this.executionStatus.errorType = 'LicenseValidationError';

      // Record the validation failure if tracking is enabled
      if (this.options.trackErrors) {
        await this.recordUsage();
      }

      throw error;
    }
  }

  /**
   * Middleware function to run before algorithm execution
   * 
   * @returns {Promise<void>}
   */
  async beforeExecution() {
    // Validate license before execution
    await this.validateLicense();

    // Start tracking execution time
    this.metrics.startTime = performance.now();

    // Capture initial resource usage if performance tracking is enabled
    if (this.options.trackPerformance) {
      const initialMetrics = getPerformanceMetrics();
      this.metrics.initialCpuUsage = initialMetrics.cpuUsage;
      this.metrics.initialMemoryUsage = initialMetrics.memoryUsage;
    }
  }

  /**
   * Middleware function to run after algorithm execution
   * 
   * @param {Object} result - The result of the algorithm execution
   * @returns {Promise<Object>} - The original result
   */
  async afterExecution(result) {
    // Record end time
    this.metrics.endTime = performance.now();
    this.metrics.executionTime = Math.round(this.metrics.endTime - this.metrics.startTime);

    // Capture final resource usage if performance tracking is enabled
    if (this.options.trackPerformance) {
      const finalMetrics = getPerformanceMetrics();
      this.metrics.cpuUsage = finalMetrics.cpuUsage - this.metrics.initialCpuUsage;
      this.metrics.memoryUsage = finalMetrics.memoryUsage - this.metrics.initialMemoryUsage;
    }

    // Update execution status
    this.executionStatus.resultStatus = 'success';

    // Record the successful usage
    await this.recordUsage();

    return result;
  }

  /**
   * Error handler for algorithm execution
   * 
   * @param {Error} error - The error that occurred during execution
   * @throws {Error} The original error after recording usage
   */
  async handleError(error) {
    // Record end time
    this.metrics.endTime = performance.now();
    this.metrics.executionTime = Math.round(this.metrics.endTime - this.metrics.startTime);

    // Update execution status
    this.executionStatus.resultStatus = 'error';
    this.executionStatus.errorMessage = error.message;
    this.executionStatus.errorType = error.name || 'ExecutionError';

    // Record the failed usage if tracking is enabled
    if (this.options.trackErrors) {
      await this.recordUsage();
    }

    // Re-throw the original error
    throw error;
  }

  /**
   * Record algorithm usage after execution or error
   * 
   * @returns {Promise<Object>} Usage record result
   */
  async recordUsage() {
    try {
      // Don't record if license validation failed and we're not tracking errors
      if (!this.licenseValidated && !this.options.trackErrors) {
        return null;
      }

      // Prepare usage data
      const usageData = {
        algorithmId: this.options.algorithmId,
        algorithmVersionId: this.options.versionId,
        institutionId: this.options.institutionId,
        userId: this.options.userId,
        licenseId: this.options.licenseId,
        departmentId: this.options.departmentId,
        executionTime: this.metrics.executionTime || 0,
        cpuUsage: this.metrics.cpuUsage,
        memoryUsage: this.metrics.memoryUsage,
        resultStatus: this.executionStatus.resultStatus,
        errorMessage: this.executionStatus.errorMessage,
        errorType: this.executionStatus.errorType,
        deviceType: this.options.deviceType,
        browserInfo: this.options.browserInfo,
        ipAddress: this.options.ipAddress,
        geolocation: this.options.geolocation,
        inputContext: this.options.inputContext
      };

      // Record usage via the service
      return await AlgorithmUsageService.recordUsage(usageData);
    } catch (_error) {
      // Log but don't throw errors from usage recording
      console.error('Failed to record algorithm usage:', error);
      return null;
    }
  }

  /**
   * Wrap a function with execution tracking
   * 
   * @param {Function} fn - The function to wrap with tracking
   * @returns {Function} Wrapped function
   */
  wrapExecution(fn) {
    return async (...args) => {
      try {
        // Run pre-execution middleware
        await this.beforeExecution();

        // Execute the original function
        const result = await fn(...args);

        // Run post-execution middleware
        return await this.afterExecution(result);
      } catch (_error) {
        // Handle any errors
        await this.handleError(error);
      }
    };
  }

  /**
   * Create middleware for Express.js
   * 
   * @returns {Function} Express middleware function
   */
  createExpressMiddleware() {
    return async (req, res, next) => {
      try {
        // Extract required information from request
        const { algorithmId, versionId } = req.params;
        const { licenseId, institutionId, userId, departmentId } = req.body;

        // Update options with request-specific values
        this.options = {
          ...this.options,
          algorithmId,
          versionId,
          licenseId,
          institutionId,
          userId,
          departmentId,
          ipAddress: req.ip,
          deviceType: req.headers['user-agent'] ? this.detectDeviceType(req.headers['user-agent']) : 'unknown',
          browserInfo: req.headers['user-agent'] || 'unknown',
          inputContext: req.body.input ? this.anonymizeInput(req.body.input) : null
        };

        // Run pre-execution middleware
        await this.beforeExecution();

        // Store the original end method
        const originalEnd = res.end;

        // Override the end method to track the response
        res.end = async function(chunk, encoding) {
          // Restore original end method
          res.end = originalEnd;
          
          // Call the original end method
          res.end(chunk, encoding);

          // Check if this was a successful response
          const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

          // Update execution status
          this.executionStatus.resultStatus = isSuccess ? 'success' : 'error';
          
          if (!isSuccess) {
            this.executionStatus.errorMessage = 'HTTP error ' + res.statusCode;
            this.executionStatus.errorType = 'HTTPError';
          }

          // Record usage
          await this.recordUsage();
        }.bind(this);

        // Continue to the next middleware
        next();
      } catch (_error) {
        // Handle errors in the middleware itself
        await this.handleError(error);
        res.status(403).json({ error: error.message });
      }
    };
  }

  /**
   * Detect device type from user agent string
   * 
   * @param {string} userAgent - User agent string
   * @returns {string} Device type
   */
  detectDeviceType(userAgent) {
    if (/mobile/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/i.test(userAgent)) {
      return 'tablet';
    } else if (/bot|crawler|spider|crawling/i.test(userAgent)) {
      return 'bot';
    } else {
      return 'desktop';
    }
  }

  /**
   * Create an anonymized version of input data for usage tracking
   * 
   * @param {Object} input - Original input data
   * @returns {Object} - Anonymized context information
   */
  anonymizeInput(input) {
    // This is a simplified implementation
    // In a real system, this would perform proper anonymization
    const context = {};
    
    if (Array.isArray(input)) {
      context.type = 'array';
      context.length = input.length;
    } else if (typeof input === 'object' && input !== null) {
      context.type = 'object';
      context.keys = Object.keys(input);
    } else {
      context.type = typeof input;
    }
    
    return context;
  }
}

/**
 * Create middleware for a specific algorithm execution
 * 
 * @param {Object} options - Configuration options
 * @returns {AlgorithmUsageMiddleware} Middleware instance
 */
export function createAlgorithmUsageMiddleware(options) {
  return new AlgorithmUsageMiddleware(options);
}

/**
 * Higher-order function to track algorithm execution
 * 
 * @param {Function} fn - Algorithm function to track
 * @param {Object} options - Tracking options
 * @returns {Function} Wrapped function with tracking
 */
export function withUsageTracking(fn, options) {
  return async (...args) => {
    const middleware = new AlgorithmUsageMiddleware(options);
    try {
      await middleware.beforeExecution();
      const result = await fn(...args);
      return await middleware.afterExecution(result);
    } catch (_error) {
      await middleware.handleError(error);
    }
  };
}

export default AlgorithmUsageMiddleware;