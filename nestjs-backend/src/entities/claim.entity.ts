import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Policy } from './policy.entity';

@Entity()
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'simple-array' })
  photos: string[];

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  damageDescription: string;

  @ManyToOne(() => User, user => user.claims)
  user: User;

  @ManyToOne(() => Policy, policy => policy.claims)
  policy: Policy;
}
