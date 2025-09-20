import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { PoliciesModule } from '../policies/policies.module';
import { ClaimsModule } from '../claims/claims.module';
import { PremiumModule } from '../premium/premium.module';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    PoliciesModule,
    ClaimsModule,
    PremiumModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
