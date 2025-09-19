import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Claim } from './claim.entity';
import { Policy } from './policy.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToMany(() => Policy, policy => policy.user)
  policies: Policy[];

  @OneToMany(() => Claim, claim => claim.user)
  claims: Claim[];
}
