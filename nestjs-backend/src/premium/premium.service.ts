import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Premium } from '../entities/premium.entity';

@Injectable()
export class PremiumService {
  constructor(
    @InjectRepository(Premium)
    private readonly premiumRepository: Repository<Premium>,
  ) {}

  async calculatePremium(
    policyId: string,
    previous_coverage?: number,
    new_coverage?: number,
  ) {
    // Simplified premium calculation logic
    const basePremium = 100;
    const coverageFactor = new_coverage ? new_coverage / 1000 : 1;
    const calculatedPremium = basePremium * coverageFactor;

    // Create premium record - let database generate the premium_id
    const premium = new Premium();
    premium.currentCoverage = previous_coverage || 0;
    premium.newCoverage = new_coverage || 0;
    premium.currentPremium = basePremium;
    premium.newPremium = calculatedPremium;
    premium.calculationDate = new Date();
    premium.policy_id = policyId;

    // Remove the premium_id assignment to let the database auto-generate it
    delete (premium as any).premium_id;

    await this.premiumRepository.save(premium);

    return { policy_id: policyId, calculatedPremium };
  }

  async getPremiumHistory(policyId: string) {
    const history = await this.premiumRepository.find({
      where: { policy_id: policyId },
      order: { calculationDate: 'DESC' },
    });

    return history.map(record => ({
      policy_id: record.policy_id,
      amount: record.newPremium,
      date: record.calculationDate.toISOString(),
    }));
  }
}
