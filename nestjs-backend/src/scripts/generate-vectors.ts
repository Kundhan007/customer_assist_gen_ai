import { FaqParserService } from '../common/vectorizer/faq-parser.service';
import { TextVectorizerService } from '../common/vectorizer/text-vectorizer.service';
import * as fs from 'fs';
import * as path from 'path';

interface VectorTestResult {
  text: string;
  vector: number[];
  magnitude: number;
  sampleValues: number[];
}

class VectorUtility {
  private faqParser: FaqParserService;
  private vectorizer: TextVectorizerService;

  constructor() {
    this.faqParser = new FaqParserService();
    this.vectorizer = new TextVectorizerService();
  }

  /**
   * Test vector generation with sample texts
   */
  async testVectorGeneration(): Promise<void> {
    console.log('🧪 Testing Vector Generation\n');
    console.log('================================');

    const testTexts = [
      'What is covered in the Gold plan?',
      'How do I submit a claim?',
      'What is the deductible amount?',
      'Gold plan includes roadside assistance',
      'Claim processing takes 7-10 working days'
    ];

    const results: VectorTestResult[] = [];

    for (const text of testTexts) {
      console.log(`\n📝 Text: "${text}"`);
      
      const vector = await this.vectorizer.generateVector(text);
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      
      const result: VectorTestResult = {
        text,
        vector,
        magnitude,
        sampleValues: vector.slice(0, 5) // Show first 5 values
      };

      results.push(result);

      console.log(`📊 Vector dimension: ${vector.length}`);
      console.log(`📏 Magnitude: ${magnitude.toFixed(6)}`);
      console.log(`🔢 Sample values: [${result.sampleValues.map(v => v.toFixed(4)).join(', ')}...]`);
    }

    // Test similarity between vectors
    console.log('\n🔍 Testing Vector Similarity');
    console.log('================================');

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const similarity = this.vectorizer.calculateCosineSimilarity(
          results[i]?.vector || [], 
          results[j]?.vector || []
        );
        
        console.log(`\n"${results[i]?.text || ''}" vs "${results[j]?.text || ''}"`);
        console.log(`Similarity: ${similarity.toFixed(4)}`);
      }
    }
  }

  /**
   * Test FAQ parsing
   */
  async testFAQParsing(): Promise<void> {
    console.log('\n📚 Testing FAQ Parsing');
    console.log('================================');

    // Test with sample FAQ content
    const sampleFAQ = `1. What is covered in the Gold plan? The Gold plan covers collision, comprehensive, liability, and includes roadside assistance.
2. How do I submit a claim? You can submit a claim online through your account portal or by calling our claims department.
3. What is the deductible for Gold plan? The deductible for Gold plan is typically ₹5,000.`;

    const faqItems = this.faqParser.parseFAQ(sampleFAQ);
    
    console.log(`\n📝 Parsed ${faqItems.length} FAQ items:`);
    
    faqItems.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Question: ${item.question}`);
      console.log(`  Answer: ${item.answer}`);
      console.log(`  Text Chunk: ${item.textChunk}`);
    });
  }

  /**
   * Test batch vector generation
   */
  async testBatchVectorGeneration(): Promise<void> {
    console.log('\n🚀 Testing Batch Vector Generation');
    console.log('================================');

    const texts = [
      'Gold plan benefits',
      'Silver plan coverage',
      'Claim submission process',
      'Premium calculation',
      'Deductible information'
    ];

    console.log(`\n📝 Generating vectors for ${texts.length} texts...`);
    
    const startTime = Date.now();
    const vectors = await this.vectorizer.generateVectorsBatch(texts);
    const endTime = Date.now();

    console.log(`✅ Generated ${vectors.length} vectors in ${endTime - startTime}ms`);
    
    vectors.forEach((vector, index) => {
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      console.log(`\nText ${index + 1}: "${texts[index]}"`);
      console.log(`  Dimension: ${vector.length}`);
      console.log(`  Magnitude: ${magnitude.toFixed(6)}`);
      console.log(`  Sample: [${vector.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
    });
  }

  /**
   * Test with actual FAQ file
   */
  async testWithActualFAQ(): Promise<void> {
    console.log('\n📄 Testing with Actual FAQ File');
    console.log('================================');

    // Try to find FAQ file in different locations
    const faqPaths = [
      path.join(__dirname, '..', 'database', 'seed', 'data', 'knowledge_base', 'faq.md'),
      path.join(__dirname, '..', '..', 'test', 'data', 'knowledge_base', 'faq.md'),
      path.join(__dirname, '..', '..', '..', 'data', 'knowledge_base', 'faq.md')
    ];

    let faqContent = null;
    let usedPath = null;

    for (const faqPath of faqPaths) {
      try {
        if (fs.existsSync(faqPath)) {
          faqContent = fs.readFileSync(faqPath, 'utf8');
          usedPath = faqPath;
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    if (!faqContent) {
      console.log('❌ FAQ file not found in any of the expected locations');
      return;
    }

    console.log(`✅ Found FAQ file at: ${usedPath}`);
    
    const faqItems = this.faqParser.parseFAQ(faqContent);
    console.log(`📝 Parsed ${faqItems.length} FAQ items`);

    // Generate vectors for first 3 items as a sample
    const sampleItems = faqItems.slice(0, 3);
    console.log(`\n🧪 Generating vectors for first ${sampleItems.length} items...`);

    for (const item of sampleItems) {
      const vector = await this.vectorizer.generateVector(item.textChunk);
      console.log(`\nFAQ ${item.id}: "${item.question}"`);
      console.log(`  Vector dimension: ${vector.length}`);
      console.log(`  Sample values: [${vector.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 NestJS Vector Utility - Running All Tests\n');
    console.log('=============================================');

    try {
      await this.testVectorGeneration();
      await this.testFAQParsing();
      await this.testBatchVectorGeneration();
      await this.testWithActualFAQ();

      console.log('\n✅ All vector tests completed successfully!');
      console.log('\n📊 Vector System Summary:');
      console.log(`   - Vector dimension: ${this.vectorizer.getVectorDimension()}`);
      console.log(`   - Generation method: Hash-based (deterministic)`);
      console.log(`   - Normalization: Unit length`);
      console.log(`   - Similarity metric: Cosine similarity`);

    } catch (error) {
      console.error('\n❌ Vector testing failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const utility = new VectorUtility();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NestJS Vector Utility

Usage: npm run generate-vectors [options]

Options:
  --help, -h     Show this help message
  --test         Run all vector tests (default)
  --faq          Test FAQ parsing only
  --batch        Test batch vector generation only
  --actual       Test with actual FAQ file only

Examples:
  npm run generate-vectors              # Run all tests
  npm run generate-vectors --faq       # Test FAQ parsing only
  npm run generate-vectors --batch     # Test batch generation only
    `);
    process.exit(0);
  }

  if (args.includes('--faq')) {
    await utility.testFAQParsing();
  } else if (args.includes('--batch')) {
    await utility.testBatchVectorGeneration();
  } else if (args.includes('--actual')) {
    await utility.testWithActualFAQ();
  } else {
    await utility.runAllTests();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { VectorUtility };
