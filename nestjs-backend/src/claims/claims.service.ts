import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { ClaimStatus } from './dto/update-claim-status.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
  ) {}

  async createClaim(
    policyId: string,
    description: string,
    vehicle?: string,
    photos?: string[],
  ) {
    // Generate a unique claim ID (similar to existing test data)
    const claimId = 'CLM-' + Date.now().toString().slice(-6);
    
    const newClaim = this.claimRepository.create({
      claim_id: claimId,
      policy_id: policyId,
      damage_description: description,
      vehicle: vehicle || 'Unknown Vehicle',
      photos: photos || [],
      status: 'Submitted',
    });
    
    return await this.claimRepository.save(newClaim);
  }

  async getClaimById(claimId: string) {
    return await this.claimRepository.findOne({ where: { claim_id: claimId } });
  }

  async getClaimsByPolicy(policyId: string) {
    return await this.claimRepository.find({ where: { policy_id: policyId } });
  }

  async getClaimsByUserId(userId: string) {
    // Get claims by user ID through the policy relationship
    // This requires joining with the policies table
    return await this.claimRepository
      .createQueryBuilder('claim')
      .innerJoin('claim.policy', 'policy')
      .where('policy.user_id = :userId', { userId })
      .getMany();
  }

  async getClaimsByStatus(status: ClaimStatus) {
    return await this.claimRepository.find({ where: { status } });
  }

  async updateClaimStatus(claimId: string, newStatus: ClaimStatus) {
    const claim = await this.getClaimById(claimId);
    if (claim) {
      claim.status = newStatus;
      return await this.claimRepository.save(claim);
    }
    return null;
  }

  async addPhotosToClaim(claimId: string, photos: string[]) {
    const claim = await this.getClaimById(claimId);
    if (claim) {
      claim.photos = [...(claim.photos || []), ...photos];
      return await this.claimRepository.save(claim);
    }
    return null;
  }

  async updateDamageDescription(claimId: string, description: string) {
    const claim = await this.getClaimById(claimId);
    if (claim) {
      claim.damage_description = description;
      return await this.claimRepository.save(claim);
    }
    return null;
  }

  async getAllClaims() {
    return await this.claimRepository.find();
  }

  async getClaimStatistics() {
    const claims = await this.getAllClaims();
    return {
      total: claims.length,
      pending: claims.filter((c) => c.status === 'pending').length,
      approved: claims.filter((c) => c.status === 'approved').length,
      rejected: claims.filter((c) => c.status === 'rejected').length,
    };
  }

  async deleteClaim(claimId: string) {
    const claim = await this.getClaimById(claimId);
    if (claim) {
      return await this.claimRepository.remove(claim);
    }
    return null;
  }
}
