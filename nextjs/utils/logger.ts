import { LoggerConfig, getLoggerConfig } from './loggerConfig';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private config: LoggerConfig;
  
  constructor() {
    this.config = getLoggerConfig();
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = formatLogMessage(message, context);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}`;

    if (this.config.enableConsole) {
      switch (level) {
        case 'debug':
          console.log(logEntry);
          break;
        case 'info':
          console.info(logEntry);
          break;
        case 'warn':
          console.warn(logEntry);
          break;
        case 'error':
          console.error(logEntry);
          if (error) console.error(error);
          break;
      }
    }

    // File logging could be added here
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }
}

const logger = new Logger();

function formatLogMessage(message: string, context?: LogContext): string {
  if (!context) return message;
  
  const { component, action, ...rest } = context;
  const prefix = [
    component && `[${component}]`,
    action && `(${action})`
  ].filter(Boolean).join(' ');
  
  const contextStr = Object.keys(rest).length 
    ? `- ${JSON.stringify(rest)}`
    : '';
    
  return `${prefix ? `${prefix} ` : ''}${message}${contextStr}`;
}

export default logger;
