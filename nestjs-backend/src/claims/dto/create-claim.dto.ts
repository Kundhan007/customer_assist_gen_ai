import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateClaimDto {
  @IsString()
  policyId: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  vehicle?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];
}
