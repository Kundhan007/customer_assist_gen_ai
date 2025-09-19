import { Injectable } from '@nestjs/common';
import { ClaimStatus } from './dto/update-claim-status.dto';

@Injectable()
export class ClaimsService {
  // Mock data store
  private claims = [
    {
      id: '1',
      policyId: 'policy-123',
      description: 'Car accident on the highway',
      vehicle: 'Toyota Camry',
      photos: ['photo1.jpg', 'photo2.jpg'],
      status: ClaimStatus.PENDING,
    },
  ];

  createClaim(
    policyId: string,
    description: string,
    vehicle?: string,
    photos?: string[],
  ) {
    const newClaim = {
      id: Date.now().toString(),
      policyId,
      description,
      vehicle,
      photos,
      status: ClaimStatus.PENDING,
    };
    this.claims.push(newClaim);
    return newClaim;
  }

  getClaimById(claimId: string) {
    return this.claims.find((claim) => claim.id === claimId);
  }

  getClaimsByPolicy(policyId: string) {
    return this.claims.filter((claim) => claim.policyId === policyId);
  }

  getClaimsByStatus(status: ClaimStatus) {
    return this.claims.filter((claim) => claim.status === status);
  }

  updateClaimStatus(claimId: string, newStatus: ClaimStatus) {
    const claim = this.getClaimById(claimId);
    if (claim) {
      claim.status = newStatus;
      return claim;
    }
    return null;
  }

  addPhotosToClaim(claimId: string, photos: string[]) {
    const claim = this.getClaimById(claimId);
    if (claim) {
      claim.photos = [...(claim.photos || []), ...photos];
      return claim;
    }
    return null;
  }

  updateDamageDescription(claimId: string, description: string) {
    const claim = this.getClaimById(claimId);
    if (claim) {
      claim.description = description;
      return claim;
    }
    return null;
  }

  getAllClaims() {
    return this.claims;
  }

  getClaimStatistics() {
    // Placeholder for statistics logic
    return {
      total: this.claims.length,
      pending: this.claims.filter((c) => c.status === ClaimStatus.PENDING).length,
      approved: this.claims.filter((c) => c.status === ClaimStatus.APPROVED).length,
      rejected: this.claims.filter((c) => c.status === ClaimStatus.REJECTED).length,
    };
  }

  deleteClaim(claimId: string) {
    const index = this.claims.findIndex((claim) => claim.id === claimId);
    if (index !== -1) {
      const deletedClaim = this.claims.splice(index, 1);
      return deletedClaim[0];
    }
    return null;
  }
}
