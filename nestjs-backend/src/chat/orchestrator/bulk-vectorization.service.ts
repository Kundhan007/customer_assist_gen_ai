import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

interface VectorizationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

interface FAQRecord {
  doc_id: string;
  text_chunk: string;
  metadata: any;
}

interface VectorUpdate {
  doc_id: string;
  vector: number[];
}

@Injectable()
export class BulkVectorizationService {
  private readonly logger = new Logger(BulkVectorizationService.name);
  private readonly pythonOrchestratorUrl: string;

  constructor(private configService: ConfigService) {
    this.pythonOrchestratorUrl = this.configService.get<string>('ORCHESTRATOR_URL') || 'http://localhost:2345';
  }

  async vectorizeFAQs(): Promise<VectorizationResult> {
    try {
      this.logger.log('Starting FAQ bulk vectorization process...');

      // Get database configuration
      const dbConfig = this.getDbConfig();
      const client = new Client(dbConfig);

      await client.connect();
      this.logger.log('Connected to database');

      // Get unvectorized FAQ records
      const faqRecords = await this.getUnvectorizedFAQs(client);
      this.logger.log(`Found ${faqRecords.length} FAQ records to vectorize`);

      if (faqRecords.length === 0) {
        this.logger.log('No FAQ records need vectorization');
        await client.end();
        return {
          success: true,
          processed: 0,
          failed: 0,
          errors: []
        };
      }

      // Extract text chunks for vectorization
      const textChunks = faqRecords.map(record => record.text_chunk);

      // Send to Python for vectorization
      this.logger.log('Sending text chunks to Python vectorization service...');
      const vectors = await this.callPythonVectorization(textChunks);

      if (vectors.length !== textChunks.length) {
        throw new Error(`Vector count mismatch: expected ${textChunks.length}, got ${vectors.length}`);
      }

      // Prepare updates for bulk operation
      const updates: VectorUpdate[] = faqRecords.map((record, index) => ({
        doc_id: record.doc_id,
        vector: vectors[index] || []
      }));

      // Bulk update database
      this.logger.log('Updating database with vectors...');
      await this.bulkUpdateVectors(client, updates);

      await client.end();
      this.logger.log('Database connection closed');

      this.logger.log(`✅ Successfully vectorized ${updates.length} FAQ records`);

      return {
        success: true,
        processed: updates.length,
        failed: 0,
        errors: []
      };

    } catch (error) {
      this.logger.error('❌ FAQ vectorization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [errorMessage]
      };
    }
  }

  private async getUnvectorizedFAQs(client: Client): Promise<FAQRecord[]> {
    const query = `
      SELECT doc_id, text_chunk, metadata
      FROM knowledge_base 
      WHERE source_type = $1 AND embedding IS NULL
      ORDER BY doc_id
    `;

    const result = await client.query(query, ['faq']);
    return result.rows;
  }

  private async callPythonVectorization(textChunks: string[]): Promise<number[][]> {
    try {
      // Dynamically import HttpService to avoid circular dependency
      const { HttpService } = require('@nestjs/axios');
      const { firstValueFrom } = require('rxjs');
      const { catchError } = require('rxjs/operators');
      const { AxiosError } = require('axios');

      const httpService = new HttpService();

      const payload = {
        texts: textChunks
      };

      this.logger.log(`Making request to ${this.pythonOrchestratorUrl}/vectorize-batch with ${textChunks.length} chunks`);

      const response = await firstValueFrom(
        httpService.post(`${this.pythonOrchestratorUrl}/vectorize-batch`, payload).pipe(
          catchError((error: any) => {
            this.logger.error('Python vectorization service error:', (error as Error).message);
            if (error.response) {
              this.logger.error('Error response data:', error.response.data);
              this.logger.error('Error response status:', error.response.status);
            }
            throw new Error(`Failed to call Python vectorization service: ${(error as Error).message}`);
          })
        )
      );

      const { vectors } = response.data;
      this.logger.log(`Received ${vectors.length} vectors from Python service`);

      return vectors;
    } catch (error) {
      this.logger.error('Error calling Python vectorization service:', error);
      throw error;
    }
  }

  private async bulkUpdateVectors(client: Client, updates: VectorUpdate[]): Promise<void> {
    try {
      // Use a transaction for bulk updates
      await client.query('BEGIN');

      for (const update of updates) {
        const query = `
          UPDATE knowledge_base 
          SET embedding = $1
          WHERE doc_id = $2
        `;

        await client.query(query, [`[${update.vector.join(',')}]`, update.doc_id]);
      }

      await client.query('COMMIT');
      this.logger.log(`Successfully updated ${updates.length} records`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error during bulk update:', error);
      throw error;
    }
  }

  private getDbConfig() {
    const dbUrl = this.configService.get<string>('DB_URL');
    if (!dbUrl) {
      throw new Error('DB_URL environment variable is not set');
    }

    // Parse the database URL
    const url = new URL(dbUrl);
    return {
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.substring(1) // Remove leading slash
    };
  }

  async getVectorizationStatus(): Promise<{
    total: number;
    vectorized: number;
    unvectorized: number;
  }> {
    try {
      const dbConfig = this.getDbConfig();
      const client = new Client(dbConfig);

      await client.connect();

      const totalQuery = 'SELECT COUNT(*) FROM knowledge_base WHERE source_type = $1';
      const vectorizedQuery = 'SELECT COUNT(*) FROM knowledge_base WHERE source_type = $1 AND embedding IS NOT NULL';
      const unvectorizedQuery = 'SELECT COUNT(*) FROM knowledge_base WHERE source_type = $1 AND embedding IS NULL';

      const [totalResult, vectorizedResult, unvectorizedResult] = await Promise.all([
        client.query(totalQuery, ['faq']),
        client.query(vectorizedQuery, ['faq']),
        client.query(unvectorizedQuery, ['faq'])
      ]);

      await client.end();

      return {
        total: parseInt(totalResult.rows[0].count),
        vectorized: parseInt(vectorizedResult.rows[0].count),
        unvectorized: parseInt(unvectorizedResult.rows[0].count)
      };
    } catch (error) {
      this.logger.error('Error getting vectorization status:', error);
      throw error;
    }
  }
}
