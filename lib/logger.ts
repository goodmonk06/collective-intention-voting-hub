/**
 * Structured logging utility with contextual information
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  communityId?: string;
  cycleId?: string;
  proposalId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private context: LogContext = {};

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...additionalContext };
    return childLogger;
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear all context
   */
  clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, meta?: LogContext | Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context },
    };

    if (meta instanceof Error) {
      entry.error = {
        message: meta.message,
        stack: meta.stack,
        code: (meta as any).code,
      };
    } else if (meta) {
      entry.context = { ...entry.context, ...meta };
    }

    // In development, use pretty console logging
    if (process.env.NODE_ENV !== 'production') {
      this.consoleLog(level, entry);
    } else {
      // In production, output JSON for log aggregators
      console.log(JSON.stringify(entry));
    }
  }

  private consoleLog(level: LogLevel, entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';

    const levelStr = `${colors[level]}[${level.toUpperCase()}]${reset}`;
    const timestamp = `\x1b[90m${entry.timestamp}${reset}`;

    let output = `${timestamp} ${levelStr} ${entry.message}`;

    if (Object.keys(entry.context || {}).length > 0) {
      output += ` ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n${colors[LogLevel.ERROR]}${entry.error.message}${reset}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    console.log(output);
  }

  debug(message: string, meta?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  info(message: string, meta?: LogContext): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: LogContext | Error): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error | LogContext): void {
    this.log(LogLevel.ERROR, message, error);
  }
}

// Global logger instance
export const logger = new Logger();

/**
 * Create a request-scoped logger with request ID
 */
export function createRequestLogger(requestId: string): Logger {
  return logger.child({ requestId });
}
