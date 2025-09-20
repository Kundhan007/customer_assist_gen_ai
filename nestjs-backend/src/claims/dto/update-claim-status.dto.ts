import { IsString, IsEnum } from 'class-validator';

export enum ClaimStatus {
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CLOSED = 'Closed',
}

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  newStatus!: ClaimStatus;
}
