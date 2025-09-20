import { Controller, Get, Post, Delete, Param, Body, Query, UploadedFile, UseInterceptors, UseGuards, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { PoliciesService } from '../policies/policies.service';
import { ClaimsService } from '../claims/claims.service';
import { PremiumService } from '../premium/premium.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreatePolicyDto } from '../policies/dto/create-policy.dto';
import { UpdatePolicyDto } from '../policies/dto/update-policy.dto';
import { UpdateClaimStatusDto } from '../claims/dto/update-claim-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly policiesService: PoliciesService,
    private readonly claimsService: ClaimsService,
    private readonly premiumService: PremiumService,
  ) {}

  // User Management
  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('users/:id/policies')
  async getUserPolicies(@Param('id') id: string) {
    return this.policiesService.findByUserId(id);
  }

  @Get('users/:id/claims')
  async getUserClaims(@Param('id') id: string) {
    // This will need to be implemented to get claims by user ID
    return [];
  }

  // Policy Management (Any policy in system)
  @Get('policies')
  async getAllPolicies() {
    return this.policiesService.findAll();
  }

  @Post('policies')
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
  }

  @Get('policies/:id')
  async getPolicyById(@Param('id') id: string) {
    const policy = await this.policiesService.findOne(id);
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }
    return policy;
  }

  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }

  // Claims Management (Any claim in system)
  @Get('claims')
  async getAllClaims(@Param() params: any, @Query() query: any) {
    if (query.policyId) {
      return this.claimsService.getClaimsByPolicy(query.policyId);
    }
    return this.claimsService.getAllClaims();
  }

  @Get('claims/:id')
  async getClaimById(@Param('id') id: string) {
    const claim = await this.claimsService.getClaimById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  @Post('claims/:id/status')
  async updateClaimStatus(
    @Param('id') id: string,
    @Body() updateClaimStatusDto: UpdateClaimStatusDto,
  ) {
    const result = await this.claimsService.updateClaimStatus(id, updateClaimStatusDto.newStatus);
    if (!result) {
      throw new NotFoundException('Claim not found');
    }
    return result;
  }

  @Delete('claims/:id')
  async deleteClaim(@Param('id') id: string) {
    const result = await this.claimsService.deleteClaim(id);
    if (!result) {
      throw new NotFoundException('Claim not found');
    }
    return result;
  }

  // System Management
  @Post('kb')
  @UseInterceptors(FileInterceptor('file'))
  uploadKnowledgeBase(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadKnowledgeBase(file);
  }

  @Delete('kb/:id')
  deleteKnowledgeBaseEntry(@Param('id') id: string) {
    return this.adminService.deleteKnowledgeBaseEntry(id);
  }

  @Get('statistics')
  async getSystemStatistics() {
    return this.usersService.getStatistics();
  }

  @Get('statistics/users')
  async getUserStatistics() {
    return this.usersService.getStatistics();
  }

  @Get('statistics/policies')
  async getPolicyStatistics() {
    // This will need to be implemented
    return { total: 0, active: 0, expired: 0 };
  }

  @Get('statistics/claims')
  async getClaimStatistics() {
    // This will need to be implemented
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }

  // Premium Management (System-wide)
  @Get('premium/history')
  async getAllPremiumHistory() {
    // This will need to be implemented
    return [];
  }

  @Get('premium/policy/:policyId')
  async getPolicyPremiumHistory(@Param('policyId') policyId: string) {
    return this.premiumService.getPremiumHistory(policyId);
  }
}
