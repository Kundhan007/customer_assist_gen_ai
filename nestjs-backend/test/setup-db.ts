import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { FAQDataSeeder } from './setup-faq-vectors';
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

const createTestDatabase = async () => {
  const dbConfig = getDbConfig();
  // Connect to the default 'postgres' database to create the test database
  const client = new Client({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres', // Default database for creating new databases
  });

  try {
    await client.connect();
    console.log(`Connected to postgres server to create database '${dbConfig.database}'`);

    // Check if database already exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`);
    if (res.rows.length > 0) {
      console.log(`Database '${dbConfig.database}' already exists.`);
    } else {
      // Create the database if it doesn't exist
      await client.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`Database '${dbConfig.database}' created successfully.`);
    }
  } catch (err) {
    console.error('Error creating test database:', err);
    throw err;
  } finally {
    await client.end();
  }
};

const runSchemaSetup = async () => {
  const dbConfig = getDbConfig();
  const client = new Client({
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
  });

  try {
    await client.connect();
    console.log('Connected to test database for schema setup');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'test-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSQL);
    console.log('Database schema created successfully');

  } catch (err) {
    console.error('Error setting up database schema:', err);
    throw err;
  } finally {
    await client.end();
  }
};


const main = async () => {
  try {
    console.log('🚀 Starting test database setup...\n');

    // Step 1: Create database if it doesn't exist
    await createTestDatabase();
    
    // Step 2: Set up database schema
    await runSchemaSetup();
    
    // Step 3: Process knowledge base vectors
    console.log('\n📚 Processing knowledge base vectors...');
    const faqProcessor = new FAQDataSeeder();
    await faqProcessor.seedFAQData();
    
    console.log('\n✅ Test database setup completed successfully!');
    console.log('\n📊 Database Schema and KB Vectors Ready.');
    console.log('   - Test data will be seeded by individual test suites.');
    
  } catch (error) {
    console.error('\n❌ Test database setup failed:', error);
    throw error; // Re-throw the error to signal failure
  }
};

main();
