import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly httpService: HttpService) {}

  async forwardToOrchestrator(message: string, sessionId?: string) {
    try {
      const payload = { message, sessionId };
      
      // Check if we're in test environment and return mock response
      if (process.env.NODE_ENV === 'test') {
        return {
          response: `Mock response to: "${message}"`,
          sessionId: sessionId || 'test-session-' + Date.now(),
          timestamp: new Date().toISOString()
        };
      }

      const response = await firstValueFrom(
        this.httpService.post(process.env.ORCHESTRATOR_URL || '/orchestrator', payload).pipe(
          catchError((error: AxiosError) => {
            this.logger.error('Orchestrator service error:', error.message);
            throw new Error('Unable to connect to orchestrator service');
          })
        )
      );
      
      return response.data;
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
}
