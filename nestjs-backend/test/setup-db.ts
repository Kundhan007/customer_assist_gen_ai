import { Client } from 'pg';
import { setupTestDatabase } from './database.setup';

const createTestDatabase = async () => {
  const client = new Client({
    user: 'user',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to the default 'postgres' database to create a new one
  });

  try {
    await client.connect();
    const dbName = 'customer_assist_test_db';
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating test database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const main = async () => {
  await createTestDatabase();
  // Set the environment variable for the setupTestDatabase function
  process.env.DB_URL = 'postgresql://user:password@localhost:5432/customer_assist_test_db';
  await setupTestDatabase();
  console.log('Test database setup and seeding complete.');
  process.exit(0);
};

main();
