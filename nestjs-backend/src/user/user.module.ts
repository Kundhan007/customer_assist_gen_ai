import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ClaimsModule } from '../claims/claims.module';
import { PoliciesModule } from '../policies/policies.module';
import { PremiumModule } from '../premium/premium.module';
import { ClaimHistoryModule } from '../claim-history/claim-history.module';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ClaimsModule,
    PoliciesModule,
    PremiumModule,
    ClaimHistoryModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
