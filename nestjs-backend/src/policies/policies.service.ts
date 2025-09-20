import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from '../entities/policy.entity';
import { User } from '../entities/user.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private calculatePremium(planName: string, collisionCoverage: number, roadsideAssistance: boolean, deductible: number): number {
    const baseRates = {
      'Silver': 8000,
      'Gold': 15000,
    };

    if (!baseRates[planName as keyof typeof baseRates]) {
      throw new BadRequestException(`Invalid plan name: ${planName}`);
    }

    const basePremium = baseRates[planName as keyof typeof baseRates];
    const coverageFactor = collisionCoverage / 200000;
    const deductibleDiscount = (5000 - deductible) / 10000;
    const assistanceFee = (roadsideAssistance && planName === 'Silver') ? 2000 : 0;

    return basePremium * coverageFactor - deductibleDiscount + assistanceFee;
  }

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const user = await this.userRepository.findOne({ where: { user_id: createPolicyDto.user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createPolicyDto.user_id} not found`);
    }

    const calculatedPremium = this.calculatePremium(
      createPolicyDto.plan_name,
      createPolicyDto.collision_coverage,
      createPolicyDto.roadside_assistance,
      createPolicyDto.deductible,
    );

    if (Math.abs(calculatedPremium - createPolicyDto.premium) > 0.01) {
      throw new BadRequestException(`Premium mismatch. Expected: ${calculatedPremium.toFixed(2)}, Provided: ${createPolicyDto.premium.toFixed(2)}`);
    }

    const policy = new Policy();
    policy.policy_id = this.generatePolicyId(createPolicyDto.plan_name);
    policy.user_id = createPolicyDto.user_id;
    policy.plan_name = createPolicyDto.plan_name;
    policy.collision_coverage = createPolicyDto.collision_coverage;
    policy.roadside_assistance = createPolicyDto.roadside_assistance;
    policy.deductible = createPolicyDto.deductible;
    policy.premium = createPolicyDto.premium;
    policy.start_date = new Date();
    policy.end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    return this.policyRepository.save(policy);
  }

  private generatePolicyId(planName: string): string {
    const prefix = planName.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${random}`;
  }

  async findAll(): Promise<Policy[]> {
    return this.policyRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({ where: { policy_id: id }, relations: ['user'] });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    return policy;
  }

  async findByUserId(userId: string): Promise<Policy[]> {
    return this.policyRepository.find({ where: { user_id: userId }, relations: ['user'], order: { start_date: 'DESC' } });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id);
    const updatedData = { ...policy, ...updatePolicyDto };

    if (updatePolicyDto.premium !== undefined) {
      const calculatedPremium = this.calculatePremium(
        updatePolicyDto.plan_name || policy.plan_name,
        updatePolicyDto.collision_coverage !== undefined ? updatePolicyDto.collision_coverage : policy.collision_coverage,
        updatePolicyDto.roadside_assistance !== undefined ? updatePolicyDto.roadside_assistance : policy.roadside_assistance,
        updatePolicyDto.deductible !== undefined ? updatePolicyDto.deductible : policy.deductible,
      );
      if (Math.abs(calculatedPremium - updatePolicyDto.premium) > 0.01) {
        throw new BadRequestException(`Premium mismatch. Expected: ${calculatedPremium.toFixed(2)}, Provided: ${updatePolicyDto.premium.toFixed(2)}`);
      }
    }
    
    // Map DTO fields to entity fields
    if (updatePolicyDto.plan_name) updatedData.plan_name = updatePolicyDto.plan_name;
    if (updatePolicyDto.collision_coverage !== undefined) updatedData.collision_coverage = updatePolicyDto.collision_coverage;
    if (updatePolicyDto.roadside_assistance !== undefined) updatedData.roadside_assistance = updatePolicyDto.roadside_assistance;
    if (updatePolicyDto.deductible !== undefined) updatedData.deductible = updatePolicyDto.deductible;
    
    this.policyRepository.merge(policy, updatedData);
    return this.policyRepository.save(policy);
  }

  async remove(id: string): Promise<{ policyId: string; status: string }> {
    const policy = await this.findOne(id);
    await this.policyRepository.delete(id);
    return { policyId: id, status: 'deleted' };
  }
}
