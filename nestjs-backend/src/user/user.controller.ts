import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ClaimsService } from '../claims/claims.service';
import { PoliciesService } from '../policies/policies.service';
import { PremiumService } from '../premium/premium.service';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateClaimDto } from '../claims/dto/create-claim.dto';
import { CalculatePremiumDto } from '../premium/dto/calculate-premium.dto';
import { SendMessageDto } from '../chat/dto/send-message.dto';
import { UpdateUserEmailDto } from '../users/dto/update-user-email.dto';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'admin')
export class UserController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly policiesService: PoliciesService,
    private readonly premiumService: PremiumService,
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  // Profile Management
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch('profile')
  async updateProfile(@Request() req: RequestWithUser, @Body() updateUserEmailDto: UpdateUserEmailDto) {
    return this.usersService.updateEmail(req.user.userId, updateUserEmailDto);
  }

  // Policy Management (User sees only their policies)
  @Get('policies')
  async getUserPolicies(@Request() req: RequestWithUser) {
    return this.policiesService.findByUserId(req.user.userId);
  }

  @Get('policies/active')
  async getActiveUserPolicies(@Request() req: RequestWithUser) {
    const policies = await this.policiesService.findByUserId(req.user.userId);
    // Consider a policy active if end_date is in the future
    const currentDate = new Date();
    return policies.filter(policy => new Date(policy.end_date) > currentDate);
  }

  @Get('policies/:id')
  async getUserPolicyById(@Request() req: RequestWithUser, @Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    if (!policy || policy.user_id !== req.user.userId) {
      throw new NotFoundException('Policy not found or access denied');
    }
    return policy;
  }

  // Claims Management (User sees only their claims)
  @Post('claims')
  async createClaim(@Request() req: RequestWithUser, @Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.createClaim(
      createClaimDto.policyId,
      createClaimDto.description,
      createClaimDto.vehicle,
      createClaimDto.photos,
    );
  }

  @Get('claims')
  async getUserClaims(@Request() req: RequestWithUser, @Query('active') active?: string) {
    const claims = await this.claimsService.getClaimsByUserId(req.user.userId);
    if (active === 'true') {
      return claims.filter(claim => claim.status === 'active');
    }
    return claims;
  }

  @Get('claims/:id')
  async getUserClaimById(@Request() req: RequestWithUser, @Param('id') id: string) {
    const claim = await this.claimsService.getClaimById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    // Check if user owns this claim
    const userClaims = await this.claimsService.getClaimsByUserId(req.user.userId);
    const userClaimIds = userClaims.map(c => c.claim_id);
    if (!userClaimIds.includes(claim.claim_id)) {
      throw new NotFoundException('Claim not found or access denied');
    }
    return claim;
  }


  // Premium Management (User sees only their premium data)
  @Post('premium/calculate')
  async calculatePremium(@Body() calculatePremiumDto: CalculatePremiumDto) {
    return this.premiumService.calculatePremium(
      calculatePremiumDto.policy_id,
      calculatePremiumDto.previous_coverage,
      calculatePremiumDto.new_coverage,
    );
  }


  // Chat Functionality
  @Post('chat')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.chatService.forwardToOrchestrator(
      sendMessageDto.message,
      sendMessageDto.sessionId,
    );
  }

}
