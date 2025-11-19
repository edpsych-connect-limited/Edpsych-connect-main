/**
 * Validation Service
 * Orchestrates code validation across the enterprise platform
 *
 * @module ValidationService
 */

import CodeValidator from './codeValidator';
import { logger } from './logger';

/**
 * Validation options
 */
interface ValidationOptions {
  strictMode?: boolean;
  failOnWarnings?: boolean;
  autoGenerateStubs?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  reportFormat?: 'json' | 'text' | 'html';
  outputPath?: string;
}

/**
 * Enterprise Validation Service
 */
export class ValidationService {
  private validator: CodeValidator;
  private options: Required<ValidationOptions>;

  constructor(options: ValidationOptions = {}) {
    this.validator = new CodeValidator();
    this.options = {
      strictMode: options.strictMode ?? true,
      failOnWarnings: options.failOnWarnings ?? false,
      autoGenerateStubs: options.autoGenerateStubs ?? false,
      excludePatterns: options.excludePatterns ?? ['node_modules', '.next', 'dist', '.git'],
      includePatterns: options.includePatterns ?? ['src/**/*.ts', 'src/**/*.tsx'],
      reportFormat: options.reportFormat ?? 'text',
      outputPath: options.outputPath ?? './validation-report'
    };
  }

  /**
   * Validate entire service layer
   *
   * @param {string} serviceDir - Services directory path
   * @returns {Promise<Object>} Validation result
   */
  async validateServiceLayer(serviceDir: string): Promise<any> {
    logger.info(`Validating service layer: ${serviceDir}`);
    try {
      const result = await this.validator.validateDirectory(serviceDir);

      if (!result.isValid && this.options.strictMode) {
        logger.error('Service layer validation failed!', {
          errors: result.errors.length,
          warnings: result.warnings.length
        });
        throw new Error(`Service layer validation failed with ${result.errors.length} error(s)`);
      }

      logger.info('Service layer validation complete', result.stats);
      return result;
    } catch (error) {
      logger.error('Service layer validation error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Validate specific service class
   *
   * @param {string} filePath - File path
   * @param {string} className - Class name
   * @returns {Promise<Object>} Validation result
   */
  async validateService(filePath: string, className: string): Promise<any> {
    logger.info(`Validating service: ${className}`);
    try {
      const result = await this.validator.validateClass(filePath, className);

      if (!result.isValid && this.options.strictMode) {
        logger.error(`Validation failed for ${className}`, {
          errors: result.errors.length
        });

        if (this.options.autoGenerateStubs) {
          const stubs = this.validator.generateStubs(result.errors);
          logger.info('Generated method stubs for missing implementations');
          return { ...result, generatedStubs: stubs };
        }
      }

      return result;
    } catch (error) {
      logger.error('Service validation error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Pre-commit validation hook
   *
   * @param {string[]} changedFiles - Array of changed file paths
   * @returns {Promise<boolean>} True if validation passes
   */
  async preCommitValidation(changedFiles: string[]): Promise<boolean> {
    logger.info(`Running pre-commit validation for ${changedFiles.length} file(s)`);

    try {
      const allValid = await Promise.all(
        changedFiles.map(async file => {
          if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
            return true;
          }

          const result = await this.validator.validateFile(file);
          if (!result.isValid) {
            logger.error(`Validation failed for ${file}:`, {
              errors: result.errors,
              warnings: result.warnings
            });
            return false;
          }

          if (result.warnings.length > 0 && this.options.failOnWarnings) {
            logger.warn(`Warnings found in ${file}:`, result.warnings);
            return false;
          }

          return true;
        })
      );

      const passed = allValid.every(v => v);
      logger.info(`Pre-commit validation ${passed ? 'PASSED' : 'FAILED'}`);

      return passed;
    } catch (error) {
      logger.error('Pre-commit validation error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Continuous validation for development
   *
   * @param {string} filePath - File path to validate
   * @param {Function} onResult - Callback with result
   * @returns {Promise<void>}
   */
  async continuousValidation(
    filePath: string,
    onResult: (_result: any) => void
  ): Promise<void> {
    logger.info(`Starting continuous validation for ${filePath}`);

    try {
      const result = await this.validator.validateFile(filePath);
      onResult(result);

      if (!result.isValid) {
        logger.warn('Validation issues detected', {
          file: filePath,
          errors: result.errors.length
        });
      }
    } catch (error) {
      logger.error('Continuous validation error:', error instanceof Error ? error.message : String(error));
      onResult({
        isValid: false,
        errors: [{
          type: 'MISSING_IMPLEMENTATION',
          severity: 'critical',
          file: filePath,
          line: 0,
          column: 0,
          message: error instanceof Error ? error.message : String(error)
        }],
        warnings: [],
        stats: {
          totalMethods: 0,
          totalCalls: 0,
          resolvedCalls: 0,
          unresolvedCalls: 0,
          orphanedMethods: 0,
          fileCount: 0,
          duration: 0
        },
        summary: 'Validation failed'
      });
    }
  }

  /**
   * Build-time validation
   *
   * @param {string} sourceDir - Source directory
   * @returns {Promise<boolean>} True if all validations pass
   */
  async buildTimeValidation(sourceDir: string): Promise<boolean> {
    logger.info(`Running build-time validation on ${sourceDir}`);

    try {
      const result = await this.validator.validateDirectory(sourceDir);

      const report = this.validator.formatReport(result);
      logger.info(report);

      if (!result.isValid && this.options.strictMode) {
        throw new Error(`Build validation failed: ${result.errors.length} error(s) found`);
      }

      return result.isValid;
    } catch (error) {
      logger.error('Build-time validation failed:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Generate validation report
   *
   * @param {string} sourceDir - Source directory
   * @returns {Promise<string>} Report
   */
  async generateReport(sourceDir: string): Promise<string> {
    try {
      const result = await this.validator.validateDirectory(sourceDir);
      return this.validator.formatReport(result);
    } catch (error) {
      logger.error('Report generation failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

export default ValidationService;
