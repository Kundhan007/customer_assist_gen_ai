import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { CalculatePremiumDto } from './dto/calculate-premium.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('premium')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('calc')
  @Roles('user', 'admin')
  calculatePremium(@Body() calculatePremiumDto: CalculatePremiumDto) {
    return this.premiumService.calculatePremium(
      calculatePremiumDto.policy_id,
      calculatePremiumDto.previous_coverage,
      calculatePremiumDto.new_coverage,
    );
  }

  @Get(':policyId')
  @Roles('user', 'admin')
  getPremiumHistory(@Param('policyId') policyId: string) {
    return this.premiumService.getPremiumHistory(policyId);
  }
}
