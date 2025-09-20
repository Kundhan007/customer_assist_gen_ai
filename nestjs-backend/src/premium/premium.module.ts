import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { Premium } from '../entities/premium.entity';
import { PoliciesModule } from '../policies/policies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Premium]), PoliciesModule],
  controllers: [PremiumController],
  providers: [PremiumService],
  exports: [PremiumService],
})
export class PremiumModule {}
