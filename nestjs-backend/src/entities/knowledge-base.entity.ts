import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('knowledge_base')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  doc_id!: string;

  @Column()
  source_type!: string;

  @Column('text')
  text_chunk!: string;

  @Column('simple-array')
  embedding!: number[];

  @Column({ type: 'jsonb', nullable: true })
  metadata!: any;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
