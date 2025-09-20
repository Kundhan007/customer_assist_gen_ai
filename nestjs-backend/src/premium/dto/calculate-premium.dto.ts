import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CalculatePremiumDto {
  @IsString()
  policy_id!: string;

  @IsNumber()
  @IsOptional()
  previous_coverage?: number;

  @IsNumber()
  new_coverage!: number;
}
