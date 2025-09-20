import { IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  user_id!: string;

  @IsEnum(['Silver', 'Gold'])
  plan_name!: 'Silver' | 'Gold';

  @IsNumber()
  collision_coverage!: number;

  @IsBoolean()
  roadside_assistance!: boolean;

  @IsNumber()
  deductible!: number;

  @IsNumber()
  premium!: number;
}
