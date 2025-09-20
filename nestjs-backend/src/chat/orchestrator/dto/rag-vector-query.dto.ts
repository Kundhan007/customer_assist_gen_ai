import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class RagVectorQueryDto {
  @IsArray()
  vector: number[] = [];

  @IsNumber()
  limit: number = 5;

  @IsOptional()
  @IsString()
  query?: string;
}
