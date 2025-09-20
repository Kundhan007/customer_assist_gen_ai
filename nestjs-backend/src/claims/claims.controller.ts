import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get(':id')
  @Roles('user', 'admin')
  async getClaimById(@Param('id') id: string, @Request() req: RequestWithUser) {
    const claim = await this.claimsService.getClaimById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    
    // Users can only access their own claims, admins can access any claim
    // We need to check if the claim's policy belongs to the user
    if (req.user.role === 'user') {
      const userClaims = await this.claimsService.getClaimsByUserId(req.user.userId);
      const userClaimIds = userClaims.map(c => c.claim_id);
      if (!userClaimIds.includes(claim.claim_id)) {
        throw new NotFoundException('Claim not found');
      }
    }
    
    return claim;
  }

  @Get()
  @Roles('user', 'admin')
  async getClaims(@Request() req: RequestWithUser) {
    // Users see only their claims, admins see all claims
    if (req.user.role === 'user') {
      return this.claimsService.getClaimsByUserId(req.user.userId);
    }
    return this.claimsService.getAllClaims();
  }
}
