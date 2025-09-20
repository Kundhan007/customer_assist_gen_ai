import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class RagQueryDto {
  @IsString()
  query!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  similarityThreshold?: number = 0.7;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}
