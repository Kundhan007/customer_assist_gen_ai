import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Claim } from './claim.entity';
import { Premium } from './premium.entity';

@Entity('policies')
@Index(['policy_id'], { unique: true })
@Index(['user_id'])
export class Policy {
  @PrimaryColumn()
  policy_id!: string;

  @Column({
    type: 'enum',
    enum: ['Silver', 'Gold']
  })
  plan_name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  collision_coverage!: number;

  @Column({ default: false })
  roadside_assistance!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deductible!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium!: number;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ name: 'user_id' })
  user_id!: string;

  @ManyToOne(() => User, user => user.policies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Claim, claim => claim.policy, { cascade: true })
  claims!: Claim[];

  @OneToMany(() => Premium, premium => premium.policy, { cascade: true })
  premiums!: Premium[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

}
