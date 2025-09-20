import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ProductionFAQVectorProcessor } from '../database/seed/setup-production-vectors';

// Load environment variables
dotenv.config();

const getDbConfig = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL or DB_URL environment variable is not set');
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

const createProductionDatabase = async () => {
  const dbConfig = getDbConfig();
  const client = new Client({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres', // Connect to the default 'postgres' database to create a new one
  });

  try {
    await client.connect();
    const dbName = 'car_insurance';
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('❌ Error creating production database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const runProductionSchemaSetup = async () => {
  const dbConfig = getDbConfig();
  const client = new Client({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'car_insurance',
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database for schema setup');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'seed', 'production-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSQL);
    console.log('✅ Production database schema created successfully');

  } catch (err) {
    console.error('❌ Error setting up production database schema:', err);
    throw err;
  } finally {
    await client.end();
  }
};

const runProductionSeedData = async () => {
  const dbConfig = getDbConfig();
  const client = new Client({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'car_insurance',
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database for seeding');

    // Read and execute seed data file
    const seedPath = path.join(__dirname, '..', 'database', 'seed', 'production-seed-data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    await client.query(seedSQL);
    console.log('✅ Production data seeded successfully');

  } catch (err) {
    console.error('❌ Error seeding production data:', err);
    throw err;
  } finally {
    await client.end();
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting production database setup...\n');

    // Step 1: Create database if it doesn't exist
    await createProductionDatabase();
    
    // Step 2: Set up production database schema
    await runProductionSchemaSetup();
    
    // Step 3: Seed production data
    await runProductionSeedData();
    
    // Step 4: Process FAQ vectors
    console.log('\n📚 Processing production FAQ vectors...');
    const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL;
    const faqProcessor = new ProductionFAQVectorProcessor(databaseUrl);
    await faqProcessor.processFAQVectors();
    
    console.log('\n✅ Production database setup completed successfully!');
    console.log('\n📊 Production Database Summary:');
    console.log('   - Users: 6 (4 regular users, 1 admin, 1 demo user)');
    console.log('   - Policies: 5 (3 Gold, 2 Silver)');
    console.log('   - Claims: 7 (various statuses including real-world scenarios)');
    console.log('   - Premium History: 7 records');
    console.log('   - Knowledge Base: 20 FAQ entries with vector embeddings');
    console.log('\n🎯 Production database is ready for demo and testing!');
    
    // Show sample credentials
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Admin: demo.admin@example.com / password');
    console.log('   User:  demo.user@example.com / password');
    console.log('   User:  sarah.johnson@example.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Production database setup failed:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { createProductionDatabase, runProductionSchemaSetup, runProductionSeedData };
