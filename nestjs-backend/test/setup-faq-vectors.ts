import { Client } from 'pg';
import { FaqParserService } from '../src/common/vectorizer/faq-parser.service';
import { TextVectorizerService } from '../src/common/vectorizer/text-vectorizer.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

const getDbConfig = () => {
  const dbUrl = process.env.DB_URL;₹
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

interface KnowledgeBaseEntry {
  doc_id: string;
  source_type: string;
  text_chunk: string;
  embedding: number[] | null;
  metadata: any;
}

class FAQVectorProcessor {
  private faqParser: FaqParserService;
  private vectorizer: TextVectorizerService;
  private client: Client;

  constructor() {
    this.faqParser = new FaqParserService();
    this.vectorizer = new TextVectorizerService();
    const dbConfig = getDbConfig();
    this.client = new Client({
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
    });
  }

  async processKnowledgeBaseVectors(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to test database');

      // Clear existing knowledge base entries
      await this.client.query('DELETE FROM knowledge_base');
      console.log('Cleared existing knowledge base entries');

      // Process FAQ items
      await this.processFAQs();
      
      // Process policy documents
      await this.processPolicyDocuments();
      
      // Process claims procedures
      await this.processClaimsProcedures();
      
      // Process admin guidelines
      await this.processAdminGuidelines();

      // Verify the data
      const result = await this.client.query(
        'SELECT COUNT(*) FROM knowledge_base WHERE embedding IS NOT NULL'
      );
      console.log(`\nVerification: ${result.rows[0].count} total knowledge base entries with embeddings in database`);

    } catch (error) {
      console.error('Error processing knowledge base vectors:', error);
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
        `[${vector.join(',')}]`,
        {
          question: item.question,
          answer: item.answer,
          category: 'general',
          version: '2024',
          original_id: `faq-${item.id}`
        }
      ];

      await this.client.query(query, values);
      console.log(`Processed FAQ item ${item.id}: ${item.question.substring(0, 50)}...`);
    }
  }

  private async processPolicyDocuments(): Promise<void> {
    const policyDocuments = [
      {
        id: 'policy-001',
        content: 'Gold plan provides comprehensive coverage with benefits including roadside assistance, lower deductibles, and higher coverage limits up to ₹300,000. Includes annual health checkup and 24/7 customer support.',
        metadata: { type: 'coverage_details', plan: 'Gold', category: 'policy' }
      },
      {
        id: 'policy-002',
        content: 'Silver plan offers essential coverage with affordable premiums. Coverage limits up to ₹125,000 with standard deductibles. Optional roadside assistance available for additional cost.',
        metadata: { type: 'coverage_details', plan: 'Silver', category: 'policy' }
      },
      {
        id: 'policy-003',
        content: 'Policy exclusions include intentional damage, racing activities, unlicensed driving, and pre-existing conditions. Regular maintenance requirements must be met for coverage validity.',
        metadata: { type: 'exclusions', category: 'policy' }
      },
      {
        id: 'policy-004',
        content: 'Claims submission process: Report incident within 24 hours, provide photos and documentation, submit police report for theft/vandalism, use authorized repair centers for Gold plan benefits.',
        metadata: { type: 'claims_process', category: 'policy' }
      },
      {
        id: 'policy-005',
        content: 'Premium calculation factors: Vehicle age and type, driver history and age, coverage amount, deductible selected, location-based risk assessment, and optional add-ons like roadside assistance.',
        metadata: { type: 'premium_calculation', category: 'policy' }
      }
    ];

    console.log(`\nProcessing ${policyDocuments.length} policy documents...`);

    for (const doc of policyDocuments) {
      const vector = await this.vectorizer.generateVector(doc.content);
      
      const query = `
        INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata)
        VALUES ($1, $2, $3, $4)
      `;

      const values = [
        'policy',
        doc.content,
        `[${vector.join(',')}]`,
        { ...doc.metadata, original_id: doc.id }
      ];

      await this.client.query(query, values);
      console.log(`Processed policy document ${doc.id}: ${doc.metadata.type}`);
    }
  }

  private async processClaimsProcedures(): Promise<void> {
    const claimsProcedures = [
      {
        id: 'procedure-001',
        content: 'Step 1: Immediate incident reporting. Contact our 24/7 helpline or use mobile app within 24 hours of incident. Provide basic details including location, time, and nature of damage.',
        metadata: { type: 'claims_process', step: 'reporting', category: 'procedure' }
      },
      {
        id: 'procedure-002',
        content: 'Step 2: Documentation gathering. Take clear photos of all damage, collect witness information, obtain police report for theft/vandalism, and keep all repair receipts and estimates.',
        metadata: { type: 'claims_process', step: 'documentation', category: 'procedure' }
      },
      {
        id: 'procedure-003',
        content: 'Step 3: Claim submission. Complete online claim form with all documentation attached. For Gold plan, use authorized service centers for direct billing and faster processing.',
        metadata: { type: 'claims_process', step: 'submission', category: 'procedure' }
      },
      {
        id: 'procedure-004',
        content: 'Step 4: Review and approval process. Claims typically processed within 7-10 working days. You will receive status updates via email and SMS. Additional information may be requested.',
        metadata: { type: 'claims_process', step: 'review', category: 'procedure' }
      },
      {
        id: 'procedure-005',
        content: 'Step 5: Settlement and repair. Once approved, choose between authorized repair center (Gold plan benefit) or reimbursement for repairs at your preferred shop. Payment processed within 3-5 working days.',
        metadata: { type: 'claims_process', step: 'settlement', category: 'procedure' }
      }
    ];

    console.log(`\nProcessing ${claimsProcedures.length} claims procedures...`);

    for (const procedure of claimsProcedures) {
      const vector = await this.vectorizer.generateVector(procedure.content);
      
      const query = `
        INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata)
        VALUES ($1, $2, $3, $4)
      `;

      const values = [
        'procedure',
        procedure.content,
        `[${vector.join(',')}]`,
        { ...procedure.metadata, original_id: procedure.id }
      ];

      await this.client.query(query, values);
      console.log(`Processed claims procedure ${procedure.id}: ${procedure.metadata.step}`);
    }
  }

  private async processAdminGuidelines(): Promise<void> {
    const adminGuidelines = [
      {
        id: 'admin-001',
        content: 'Knowledge base document upload: Supported formats include PDF, DOC, DOCX, TXT, and MD. Maximum file size 10MB. Documents are processed for vector indexing within 5 minutes of upload.',
        metadata: { type: 'admin_procedure', action: 'upload', category: 'admin' }
      },
      {
        id: 'admin-002',
        content: 'Document deletion and retention: Deleted documents are permanently removed from vector index and database after 30-day retention period. Ensure proper backup before deletion of critical documents.',
        metadata: { type: 'admin_procedure', action: 'delete', category: 'admin' }
      },
      {
        id: 'admin-003',
        content: 'User management: Admin users can create, modify, and delete user accounts. Role assignments include user and admin privileges. Email verification required for new account creation.',
        metadata: { type: 'admin_procedure', action: 'user_management', category: 'admin' }
      },
      {
        id: 'admin-004',
        content: 'System monitoring: Monitor vector search performance, database health, and API response times. Regular maintenance includes vector index optimization and database cleanup.',
        metadata: { type: 'admin_procedure', action: 'monitoring', category: 'admin' }
      }
    ];

    console.log(`\nProcessing ${adminGuidelines.length} admin guidelines...`);

    for (const guideline of adminGuidelines) {
      const vector = await this.vectorizer.generateVector(guideline.content);
      
      const query = `
        INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata)
        VALUES ($1, $2, $3, $4)
      `;

      const values = [
        'admin',
        guideline.content,
        `[${vector.join(',')}]`,
        { ...guideline.metadata, original_id: guideline.id }
      ];

      await this.client.query(query, values);
      console.log(`Processed admin guideline ${guideline.id}: ${guideline.metadata.action}`);
    }
  }

  async verifyVectorSearch(): Promise<void> {
    try {
      await this.client.connect();
      console.log('\nTesting vector search functionality...');

      const testQueries = [
        'What is covered in the Gold plan?',
        'How do I submit a claim?',
        'What are the policy exclusions?',
        'How are premiums calculated?'
      ];

      for (const testQuery of testQueries) {
        console.log(`\nTesting query: "${testQuery}"`);
        console.log('==========================================');
        
        const queryVector = await this.vectorizer.generateVector(testQuery);

        const searchQuery = `
          SELECT 
            doc_id,
            source_type,
            text_chunk,
            metadata,
            1 - (embedding <=> $1::vector) as similarity_score
          FROM knowledge_base 
          ORDER BY embedding <=> $1::vector
          LIMIT 3
        `;

        const result = await this.client.query(searchQuery, [`[${queryVector.join(',')}]`]);
        
        result.rows.forEach((row, index) => {
          console.log(`\nResult ${index + 1} (Score: ${row.similarity_score.toFixed(4)}, Type: ${row.source_type}):`);
          if (row.metadata.question) {
            console.log(`Question: ${row.metadata.question}`);
            console.log(`Answer: ${row.metadata.answer.substring(0, 100)}...`);
          } else {
            console.log(`Content: ${row.text_chunk.substring(0, 100)}...`);
          }
        });
      }

    } catch (error) {
      console.error('Error testing vector search:', error);
    } finally {
      await this.client.end();
    }
  }
}

// Main execution
async function main() {
  const processor = new FAQVectorProcessor();
  
  try {
    await processor.processKnowledgeBaseVectors();
    await processor.verifyVectorSearch();
    console.log('\n✅ Knowledge base vector processing completed successfully!');
  } catch (error) {
    console.error('\n❌ Knowledge base vector processing failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { FAQVectorProcessor };
