import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService, HealthStatus } from './app.service';
import { LoggerService } from './utils/logger.service';

interface LogData {
  level: string;
  message: string;
  service?: string;
  timestamp?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService
  ) {}

  @Get()
  getRootInfo(): object {
    return this.appService.getRootInfo();
  }

  @Get('health')
  getHealthStatus(): HealthStatus {
    return this.appService.getHealthStatus();
  }

  @Post('log')
  receiveLog(@Body() logData: LogData): { success: boolean } {
    const { level, message, service = 'react', timestamp } = logData;
    
    switch (level) {
      case 'error':
        this.loggerService.error(message, service);
        break;
      case 'warn':
        this.loggerService.warn(message, service);
        break;
      case 'debug':
        this.loggerService.debug(message, service);
        break;
      default:
        this.loggerService.log(message, service);
    }
    
    return { success: true };
  }
}
