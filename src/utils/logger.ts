import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
};

const colors = {
  fatal: 'red bold',
  error: 'red',
  warn: 'yellow',
  info: 'green'
};

winston.addColors(colors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} ${level}: ${message}\n${stack}`;
    }
    return `${timestamp} ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  levels,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'fatal.log'),
      level: 'fatal'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'warn.log'),
      level: 'warn'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

export default logger;