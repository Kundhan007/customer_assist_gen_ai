import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    // Hash the password before saving
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password_hash,
      role: createUserDto.role,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updateEmail(id: string, updateUserEmailDto: UpdateUserEmailDto): Promise<User> {
    const user = await this.findOne(id);
    const userWithNewEmail = await this.userRepository.findOne({ where: { email: updateUserEmailDto.email } });
    if (userWithNewEmail && userWithNewEmail.user_id !== user.user_id) {
      throw new ConflictException(`Email ${updateUserEmailDto.email} is already in use by another user`);
    }
    user.email = updateUserEmailDto.email;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<{ success: boolean; message: string; deletedPolicies: number }> {
    const user = await this.userRepository.findOne({ 
      where: { user_id: id },
      relations: ['policies'] 
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const policyCount = user.policies ? user.policies.length : 0;
    
    await this.userRepository.delete(id);
    
    return {
      success: true,
      message: `User ${id} deleted successfully. ${policyCount} associated policies and their claims were also deleted.`,
      deletedPolicies: policyCount,
    };
  }

  async getStatistics(): Promise<{
    total_users: number;
    role_counts: { admin: number; user: number };
    recent_registrations_30d: number;
    admin_count: number;
    user_count: number;
  }> {
    const totalUsers = await this.userRepository.count();
    const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
    const userCount = await this.userRepository.count({ where: { role: 'user' } });
    
    // Calculate recent registrations using the created_at field
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations30d = await this.userRepository.count({
      where: {
        created_at: MoreThan(thirtyDaysAgo)
      }
    });

    return {
      total_users: totalUsers,
      role_counts: {
        admin: adminCount,
        user: userCount,
      },
      recent_registrations_30d: recentRegistrations30d,
      admin_count: adminCount,
      user_count: userCount,
    };
  }
}
