import { logger } from "@/lib/logger";
/**
 * Continuous Validation Watcher
 * Watches for file changes and validates in real-time during development
 *
 * @module ValidationWatcher
 */

import * as fs from 'fs';
import * as path from 'path';
import ValidationService from './validationService';

/**
 * Watch configuration
 */
interface WatchConfig {
  directories: string[];
  extensions: string[];
  debounceMs: number;
  excludePatterns: string[];
  onError?: (error: Error, _file: string) => void;
  onSuccess?: (_file: string) => void;
}

/**
 * Continuous Validation Watcher
 */
export class ValidationWatcher {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private validationService: ValidationService;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<WatchConfig>;
  private isActive: boolean = false;

  constructor(config: WatchConfig) {
    this.validationService = new ValidationService({
      strictMode: false,
      failOnWarnings: false,
      autoGenerateStubs: false
    });

    this.config = {
      directories: config.directories || ['src'],
      extensions: config.extensions || ['.ts', '.tsx'],
      debounceMs: config.debounceMs || 1000,
      excludePatterns: config.excludePatterns || ['node_modules', '.next', 'dist', '.git'],
      onError: config.onError || (() => {}),
      onSuccess: config.onSuccess || (() => {})
    };
  }

  /**
   * Start watching for file changes
   *
   * @returns {Promise<void>}
   */
  async start(): Promise<void> {
    logger.info('Starting continuous validation watcher');
    this.isActive = true;

    for (const dir of this.config.directories) {
      if (fs.existsSync(dir)) {
        this.watchDirectory(dir);
        logger.info(`Watching directory: ${dir}`);
      }
    }

    logger.info('Validation watcher is active');
  }

  /**
   * Stop watching
   *
   * @returns {Promise<void>}
   */
  async stop(): Promise<void> {
    logger.info('Stopping validation watcher');
    this.isActive = false;

    this.watchers.forEach(watcher => {
      watcher.close();
    });

    this.debounceTimers.forEach(timer => {
      clearTimeout(timer);
    });

    this.watchers.clear();
    this.debounceTimers.clear();

    logger.info('Validation watcher stopped');
  }

  /**
   * Watch a directory for changes
   *
   * @private
   * @param {string} dir - Directory path
   */
  private watchDirectory(dir: string): void {
    try {
      const watcher = fs.watch(dir, { recursive: true }, async (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(dir, filename as string);

        // Check if should be validated
        if (!this.shouldValidate(filePath)) {
          return;
        }

        // Debounce validation
        this.debounceValidation(filePath);
      });

      this.watchers.set(dir, watcher);
    } catch (_error) {
      logger.error(`Error setting up watcher for ${dir}:`, _error instanceof Error ? _error.message : String(_error));
    }
  }

  /**
   * Check if file should be validated
   *
   * @private
   * @param {string} filePath - File path
   * @returns {boolean}
   */
  private shouldValidate(filePath: string): boolean {
    // Check extension
    const hasValidExtension = this.config.extensions.some(ext => filePath.endsWith(ext));
    if (!hasValidExtension) {
      return false;
    }

    // Check exclude patterns
    const isExcluded = this.config.excludePatterns.some(pattern => filePath.includes(pattern));
    if (isExcluded) {
      return false;
    }

    // Check if file exists
    return fs.existsSync(filePath);
  }

  /**
   * Debounce validation to avoid multiple rapid validations
   *
   * @private
   * @param {string} filePath - File path
   */
  private debounceValidation(filePath: string): void {
    // Clear existing timer
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.validateFile(filePath);
      } catch (_error) {
        logger.error(`Validation _error for ${filePath}:`, _error instanceof Error ? _error.message : String(_error));
      } finally {
        this.debounceTimers.delete(filePath);
      }
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Validate a file
   *
   * @private
   * @param {string} filePath - File path
   */
  private async validateFile(filePath: string): Promise<void> {
    if (!this.isActive) return;

    logger.debug(`Validating: ${filePath}`);

    await this.validationService.continuousValidation(filePath, (result: any) => {
      if (result.isValid) {
        if (this.config.onSuccess) {
          this.config.onSuccess(filePath);
        }
        logger.debug(` ${filePath} - Validation passed`);
      } else {
        const errorMsg = result.errors.length > 0
          ? `${result.errors.length} error(s)`
          : 'Validation failed';

        const error = new Error(errorMsg);

        if (this.config.onError) {
          this.config.onError(error, filePath);
        }

        logger.warn(` ${filePath} - ${errorMsg}`);
        result.errors.forEach((err: any) => {
          logger.warn(`  Line ${err.line}: ${err.message}`);
        });
      }
    });
  }

  /**
   * Get watcher status
   *
   * @returns {Object} Status information
   */
  getStatus(): {
    isActive: boolean;
    watchedDirectories: string[];
    activeWatchers: number;
    pendingValidations: number;
  } {
    return {
      isActive: this.isActive,
      watchedDirectories: this.config.directories,
      activeWatchers: this.watchers.size,
      pendingValidations: this.debounceTimers.size
    };
  }
}

/**
 * Create and start a validation watcher
 *
 * @param {WatchConfig} config - Watch configuration
 * @returns {Promise<ValidationWatcher>} Watcher instance
 */
export async function createValidationWatcher(config: WatchConfig): Promise<ValidationWatcher> {
  const watcher = new ValidationWatcher(config);
  await watcher.start();
  return watcher;
}

export default ValidationWatcher;
