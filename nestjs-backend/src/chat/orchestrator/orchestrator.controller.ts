import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get orchestrator status' })
  @ApiResponse({ status: 200, description: 'Returns the current status of the orchestrator service' })
  getStatus() {
    return this.orchestratorService.getOrchestratorStatus();
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send message to orchestrator' })
  @ApiResponse({ status: 200, description: 'Returns the orchestrator response' })
  @ApiResponse({ status: 503, description: 'Orchestrator service unavailable' })
  async chat(
    @Body() body: { message: string; sessionId?: string; userRole?: string },
    @Req() request: Request
  ) {
    const { message, sessionId, userRole = 'user' } = body;
    return this.orchestratorService.forwardToOrchestrator(message, sessionId, userRole, request);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for orchestrator' })
  @ApiResponse({ status: 200, description: 'Orchestrator is healthy' })
  @ApiResponse({ status: 503, description: 'Orchestrator is not healthy' })
  healthCheck() {
    const status = this.orchestratorService.getOrchestratorStatus();
    if (status.running && status.ready) {
      return { status: 'healthy', ...status };
    } else {
      return { status: 'unhealthy', ...status };
    }
  }
}
