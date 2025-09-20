// Chat functionality has been moved to the user controller
// This controller is kept for any future chat-specific admin functionality
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('statistics')
  async getChatStatistics() {
    // This will be implemented to provide chat usage statistics for admins
    return { totalSessions: 0, activeUsers: 0 };
  }
}
