import { logger } from "@/lib/logger";
/**
 * Logging Service
 * 
 * This service provides a centralized logging mechanism for the platform.
 * It supports different log levels and structured logging with contextual information.
 */

/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
  id?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
}

/**
 * Logging service for centralized application logging
 */
export class LoggingService {
  private enabled: boolean = true;
  private minLevel: LogLevel = 'info';
  private logSink?: (entry: LogEntry) => void;

  constructor(
    logSink?: (entry: LogEntry) => void,
    options?: {
      enabled?: boolean;
      minLevel?: LogLevel;
    }
  ) {
    this.logSink = logSink;
    if (options) {
      this.enabled = options.enabled ?? this.enabled;
      this.minLevel = options.minLevel ?? this.minLevel;
    }
    
    // Default log sink if none provided
    if (!this.logSink) {
      this.logSink = (entry: LogEntry) => {
        const timestamp = entry.timestamp?.toISOString() || new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
        
        switch (entry.level) {
          case 'debug':
            console.debug(formattedMessage, entry.context || '');
            break;
          case 'info':
            console.info(formattedMessage, entry.context || '');
            break;
          case 'warn':
            console.warn(formattedMessage, entry.context || '');
            break;
          case 'error':
          case 'critical':
            console.error(formattedMessage, entry.context || '');
            break;
        }
      };
    }
  }
  
  /**
   * Log a message with the specified level and context
   */
  log(_entry: LogEntry): void;
  log(_level: LogLevel, _message: string, _context?: Record<string, any>): void;
  log(
    entryOrLevel: LogEntry | LogLevel,
    message?: string,
    context?: Record<string, any>
  ): void {
    if (!this.enabled) {
      return;
    }
    
    let entry: LogEntry;
    
    if (typeof entryOrLevel === 'string') {
      entry = {
        level: entryOrLevel,
        message: message || '',
        context,
        timestamp: new Date()
      };
    } else {
      entry = {
        ...entryOrLevel,
        timestamp: entryOrLevel.timestamp || new Date()
      };
    }
    
    // Check if the log level is enabled
    if (!this.isLevelEnabled(entry.level)) {
      return;
    }
    
    // Send to log sink
    this.logSink!(entry);
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }
  
  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }
  
  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }
  
  /**
   * Log a critical message
   */
  critical(message: string, context?: Record<string, any>): void {
    this.log('critical', message, context);
  }
  
  /**
   * Check if a log level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
  
  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
  
  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}