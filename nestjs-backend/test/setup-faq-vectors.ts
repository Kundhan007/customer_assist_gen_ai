import { Client } from 'pg';
import { FaqParserService } from '../src/common/vectorizer/faq-parser.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

const getDbConfig = () => {
  const dbUrl = process.env.DB_URL;
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
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  textChunk: string;
}

class FAQDataSeeder {
  private faqParser: FaqParserService;
  private client: Client;

  constructor() {
    this.faqParser = new FaqParserService();
    const dbConfig = getDbConfig();
    this.client = new Client({
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
    });
  }

  async seedFAQData(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to test database');

      // Clear existing FAQ entries only
      await this.client.query('DELETE FROM knowledge_base WHERE source_type = $1', ['faq']);
      console.log('Cleared existing FAQ entries');

      // Process FAQ items
      await this.processFAQs();

      // Verify the data
      const result = await this.client.query(
        'SELECT COUNT(*) FROM knowledge_base WHERE source_type = $1', ['faq']
      );
      console.log(`\nVerification: ${result.rows[0].count} FAQ entries seeded in database (without vectors)`);

    } catch (error) {
      console.error('Error seeding FAQ data:', error);
      throw error;
    } finally {
      await this.client.end();
      console.log('Database connection closed');
    }
  }

  private async processFAQs(): Promise<void> {
    // Read FAQ file
    const faqPath = path.join(__dirname, 'data', 'knowledge_base', 'faq.md');
    const faqContent = fs.readFileSync(faqPath, 'utf8');
    console.log('FAQ content loaded');

    // Parse FAQ items
    const faqItems = this.faqParser.parseFAQ(faqContent);
    console.log(`Parsed ${faqItems.length} FAQ items`);

    // Store FAQ items in database without vectors (embedding = NULL)
    for (const item of faqItems) {
      const query = `
        INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata)
        VALUES ($1, $2, $3, $4)
      `;

      const values = [
        'faq',
        item.textChunk,
        null, // Embedding will be set to NULL for now
        {
          question: item.question,
          answer: item.answer,
          category: 'general',
          version: '2024',
          original_id: `faq-${item.id}`
        }
      ];

      await this.client.query(query, values);
      console.log(`Seeded FAQ item ${item.id}: ${item.question.substring(0, 50)}...`);
    }
  }

  async getUnvectorizedFAQs(): Promise<Array<{id: number, text_chunk: string, metadata: any}>> {
    try {
      await this.client.connect();
      
      const query = `
        SELECT id, text_chunk, metadata
        FROM knowledge_base 
        WHERE source_type = $1 AND embedding IS NULL
        ORDER BY id
      `;
      
      const result = await this.client.query(query, ['faq']);
      return result.rows;
    } catch (error) {
      console.error('Error getting unvectorized FAQs:', error);
      throw error;
    } finally {
      await this.client.end();
    }
  }
}

// Main execution
async function main() {
  const seeder = new FAQDataSeeder();
  
  try {
    await seeder.seedFAQData();
    console.log('\n✅ FAQ data seeding completed successfully!');
    console.log('Note: Vectors are set to NULL. Run bulk vectorization to add embeddings.');
  } catch (error) {
    console.error('\n❌ FAQ data seeding failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { FAQDataSeeder };
