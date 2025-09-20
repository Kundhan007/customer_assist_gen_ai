import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  message!: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
