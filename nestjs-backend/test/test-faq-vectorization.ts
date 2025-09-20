import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FAQDataSeeder } from './setup-faq-vectors';
import { BulkVectorizationService } from '../src/chat/orchestrator/bulk-vectorization.service';
import { ConfigService } from '@nestjs/config';

async function testFAQVectorization() {
  console.log('🧪 Starting FAQ Vectorization Test...\n');

  try {
    // Step 1: Create application context
    console.log('📋 Step 1: Creating application context...');
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Step 2: Get services
    console.log('📋 Step 2: Getting required services...');
    const configService = app.get(ConfigService);
    const bulkVectorizationService = app.get(BulkVectorizationService);
    
    // Step 3: Check Python orchestrator URL
    const orchestratorUrl = configService.get<string>('ORCHESTRATOR_URL') || 'http://localhost:2345';
    console.log(`📋 Step 3: Python orchestrator URL: ${orchestratorUrl}`);

    // Step 4: Clear and seed FAQ data
    console.log('📋 Step 4: Seeding FAQ data...');
    const seeder = new FAQDataSeeder();
    await seeder.seedFAQData();
    console.log('✅ FAQ data seeded successfully');

    // Step 5: Check initial vectorization status
    console.log('📋 Step 5: Checking initial vectorization status...');
    const initialStatus = await bulkVectorizationService.getVectorizationStatus();
    console.log(`Initial status - Total: ${initialStatus.total}, Vectorized: ${initialStatus.vectorized}, Unvectorized: ${initialStatus.unvectorized}`);

    if (initialStatus.unvectorized === 0) {
      console.log('❌ Test failed: No FAQ records need vectorization');
      await app.close();
      return;
    }

    // Step 6: Perform bulk vectorization
    console.log('📋 Step 6: Performing bulk vectorization...');
    const vectorizationResult = await bulkVectorizationService.vectorizeFAQs();
    
    if (!vectorizationResult.success) {
      console.log('❌ Test failed: Vectorization failed');
      console.log('Errors:', vectorizationResult.errors);
      await app.close();
      return;
    }

    console.log(`✅ Vectorization successful - Processed: ${vectorizationResult.processed} records`);

    // Step 7: Check final vectorization status
    console.log('📋 Step 7: Checking final vectorization status...');
    const finalStatus = await bulkVectorizationService.getVectorizationStatus();
    console.log(`Final status - Total: ${finalStatus.total}, Vectorized: ${finalStatus.vectorized}, Unvectorized: ${finalStatus.unvectorized}`);

    // Step 8: Validate results
    console.log('📋 Step 8: Validating results...');
    if (finalStatus.unvectorized === 0 && finalStatus.vectorized > 0) {
      console.log('✅ Test PASSED: All FAQ records successfully vectorized');
    } else {
      console.log('❌ Test FAILED: Not all FAQ records were vectorized');
      console.log(`Expected: All records vectorized`);
      console.log(`Actual: ${finalStatus.vectorized} vectorized, ${finalStatus.unvectorized} unvectorized`);
    }

    // Step 9: Test duplicate vectorization (should handle gracefully)
    console.log('📋 Step 9: Testing duplicate vectorization...');
    const duplicateResult = await bulkVectorizationService.vectorizeFAQs();
    
    if (duplicateResult.success && duplicateResult.processed === 0) {
      console.log('✅ Duplicate vectorization handled correctly (no records processed)');
    } else {
      console.log('⚠️  Duplicate vectorization warning: Processed records when none expected');
    }

    await app.close();
    console.log('\n🎉 FAQ Vectorization Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', (error as Error).message);
    console.error('Stack:', (error as Error).stack);
    process.exit(1);
  }
}

// Run the test
testFAQVectorization();
