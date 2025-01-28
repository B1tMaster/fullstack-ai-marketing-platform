export interface LoggerConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFileLogging?: boolean;
  logFilePath?: string;
}

const devConfig: LoggerConfig = {
  logLevel: 'debug',
  enableConsole: true,
  enableFileLogging: true,
  logFilePath: './logs/dev.log'
};

const prodConfig: LoggerConfig = {
  logLevel: 'warn',
  enableConsole: true,
  enableFileLogging: true,
  logFilePath: './logs/prod.log'
};

export const getLoggerConfig = (): LoggerConfig => {
  return process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
};
