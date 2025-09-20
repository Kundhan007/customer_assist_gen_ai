import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { ClaimHistoryService } from './claim-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('claim-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimHistoryController {
  constructor(private readonly claimHistoryService: ClaimHistoryService) {}

  @Get('user/:userId')
  @Roles('user', 'admin')
  getClaimHistoryByUserId(@Param('userId') userId: string) {
    return this.claimHistoryService.getClaimHistoryByUserId(userId);
  }

  @Get(':claimId')
  @Roles('user', 'admin')
  getDetailedClaimHistory(@Param('claimId') claimId: string) {
    return this.claimHistoryService.getDetailedClaimHistory(claimId);
  }
}
