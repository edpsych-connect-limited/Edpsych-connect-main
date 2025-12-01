import { logger } from "@/lib/logger";
/**
 * Logger Service
 * 
 * Provides centralized logging functionality for the EdPsych Research Foundation
 * with support for different log levels, contexts, and outputs.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  id?: string;
  metadata?: Record<string, any>;
  correlationId?: string;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  outputs?: Array<'console' | 'file' | 'database' | 'monitoring'>;
  context?: string;
  enableCorrelationIds?: boolean;
}

/**
 * Service for centralized logging across the application
 */
export class LoggerService {
  private options: LoggerOptions;
  private correlationId?: string;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      minLevel: LogLevel.INFO,
      outputs: ['console'],
      enableCorrelationIds: true,
      ...options
    };
  }

  /**
   * Set a correlation ID for grouping related log entries
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Generate a correlation ID
   */
  generateCorrelationId(): string {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.correlationId = id;
    return id;
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  /**
   * Log a critical message
   */
  critical(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, metadata);
  }

  /**
   * Internal method to handle logging
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    // Skip logging if below minimum level
    if (this.shouldSkip(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: this.options.context,
      metadata
    };

    if (this.options.enableCorrelationIds && this.correlationId) {
      entry.correlationId = this.correlationId;
    }

    this.writeLog(entry);
  }

  /**
   * Determine if a log level should be skipped
   */
  private shouldSkip(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.CRITICAL
    ];
    
    const minLevelIndex = levels.indexOf(this.options.minLevel || LogLevel.INFO);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex < minLevelIndex;
  }

  /**
   * Write log entry to configured outputs
   */
  private writeLog(entry: LogEntry): void {
    const outputs = this.options.outputs || ['console'];
    
    outputs.forEach(output => {
      switch (output) {
        case 'console':
          this.writeToConsole(entry);
          break;
        case 'file':
          this.writeToFile(entry);
          break;
        case 'database':
          this.writeToDatabase(entry);
          break;
        case 'monitoring':
          this.writeToMonitoring(entry);
          break;
      }
    });
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const correlationId = entry.correlationId ? `(${entry.correlationId})` : '';
    const metadata = entry.metadata ? JSON.stringify(entry.metadata) : '';
    
    const message = `${timestamp} ${entry.level.toUpperCase()} ${context} ${correlationId} ${entry.message} ${metadata}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message);
        break;
    }
  }

  /**
   * Write log entry to file
   */
  private writeToFile(entry: LogEntry): void {
    // Implementation would write to a log file
    // Placeholder implementation
    logger.debug(`[FILE] Would write to log file: ${entry.level} ${entry.message}`);
  }

  /**
   * Write log entry to database
   */
  private writeToDatabase(entry: LogEntry): void {
    // Implementation would write to a database
    // Placeholder implementation
    logger.debug(`[DB] Would write to database: ${entry.level} ${entry.message}`);
  }

  /**
   * Write log entry to monitoring system
   */
  private writeToMonitoring(entry: LogEntry): void {
    // Implementation would send to a monitoring system
    // Placeholder implementation
    logger.debug(`[MONITORING] Would send to monitoring: ${entry.level} ${entry.message}`);
  }
}
