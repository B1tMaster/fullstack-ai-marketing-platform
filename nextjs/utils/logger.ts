import { isDevelopment } from '@/lib/constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: any;
}

const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${formatLogMessage(message, context)}`);
    }
  },
  
  info: (message: string, context?: LogContext) => {
    console.log(`[INFO] ${formatLogMessage(message, context)}`);
  },
  
  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${formatLogMessage(message, context)}`);
  },
  
  error: (message: string, error?: Error, context?: LogContext) => {
    console.error(`[ERROR] ${formatLogMessage(message, context)}`);
    if (error) {
      console.error(error);
    }
  }
};

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
