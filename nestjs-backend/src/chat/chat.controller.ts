import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
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
