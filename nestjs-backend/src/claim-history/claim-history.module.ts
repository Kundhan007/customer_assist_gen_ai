import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimHistoryService } from './claim-history.service';
import { ClaimHistoryController } from './claim-history.controller';
import { Claim } from '../entities/claim.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, User])],
  controllers: [ClaimHistoryController],
  providers: [ClaimHistoryService],
})
export class ClaimHistoryModule {}
