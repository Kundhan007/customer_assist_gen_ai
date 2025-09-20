import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ClaimHistoryService } from './claim-history.service';

@Controller('claim-history')
export class ClaimHistoryController {
  constructor(private readonly claimHistoryService: ClaimHistoryService) {}

  @Get('user/:userId')
  getClaimHistoryByUserId(@Param('userId') userId: string) {
    return this.claimHistoryService.getClaimHistoryByUserId(userId);
  }

  @Get(':claimId')
  getDetailedClaimHistory(@Param('claimId') claimId: string) {
    return this.claimHistoryService.getDetailedClaimHistory(claimId);
  }
}
