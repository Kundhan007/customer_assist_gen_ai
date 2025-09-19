import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { CalculatePremiumDto } from './dto/calculate-premium.dto';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('calc')
  calculatePremium(@Body() calculatePremiumDto: CalculatePremiumDto) {
    return this.premiumService.calculatePremium(
      calculatePremiumDto.policyId,
      calculatePremiumDto.currentCoverage,
      calculatePremiumDto.newCoverage,
    );
  }

  @Get(':policyId')
  getPremiumHistory(@Param('policyId') policyId: string) {
    return this.premiumService.getPremiumHistory(policyId);
  }
}
