import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('email/:email')
  @Roles('admin')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('statistics')
  @Roles('admin')
  getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Roles('user', 'admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/email')
  @Roles('user', 'admin')
  updateEmail(@Param('id') id: string, @Body() updateUserEmailDto: UpdateUserEmailDto) {
    return this.usersService.updateEmail(id, updateUserEmailDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
