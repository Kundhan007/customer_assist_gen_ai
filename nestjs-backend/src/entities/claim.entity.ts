import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { Policy } from './policy.entity';

@Entity('claims')
@Index(['claim_id'], { unique: true })
@Index(['policy_id'])
export class Claim {
  @PrimaryColumn()
  claim_id!: string;

  @Column({
    type: 'varchar',
    default: 'Submitted'
  })
  status!: string;

  @Column({ type: 'text' })
  damage_description!: string;

  @Column()
  vehicle!: string;

  @Column({ type: 'text', array: true, default: [] })
  photos!: string[];

  @Column({ name: 'policy_id' })
  policy_id!: string;

  @ManyToOne(() => Policy, policy => policy.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy!: Policy;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'last_updated' })
  last_updated!: Date;
}
