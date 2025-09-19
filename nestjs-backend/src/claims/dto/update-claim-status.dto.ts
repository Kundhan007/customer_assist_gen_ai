import { IsString, IsEnum } from 'class-validator';

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  newStatus: ClaimStatus;
}
