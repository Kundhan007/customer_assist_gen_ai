import { Controller, Get, Param, UseGuards, NotFoundException, Request } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@Controller('policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get(':id')
  @Roles('user', 'admin')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const policy = await this.policiesService.findOne(id);
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }
    
    // Users can only access their own policies, admins can access any policy
    if (req.user.role === 'user' && policy.user_id !== req.user.userId) {
      throw new NotFoundException('Policy not found');
    }
    
    return policy;
  }
}
