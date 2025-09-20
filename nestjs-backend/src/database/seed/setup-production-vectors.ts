import { Client } from 'pg';
import { FaqParserService } from '../../common/vectorizer/faq-parser.service';
import { TextVectorizerService } from '../../common/vectorizer/text-vectorizer.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface KnowledgeBaseEntry {
  doc_id: string;
  source_type: string;
  text_chunk: string;
  embedding: number[] | null;
  metadata: any;
}

class ProductionFAQVectorProcessor {
  private faqParser: FaqParserService;
  private vectorizer: TextVectorizerService;
  private client: Client;

  constructor(databaseUrl?: string) {
    const dbUrl = databaseUrl || process.env.DATABASE_URL || process.env.DB_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL or DB_URL environment variable is not set');
    }
    
    this.faqParser = new FaqParserService();
    this.vectorizer = new TextVectorizerService();
    this.client = new Client({
      connectionString: dbUrl,
    });
  }

  async processFAQVectors(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Connected to production database');

      // Read FAQ file
      const faqPath = path.join(__dirname, 'data', 'knowledge_base', 'faq.md');
      const faqContent = fs.readFileSync(faqPath, 'utf8');
      console.log('📚 FAQ content loaded');

      // Parse FAQ items
      const faqItems = this.faqParser.parseFAQ(faqContent);
      console.log(`📝 Parsed ${faqItems.length} FAQ items`);

      // Clear existing FAQ entries
      await this.client.query('DELETE FROM knowledge_base WHERE source_type = $1', ['faq']);
      console.log('🗑️  Cleared existing FAQ entries');

      // Generate vectors and store in database
      for (const item of faqItems) {
        const vector = await this.vectorizer.generateVector(item.textChunk);
        
        const query = `
          INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata)
          VALUES ($1, $2, $3, $4)
        `;

        const values = [
          'faq',
          item.textChunk,
          `[${vector.join(',')}]`, // Convert array to PostgreSQL array format
          {
            question: item.question,
            answer: item.answer,
            category: 'general',
            version: '2024',
            environment: 'production',
            original_id: `faq-prod-${item.id}` // Store original ID in metadata for tracking
          }
        ];

        await this.client.query(query, values);
        console.log(`✨ Processed FAQ item ${item.id}: ${item.question.substring(0, 50)}...`);
      }

      console.log(`\n🎉 Successfully processed ${faqItems.length} FAQ items with vector embeddings`);

      // Verify the data
      const result = await this.client.query(
        'SELECT COUNT(*) FROM knowledge_base WHERE source_type = $1 AND embedding IS NOT NULL',
        ['faq']
      );
      console.log(`✅ Verification: ${result.rows[0].count} FAQ entries with embeddings in database`);

    } catch (error) {
      console.error('❌ Error processing FAQ vectors:', error);
      throw error;
    } finally {
      await this.client.end();
      console.log('🔌 Database connection closed');
    }
  }

  async verifyVectorSearch(): Promise<void> {
    try {
      await this.client.connect();
      console.log('\n🔍 Testing production vector search functionality...');

      // Test queries
      const testQueries = [
        'What is covered in the Gold plan?',
        'How do I submit a claim?',
        'What is the deductible for Gold plan?',
        'How much does premium cost?'
      ];

      for (const query of testQueries) {
        console.log(`\n📋 Query: "${query}"`);
        console.log('==========================================');

        const queryVector = await this.vectorizer.generateVector(query);

        const searchQuery = `
          SELECT 
            doc_id,
            text_chunk,
            metadata,
            1 - (embedding <=> $1::vector) as similarity_score
          FROM knowledge_base 
          WHERE source_type = 'faq'
          ORDER BY embedding <=> $1::vector
          LIMIT 3
        `;

        const result = await this.client.query(searchQuery, [`[${queryVector.join(',')}]`]);
        
        result.rows.forEach((row, index) => {
          console.log(`\nResult ${index + 1} (Score: ${row.similarity_score.toFixed(4)}):`);
          console.log(`Question: ${row.metadata.question}`);
          console.log(`Answer: ${row.metadata.answer.substring(0, 100)}...`);
        });
      }

    } catch (error) {
      console.error('❌ Error testing vector search:', error);
    } finally {
      await this.client.end();
    }
  }

  async getDatabaseStats(): Promise<void> {
    try {
      await this.client.connect();
      console.log('\n📊 Production Database Statistics:');
      console.log('================================');

      // Get user count
      const userCount = await this.client.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users: ${userCount.rows[0].count}`);

      // Get policy count
      const policyCount = await this.client.query('SELECT COUNT(*) FROM policies');
      console.log(`📄 Policies: ${policyCount.rows[0].count}`);

      // Get claim count by status
      const claimStats = await this.client.query(`
        SELECT status, COUNT(*) as count 
        FROM claims 
        GROUP BY status 
        ORDER BY count DESC
      `);
      console.log('📋 Claims by status:');
      claimStats.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count}`);
      });

      // Get knowledge base stats
      const kbStats = await this.client.query(`
        SELECT source_type, COUNT(*) as count 
        FROM knowledge_base 
        GROUP BY source_type
      `);
      console.log('📚 Knowledge Base entries:');
      kbStats.rows.forEach(row => {
        console.log(`   ${row.source_type}: ${row.count}`);
      });

      // Get premium history count
      const premiumCount = await this.client.query('SELECT COUNT(*) FROM premium_history');
      console.log(`💰 Premium History records: ${premiumCount.rows[0].count}`);

    } catch (error) {
      console.error('❌ Error getting database stats:', error);
    } finally {
      await this.client.end();
    }
  }
}

// Main execution
async function main() {
  const processor = new ProductionFAQVectorProcessor();
  
  try {
    console.log('🚀 Starting production FAQ vector processing...\n');

    // Process FAQ vectors
    await processor.processFAQVectors();
    
    // Get database statistics
    await processor.getDatabaseStats();
    
    // Test vector search
    await processor.verifyVectorSearch();
    
    console.log('\n✅ Production FAQ vector processing completed successfully!');
    console.log('\n🎯 Production database is ready for demo!');
    
  } catch (error) {
    console.error('\n❌ Production FAQ vector processing failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { ProductionFAQVectorProcessor };
