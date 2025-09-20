import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

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

  @Post('start')
  @ApiOperation({ summary: 'Start orchestrator' })
  @ApiResponse({ status: 200, description: 'Orchestrator started successfully' })
  @ApiResponse({ status: 400, description: 'Orchestrator is already running' })
  async startOrchestrator() {
    await this.orchestratorService.startOrchestrator();
    return { message: 'Orchestrator started successfully' };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop orchestrator' })
  @ApiResponse({ status: 200, description: 'Orchestrator stopped successfully' })
  @ApiResponse({ status: 400, description: 'Orchestrator is not running' })
  async stopOrchestrator() {
    await this.orchestratorService.stopOrchestrator();
    return { message: 'Orchestrator stopped successfully' };
  }

  @Post('restart')
  @ApiOperation({ summary: 'Restart orchestrator' })
  @ApiResponse({ status: 200, description: 'Orchestrator restarted successfully' })
  async restartOrchestrator() {
    await this.orchestratorService.restartOrchestrator();
    return { message: 'Orchestrator restarted successfully' };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send message to orchestrator' })
  @ApiResponse({ status: 200, description: 'Returns the orchestrator response' })
  @ApiResponse({ status: 503, description: 'Orchestrator service unavailable' })
  async chat(
    @Body() body: { message: string; sessionId?: string; userRole?: string }
  ) {
    const { message, sessionId, userRole = 'user' } = body;
    return this.orchestratorService.forwardToOrchestrator(message, sessionId, userRole);
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
