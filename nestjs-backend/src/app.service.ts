import { Injectable } from '@nestjs/common';

// This is a placeholder for a more complex health check
// In a real application, you might check database connectivity, external services, etc.
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  details?: {
    database?: 'up' | 'down';
    orchestrator?: 'up' | 'down';
  };
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getRootInfo(): object {
    return {
      message: 'NestJS Insurance API',
      version: '1.0.0',
      endpoints: {
        auth: '/auth',
        chat: '/chat',
        claims: '/claims',
        premium: '/premium',
        admin: '/admin',
        users: '/users',
        policies: '/policies',
        'claim-history': '/claim-history',
        health: '/health',
      },
    };
  }

  getHealthStatus(): HealthStatus {
    // Placeholder for actual health checks
    const isDbHealthy = true; // Replace with actual DB check
    const isOrchestratorHealthy = true; // Replace with actual orchestrator check

    const status = isDbHealthy && isOrchestratorHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      details: {
        database: isDbHealthy ? 'up' : 'down',
        orchestrator: isOrchestratorHealthy ? 'up' : 'down',
      },
    };
  }
}
