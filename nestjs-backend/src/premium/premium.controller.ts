import { Controller, Get, Param, UseGuards, NotFoundException, Request } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PoliciesService } from '../policies/policies.service';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@Controller('premium')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PremiumController {
  constructor(
    private readonly premiumService: PremiumService,
    private readonly policiesService: PoliciesService,
  ) {}

  @Get(':policyId')
  @Roles('user', 'admin')
  async getPremiumHistory(@Param('policyId') policyId: string, @Request() req: RequestWithUser) {
    // Check if user owns this policy (for regular users)
    if (req.user.role === 'user') {
      const policy = await this.policiesService.findOne(policyId);
      if (!policy || policy.user_id !== req.user.userId) {
        throw new NotFoundException('Policy not found or access denied');
      }
    }
    
    return this.premiumService.getPremiumHistory(policyId);
  }
}
