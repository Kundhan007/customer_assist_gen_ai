import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CalculatePremiumDto {
  @IsString()
  policyId: string;

  @IsNumber()
  @IsOptional()
  currentCoverage?: number;

  @IsNumber()
  newCoverage: number;
}
