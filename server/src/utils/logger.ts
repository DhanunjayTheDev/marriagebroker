import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config';

const LOG_DIR = env.LOG_DIR ?? './logs';

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `[${ts}] ${level}: ${stack ?? message}${metaStr}`;
});

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json()
);

const devTransports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      splat(),
      devFormat
    ),
  }),
];

const fileTransport = (filename: string, level?: string): DailyRotateFile =>
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: prodFormat,
  });

const prodTransports: winston.transport[] = [
  fileTransport('app'),
  fileTransport('error', 'error'),
  fileTransport('access', 'http'),
];

export const logger = winston.createLogger({
  level: env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: 'avyuktha-api' },
  transports: env.NODE_ENV === 'production' ? prodTransports : devTransports,
  exceptionHandlers: [fileTransport('exceptions')],
  rejectionHandlers: [fileTransport('rejections')],
  exitOnError: false,
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
      level: 'debug',
    })
  );
}
