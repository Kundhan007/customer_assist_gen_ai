import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Claim } from './claim.entity';
import { Premium } from './premium.entity';

@Entity()
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coverageAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium: number;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @ManyToOne(() => User, user => user.policies)
  user: User;

  @OneToMany(() => Claim, claim => claim.policy)
  claims: Claim[];

  @OneToMany(() => Premium, premium => premium.policy)
  premiums: Premium[];
}
