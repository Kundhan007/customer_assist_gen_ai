import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.chatService.forwardToOrchestrator(
      sendMessageDto.message,
      sendMessageDto.sessionId,
    );
  }
}
