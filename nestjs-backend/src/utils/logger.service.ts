import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message, service = 'nestjs' }) => {
          return `[${timestamp}] [${service}] [${level}] ${message}`;
        })
      ),
      transports: [
        new DailyRotateFile({
          filename: path.join(process.cwd(), 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '10m',
          maxFiles: '7d',
          symlinkName: 'app.log'
        })
      ]
    });
  }

  log(message: string, service?: string) {
    this.logger.info(message, { service });
  }

  error(message: string, service?: string) {
    this.logger.error(message, { service });
  }

  warn(message: string, service?: string) {
    this.logger.warn(message, { service });
  }

  debug(message: string, service?: string) {
    this.logger.debug(message, { service });
  }
}
