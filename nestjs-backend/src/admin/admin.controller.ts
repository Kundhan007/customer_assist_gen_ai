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


  // Policy Management (Any policy in system)
  @Get('policies')
  async getAllPolicies() {
    return this.policiesService.findAll();
  }

  @Post('policies')
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
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

}
