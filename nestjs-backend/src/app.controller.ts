import { Controller, Get } from '@nestjs/common';
import { AppService, HealthStatus } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRootInfo(): object {
    return this.appService.getRootInfo();
  }

  @Get('health')
  getHealthStatus(): HealthStatus {
    return this.appService.getHealthStatus();
  }
}
