import { Controller, Get, Param, UseGuards, NotFoundException, Request } from '@nestjs/common';
import { ClaimHistoryService } from './claim-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ClaimsService } from '../claims/claims.service';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@Controller('claim-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimHistoryController {
  constructor(
    private readonly claimHistoryService: ClaimHistoryService,
    private readonly claimsService: ClaimsService,
  ) {}

  @Get('claim/:claimId')
  @Roles('user', 'admin')
  async getDetailedClaimHistory(@Param('claimId') claimId: string, @Request() req: RequestWithUser) {
    // Check if user owns this claim (for regular users)
    if (req.user.role === 'user') {
      const userClaims = await this.claimsService.getClaimsByUserId(req.user.userId);
      const userClaimIds = userClaims.map(c => c.claim_id);
      if (!userClaimIds.includes(claimId)) {
        throw new NotFoundException('Claim not found or access denied');
      }
    }
    
    return this.claimHistoryService.getDetailedClaimHistory(claimId);
  }
}
