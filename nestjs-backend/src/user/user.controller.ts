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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

interface RequestWithUser {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@ApiTags('User')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Request() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile email' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({
    schema: {
      example: {
        email: 'sarah.johnson@prod.com'
      }
    }
  })
  async updateProfile(@Request() req: RequestWithUser, @Body() updateUserEmailDto: UpdateUserEmailDto) {
    return this.usersService.updateEmail(req.user.userId, updateUserEmailDto);
  }

  // Policy Management (User sees only their policies)
  @Get('policies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user policies' })
  @ApiResponse({ status: 200, description: 'List of user policies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserPolicies(@Request() req: RequestWithUser) {
    return this.policiesService.findByUserId(req.user.userId);
  }

  @Get('policies/active')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user active policies' })
  @ApiResponse({ status: 200, description: 'List of active user policies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getActiveUserPolicies(@Request() req: RequestWithUser) {
    const policies = await this.policiesService.findByUserId(req.user.userId);
    // Consider a policy active if end_date is in the future
    const currentDate = new Date();
    return policies.filter(policy => new Date(policy.end_date) > currentDate);
  }

  @Get('policies/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user policy by ID' })
  @ApiResponse({ status: 200, description: 'User policy retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiParam({ name: 'id', description: 'Policy ID', example: 'GOLD-P001' })
  async getUserPolicyById(@Request() req: RequestWithUser, @Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    if (!policy || policy.user_id !== req.user.userId) {
      throw new NotFoundException('Policy not found or access denied');
    }
    return policy;
  }

  // Claims Management (User sees only their claims)
  @Post('claims')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({
    schema: {
      example: {
        policyId: 'GOLD-P001',
        description: 'Major collision on highway. Front bumper damage, radiator leak, and headlight replacement needed.',
        vehicle: '2023 BMW X5',
        photos: ['front_damage.jpg', 'radiator_leak.jpg', 'towing_receipt.jpg']
      }
    }
  })
  async createClaim(@Request() req: RequestWithUser, @Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.createClaim(
      createClaimDto.policyId,
      createClaimDto.description,
      createClaimDto.vehicle,
      createClaimDto.photos,
    );
  }

  @Get('claims')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user claims' })
  @ApiResponse({ status: 200, description: 'List of user claims' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status', example: 'true' })
  async getUserClaims(@Request() req: RequestWithUser, @Query('active') active?: string) {
    const claims = await this.claimsService.getClaimsByUserId(req.user.userId);
    if (active === 'true') {
      return claims.filter(claim => claim.status === 'active');
    }
    return claims;
  }

  @Get('claims/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user claim by ID' })
  @ApiResponse({ status: 200, description: 'User claim retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiParam({ name: 'id', description: 'Claim ID', example: 'CLM-P001' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate premium for policy' })
  @ApiResponse({ status: 200, description: 'Premium calculated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({
    schema: {
      example: {
        policy_id: 'GOLD-P001',
        current_coverage: 250000,
        new_coverage: 300000,
        current_premium: 29500.00,
        new_premium: 32000.00,
        calculation_date: '2024-01-01'
      }
    }
  })
  async calculatePremium(@Body() calculatePremiumDto: CalculatePremiumDto) {
    return this.premiumService.calculatePremium(
      calculatePremiumDto.policy_id,
      calculatePremiumDto.previous_coverage,
      calculatePremiumDto.new_coverage,
    );
  }


  // Chat Functionality
  @Post('chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send chat message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      example: {
        message: 'Hello, I need help with my insurance claim. My policy number is GOLD-P001 and I was involved in a major collision on the highway.',
        sessionId: 'user-session-001'
      }
    }
  })
  async sendMessage(@Request() req: RequestWithUser, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.forwardToOrchestrator(
      sendMessageDto.message,
      sendMessageDto.sessionId,
      req.user.role,
      req as any
    );
  }

}
