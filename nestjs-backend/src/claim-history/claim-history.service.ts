import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ClaimHistoryService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getClaimHistoryByUserId(userId: string): Promise<Claim[]> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.claimRepository.find({
      where: {
        policy: {
          user: { user_id: userId },
        },
      },
      relations: ['policy', 'policy.user'],
      order: { claim_id: 'DESC' },
    });
  }

  async getDetailedClaimHistory(claimId: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { claim_id: claimId },
      relations: ['policy', 'policy.user'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }
    return claim;
  }
}
