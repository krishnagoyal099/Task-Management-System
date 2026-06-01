type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatLog = (level: LogLevel, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

const logger = {
  info: (message: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(formatLog('info', message, meta));
    }
  },
  warn: (message: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(formatLog('warn', message, meta));
    }
  },
  error: (message: string, meta?: unknown): void => {
    console.error(formatLog('error', message, meta));
  },
  debug: (message: string, meta?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

export default logger;