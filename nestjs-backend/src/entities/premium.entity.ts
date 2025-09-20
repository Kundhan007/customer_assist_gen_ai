import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Policy } from './policy.entity';

@Entity('premium_history')
@Index(['policy_id'])
export class Premium {
  @PrimaryColumn({ name: 'premium_id' })
  premium_id!: number;

  @Column({ name: 'current_coverage', type: 'int' })
  currentCoverage!: number;

  @Column({ name: 'new_coverage', type: 'int' })
  newCoverage!: number;

  @Column({ name: 'current_premium', type: 'decimal', precision: 10, scale: 2 })
  currentPremium!: number;

  @Column({ name: 'new_premium', type: 'decimal', precision: 10, scale: 2 })
  newPremium!: number;

  @Column({ name: 'calculation_date', type: 'timestamp' })
  calculationDate!: Date;

  @Column({ name: 'policy_id' })
  policy_id!: string;

  @ManyToOne(() => Policy, policy => policy.premiums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy!: Policy;
}
