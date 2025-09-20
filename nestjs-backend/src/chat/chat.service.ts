import { Injectable, Logger } from '@nestjs/common';
import { OrchestratorService } from './orchestrator/orchestrator.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly orchestratorService: OrchestratorService) {}

  async forwardToOrchestrator(message: string, sessionId?: string, userRole: string = 'user') {
    try {
      // Check if we're in test environment and return mock response
      if (process.env.NODE_ENV === 'test') {
        return {
          response: `Mock response to: "${message}"`,
          sessionId: sessionId || 'test-session-' + Date.now(),
          timestamp: new Date().toISOString()
        };
      }

      // Use the orchestrator service to forward the message
      return await this.orchestratorService.forwardToOrchestrator(message, sessionId, userRole);
    } catch (error) {
      this.logger.error('Error forwarding to orchestrator:', error);
      return {
        response: 'I apologize, but I am currently unable to process your request. Please try again later.',
        sessionId: sessionId || 'error-session-' + Date.now(),
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }

  async getOrchestratorStatus() {
    return this.orchestratorService.getOrchestratorStatus();
  }
}
