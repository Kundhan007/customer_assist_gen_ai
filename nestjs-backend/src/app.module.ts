import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ClaimsModule } from './claims/claims.module';
import { PremiumModule } from './premium/premium.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ChatModule,
    ClaimsModule,
    PremiumModule,
    AdminModule,
  ],
})
export class AppModule {}
