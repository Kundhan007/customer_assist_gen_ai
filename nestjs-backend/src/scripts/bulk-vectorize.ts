#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BulkVectorizationService } from '../chat/orchestrator/bulk-vectorization.service';
import { ConfigService } from '@nestjs/config';
import * as chalk from 'chalk';

async function bootstrap() {
  try {
    console.log(chalk.blue('🚀 Starting FAQ bulk vectorization...'));

    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get services
    const bulkVectorizationService = app.get(BulkVectorizationService);
    const configService = app.get(ConfigService);

    // Check vectorization status first
    console.log(chalk.yellow('📊 Checking current vectorization status...'));
    const status = await bulkVectorizationService.getVectorizationStatus();
    
    console.log(chalk.cyan('Current Status:'));
    console.log(chalk.cyan(`  Total FAQ records: ${status.total}`));
    console.log(chalk.cyan(`  Vectorized: ${status.vectorized}`));
    console.log(chalk.cyan(`  Unvectorized: ${status.unvectorized}`));

    if (status.unvectorized === 0) {
      console.log(chalk.green('✅ All FAQ records are already vectorized!'));
      await app.close();
      return;
    }

    // Get Python orchestrator URL
    const orchestratorUrl = configService.get<string>('ORCHESTRATOR_URL') || 'http://localhost:2345';
    console.log(chalk.yellow(`🔗 Using Python orchestrator at: ${orchestratorUrl}`));

    // Perform vectorization
    console.log(chalk.yellow('🔄 Starting bulk vectorization...'));
    const result = await bulkVectorizationService.vectorizeFAQs();

    if (result.success) {
      console.log(chalk.green(`✅ Successfully vectorized ${result.processed} FAQ records!`));
      
      // Check final status
      const finalStatus = await bulkVectorizationService.getVectorizationStatus();
      console.log(chalk.cyan('Final Status:'));
      console.log(chalk.cyan(`  Total FAQ records: ${finalStatus.total}`));
      console.log(chalk.cyan(`  Vectorized: ${finalStatus.vectorized}`));
      console.log(chalk.cyan(`  Unvectorized: ${finalStatus.unvectorized}`));
    } else {
      console.log(chalk.red('❌ Vectorization failed:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
      process.exit(1);
    }

    await app.close();
  } catch (error) {
    console.error(chalk.red('❌ Fatal error:'));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

bootstrap();
