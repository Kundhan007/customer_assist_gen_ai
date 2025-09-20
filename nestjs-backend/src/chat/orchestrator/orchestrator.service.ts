import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(OrchestratorService.name);
  private isReady = false;
  private readonly orchestratorUrl = 'http://localhost:2345';

  async onModuleInit() {
    // Check if Python orchestrator is already running
    this.logger.log('Orchestrator service initialized, checking if Python orchestrator is running...');
    await this.checkOrchestratorHealth();
  }

  private async checkOrchestratorHealth(): Promise<void> {
    try {
      const { HttpService } = require('@nestjs/axios');
      const { firstValueFrom } = require('rxjs');
      
      const httpService = new HttpService();
      const response = await firstValueFrom(
        httpService.get(`${this.orchestratorUrl}/health`)
      );
      
      if (response.data.status === 'healthy') {
        this.isReady = true;
        this.logger.log('Python orchestrator is healthy and ready');
      } else {
        this.logger.warn('Python orchestrator is not healthy');
        this.isReady = false;
      }
    } catch (error) {
      this.logger.error('Python orchestrator is not available:', (error as Error).message);
      this.isReady = false;
    }
  }

  isOrchestratorReady(): boolean {
    return this.isReady;
  }

  async forwardToOrchestrator(message: string, sessionId?: string, userRole: string = 'user', request?: Request): Promise<any> {
    if (!this.isReady) {
      this.logger.warn('Orchestrator is not ready, checking health again...');
      await this.checkOrchestratorHealth();
      
      if (!this.isReady) {
        this.logger.warn('Orchestrator is still not ready, returning mock response');
        return {
          response: `I apologize, but the orchestrator service is currently unavailable. Please try again later.`,
          sessionId: sessionId || 'error-session-' + Date.now(),
          timestamp: new Date().toISOString(),
          error: true
        };
      }
    }

    try {
      // Import here to avoid circular dependency
      const { HttpService } = require('@nestjs/axios');
      const { firstValueFrom } = require('rxjs');
      const { catchError } = require('rxjs/operators');
      const { AxiosError } = require('axios');

      const httpService = new HttpService();

      const payload = {
        message,
        sessionId,
        userRole,
        timestamp: new Date().toISOString(),
        auth_token: this.extractAuthToken(request)
      };

      const response = await firstValueFrom(
        httpService.post('http://localhost:2345/chat', payload).pipe(
          catchError((error: any) => {
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

  getOrchestratorStatus(): { running: boolean; ready: boolean; url: string } {
    return {
      running: this.isReady,
      ready: this.isReady,
      url: this.orchestratorUrl
    };
  }

  private extractAuthToken(request?: Request): string | null {
    if (!request) {
      return null;
    }
    
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  }
}
