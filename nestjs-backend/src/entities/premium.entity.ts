import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Policy } from './policy.entity';

@Entity()
export class Premium {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousCoverage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newCoverage: number;

  @Column()
  calculationDate: string;

  @ManyToOne(() => Policy, policy => policy.premiums)
  policy: Policy;
}
