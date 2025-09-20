import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class OrchestratorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrchestratorService.name);
  private orchestratorProcess: ChildProcess | null = null;
  private readonly orchestratorPath = join(process.cwd(), 'src', 'api');
  private isReady = false;

  async onModuleInit() {
    // Don't auto-start orchestrator for now - we'll test manually
    this.logger.log('Orchestrator service initialized (auto-start disabled)');
  }

  async onModuleDestroy() {
    await this.stopOrchestrator();
  }

  async startOrchestrator(): Promise<void> {
    if (this.orchestratorProcess) {
      this.logger.warn('Orchestrator is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.logger.log('Starting FastAPI orchestrator...');

      // Set environment variables for the orchestrator
      const env = {
        ...process.env,
        NESTJS_API_URL: 'http://localhost:3000',
        PYTHONPATH: this.orchestratorPath,
      };

      // Start the FastAPI orchestrator as a child process
      this.orchestratorProcess = spawn('python3', ['-m', 'uvicorn', 'fast_api_app:app', '--host', '127.0.0.1', '--port', '2345'], {
        cwd: this.orchestratorPath,
        env: env,
        stdio: 'pipe',
      });

      this.orchestratorProcess.stdout?.on('data', (data) => {
        const message = data.toString();
        this.logger.log(`Orchestrator stdout: ${message}`);
        
        // Check if the orchestrator is ready
        if (message.includes('Application startup complete') || message.includes('Uvicorn running')) {
          this.isReady = true;
          this.logger.log('FastAPI orchestrator is ready');
          resolve();
        }
      });

      this.orchestratorProcess.stderr?.on('data', (data) => {
        const message = data.toString();
        this.logger.error(`Orchestrator stderr: ${message}`);
      });

      this.orchestratorProcess.on('error', (error) => {
        this.logger.error('Orchestrator process error:', error);
        reject(error);
      });

      this.orchestratorProcess.on('exit', (code, signal) => {
        this.logger.log(`Orchestrator process exited with code ${code} and signal ${signal}`);
        this.orchestratorProcess = null;
        this.isReady = false;
      });

      // Set a timeout for the orchestrator to start
      setTimeout(() => {
        if (!this.isReady) {
          this.logger.warn('Orchestrator did not start within expected time, but continuing...');
          resolve(); // Don't reject, just continue
        }
      }, 10000); // 10 seconds timeout
    });
  }

  async stopOrchestrator(): Promise<void> {
    if (!this.orchestratorProcess) {
      this.logger.warn('Orchestrator is not running');
      return;
    }

    const processToStop = this.orchestratorProcess;

    return new Promise((resolve) => {
      this.logger.log('Stopping FastAPI orchestrator...');

      // Gracefully terminate the process
      processToStop.on('exit', () => {
        this.logger.log('Orchestrator stopped successfully');
        this.orchestratorProcess = null;
        this.isReady = false;
        resolve();
      });

      // Send SIGTERM
      processToStop.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (processToStop) {
          this.logger.warn('Force killing orchestrator...');
          processToStop.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  async restartOrchestrator(): Promise<void> {
    this.logger.log('Restarting FastAPI orchestrator...');
    await this.stopOrchestrator();
    await this.startOrchestrator();
  }

  isOrchestratorReady(): boolean {
    return this.isReady;
  }

  async forwardToOrchestrator(message: string, sessionId?: string, userRole: string = 'user'): Promise<any> {
    if (!this.isReady) {
      this.logger.warn('Orchestrator is not ready, returning mock response');
      return {
        response: `I apologize, but the orchestrator service is currently unavailable. Please try again later.`,
        sessionId: sessionId || 'error-session-' + Date.now(),
        timestamp: new Date().toISOString(),
        error: true
      };
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
        timestamp: new Date().toISOString()
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

  getOrchestratorStatus(): { running: boolean; ready: boolean; pid?: number | undefined } {
    return {
      running: this.orchestratorProcess !== null,
      ready: this.isReady,
      pid: this.orchestratorProcess?.pid
    };
  }
}
