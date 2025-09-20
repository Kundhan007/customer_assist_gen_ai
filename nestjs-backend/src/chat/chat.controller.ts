import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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
  @ApiBody({
    schema: {
      example: {
        message: 'Hello, I need help with my insurance claim. My policy number is GOLD-P001 and I was involved in a major collision on the highway.',
        sessionId: 'user-session-001'
      }
    }
  })
  async sendMessage(@Body() body: { message: string; sessionId?: string }, @Request() req: AuthenticatedRequest) {
    const { message, sessionId } = body;
    const userRole = req.user?.role || 'user';
    return this.chatService.forwardToOrchestrator(message, sessionId, userRole, req);
  }
}
