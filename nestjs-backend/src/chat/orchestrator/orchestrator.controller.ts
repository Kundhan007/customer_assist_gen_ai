import { Controller, Get } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get orchestrator service status' })
  @ApiResponse({ status: 200, description: 'Orchestrator status retrieved successfully' })
  getStatus() {
    return this.orchestratorService.getOrchestratorStatus();
  }
}
