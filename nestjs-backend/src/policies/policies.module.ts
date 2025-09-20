import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { Policy } from '../entities/policy.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, User]), forwardRef(() => AuthModule)],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService], // Export PoliciesService if other modules need it
})
export class PoliciesModule {}
