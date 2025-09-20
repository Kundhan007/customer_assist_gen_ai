import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ClaimsModule } from './claims/claims.module';
import { PremiumModule } from './premium/premium.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { PoliciesModule } from './policies/policies.module';
import { ClaimHistoryModule } from './claim-history/claim-history.module';
import { UserModule } from './user/user.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Policy } from './entities/policy.entity';
import { Claim } from './entities/claim.entity';
import { Premium } from './entities/premium.entity';
import { RolesGuard } from './common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DB_URL');
        if (!dbUrl) {
          throw new Error('DB_URL environment variable is not set');
        }
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [User, Policy, Claim, Premium],
          synchronize: process.env.NODE_ENV === 'development',
          logging: process.env.NODE_ENV === 'development',
          pool: {
            max: 20,
            min: 5,
            idle: 10000,
            acquire: 30000,
          },
          extra: {
            connectionLimit: 20,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ChatModule,
    ClaimsModule,
    PremiumModule,
    AdminModule,
    UsersModule,
    PoliciesModule,
    ClaimHistoryModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RolesGuard,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
