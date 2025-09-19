import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(private readonly httpService: HttpService) {}

  async forwardToOrchestrator(message: string, sessionId?: string) {
    const payload = { message, sessionId };
    const response = await firstValueFrom(
      this.httpService.post('/orchestrator', payload),
    );
    return response.data;
  }
}
