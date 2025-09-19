import { Injectable } from '@nestjs/common';

@Injectable()
export class PremiumService {
  // Mock data store for premium history
  private premiumHistory = [
    { policyId: 'policy-123', amount: 500, date: new Date().toISOString() },
  ];

  calculatePremium(
    policyId: string,
    currentCoverage?: number,
    newCoverage?: number,
  ) {
    // Simplified premium calculation logic
    const basePremium = 100;
    const coverageFactor = newCoverage ? newCoverage / 1000 : 1;
    const premium = basePremium * coverageFactor;

    // Log the calculation
    this.premiumHistory.push({
      policyId,
      amount: premium,
      date: new Date().toISOString(),
    });

    return { policyId, calculatedPremium: premium };
  }

  getPremiumHistory(policyId: string) {
    return this.premiumHistory
      .filter((record) => record.policyId === policyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
