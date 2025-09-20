import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';
import { BulkVectorizationService } from './bulk-vectorization.service';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';
import { TextVectorizerService } from '../../common/vectorizer/text-vectorizer.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase])],
  controllers: [OrchestratorController, RagController],
  providers: [OrchestratorService, BulkVectorizationService, RagService, TextVectorizerService],
  exports: [OrchestratorService, BulkVectorizationService, RagService],
})
export class OrchestratorModule {}
