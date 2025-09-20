import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimHistoryService } from './claim-history.service';
import { ClaimHistoryController } from './claim-history.controller';
import { Claim } from '../entities/claim.entity';
import { User } from '../entities/user.entity';
import { ClaimsModule } from '../claims/claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, User]), ClaimsModule],
  controllers: [ClaimHistoryController],
  providers: [ClaimHistoryService],
  exports: [ClaimHistoryService],
})
export class ClaimHistoryModule {}
