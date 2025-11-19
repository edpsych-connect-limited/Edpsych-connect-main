/**
 * Simple Logger Utility
 * Provides basic logging for validation framework
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel = 'info';
  private logs: LogEntry[] = [];

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    if (['debug'].includes(this.logLevel)) {
      this.log('debug', message, data);
    }
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      this.log('info', message, data);
    }
  }

  /**
   * Warning log
   */
  warn(message: string, data?: any): void {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      this.log('warn', message, data);
    }
  }

  /**
   * Error log
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    this.logs.push(entry);

    // Console output
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return this.logs;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
export default Logger;
