import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService],
})
export class PremiumModule {}
