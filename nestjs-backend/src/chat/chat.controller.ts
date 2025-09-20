import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

interface UserPayload {
  sub: number;
  username: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user?: UserPayload;
}

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a chat message to the orchestrator' })
  @ApiResponse({ status: 200, description: 'Returns the orchestrator response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(@Body() body: { message: string; sessionId?: string }, @Request() req: AuthenticatedRequest) {
    const { message, sessionId } = body;
    const userRole = req.user?.role || 'user';
    return this.chatService.forwardToOrchestrator(message, sessionId, userRole);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat history for the current user' })
  @ApiResponse({ status: 200, description: 'Returns the chat history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChatHistory() {
    // This will be implemented to retrieve chat history
    return { messages: [] };
  }

  @Get('history/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat history for a specific session' })
  @ApiResponse({ status: 200, description: 'Returns the chat session history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChatSession(@Param('sessionId') sessionId: string) {
    // This will be implemented to retrieve specific chat session
    return { sessionId, messages: [] };
  }

  @Get('orchestrator/status')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orchestrator status (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns the orchestrator status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async getOrchestratorStatus() {
    return this.chatService.getOrchestratorStatus();
  }


  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns chat usage statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async getChatStatistics() {
    // This will be implemented to provide chat usage statistics for admins
    return { totalSessions: 0, activeUsers: 0 };
  }
}
