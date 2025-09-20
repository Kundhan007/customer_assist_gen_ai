import { Controller, Get, Post, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { PoliciesService } from '../policies/policies.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreatePolicyDto } from '../policies/dto/create-policy.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly policiesService: PoliciesService,
  ) {}

  // User Management
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiBody({
    schema: {
      example: {
        email: 'demo.user@prod.com',
        password: 'password',
        role: 'user'
      }
    }
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'USER_001' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  // Policy Management (Any policy in system)
  @Get('policies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all policies (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all policies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllPolicies() {
    return this.policiesService.findAll();
  }

  @Post('policies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new policy (Admin only)' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiBody({
    schema: {
      example: {
        policy_id: 'GOLD-P014',
        user_id: 'demo.user@prod.com',
        plan_name: 'Gold',
        collision_coverage: 300000,
        roadside_assistance: true,
        deductible: 2000,
        premium: 32000.00,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      }
    }
  })
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
  }



  // System Management
  @Post('kb')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload knowledge base file (Admin only)' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Knowledge base file to upload'
        }
      }
    }
  })
  uploadKnowledgeBase(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadKnowledgeBase(file);
  }

  @Delete('kb/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete knowledge base entry (Admin only)' })
  @ApiResponse({ status: 200, description: 'Entry deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiParam({ name: 'id', description: 'Knowledge base entry ID', example: 'KB_001' })
  deleteKnowledgeBaseEntry(@Param('id') id: string) {
    return this.adminService.deleteKnowledgeBaseEntry(id);
  }

}
