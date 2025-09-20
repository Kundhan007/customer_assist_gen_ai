import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextVectorizerService } from '../../common/vectorizer/text-vectorizer.service';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
    private readonly textVectorizerService: TextVectorizerService,
  ) {}

  async searchSimilarContent(query: string, limit: number = 5): Promise<any[]> {
    try {
      this.logger.log(`Searching for similar content with query: "${query}"`);
      
      // Generate vector for the query
      const queryVector = await this.textVectorizerService.generateVector(query);
      
      // Convert vector to PostgreSQL array format
      const vectorString = `[${queryVector.join(',')}]`;
      
      // Perform cosine similarity search without threshold
      const results = await this.knowledgeBaseRepository.query(
        `
        SELECT text_chunk, metadata
        FROM knowledge_base
        ORDER BY embedding <=> $1
        LIMIT $2
        `,
        [vectorString, limit]
      );
      
      this.logger.log(`Found ${results.length} similar results`);
      
      return results;
    } catch (error) {
      this.logger.error('Error searching similar content:', error);
      throw new Error('Failed to search similar content');
    }
  }

  async searchSimilarContentByVector(vector: number[], limit: number = 5): Promise<any[]> {
    try {
      this.logger.log(`Searching for similar content with pre-computed vector`);
      
      // Convert vector to PostgreSQL array format
      const vectorString = `[${vector.join(',')}]`;
      
      // Perform cosine similarity search using pre-computed vector without threshold
      const results = await this.knowledgeBaseRepository.query(
        `
        SELECT text_chunk, metadata
        FROM knowledge_base
        ORDER BY embedding <=> $1
        LIMIT $2
        `,
        [vectorString, limit]
      );
      
      this.logger.log(`Found ${results.length} similar results using vector search`);
      
      return results;
    } catch (error) {
      this.logger.error('Error searching similar content by vector:', error);
      throw new Error('Failed to search similar content by vector');
    }
  }
}
