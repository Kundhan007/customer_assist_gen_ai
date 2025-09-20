import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdatePolicyDto {
  @IsEnum(['Silver', 'Gold'])
  @IsOptional()
  plan_name?: 'Silver' | 'Gold';

  @IsNumber()
  @IsOptional()
  collision_coverage?: number;

  @IsBoolean()
  @IsOptional()
  roadside_assistance?: boolean;

  @IsNumber()
  @IsOptional()
  deductible?: number;

  @IsNumber()
  @IsOptional()
  premium?: number;
}
