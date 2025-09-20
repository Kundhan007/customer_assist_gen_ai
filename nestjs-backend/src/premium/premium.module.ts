import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { Premium } from '../entities/premium.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Premium])],
  controllers: [PremiumController],
  providers: [PremiumService],
})
export class PremiumModule {}
