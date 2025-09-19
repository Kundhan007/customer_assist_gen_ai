import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const setupTestDatabase = async () => {
  // Drop all tables
  await pool.query(`
    DROP TABLE IF EXISTS claims, premium_history, knowledge_base, users;
  `);

  // Create tables
  await pool.query(`
    CREATE TABLE users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      roles VARCHAR(255)[]
    );
  `);

  await pool.query(`
    CREATE TABLE claims (
      id VARCHAR(255) PRIMARY KEY,
      policy_id VARCHAR(255) NOT NULL,
      description TEXT,
      vehicle JSONB,
      photos TEXT[],
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE premium_history (
      id SERIAL PRIMARY KEY,
      policy_id VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date TIMESTAMP NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE knowledge_base (
      id VARCHAR(255) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      content TEXT NOT NULL
    );
  `);

  // Seed data
  await seedTestData();
};

const seedTestData = async () => {
  // Seed users
  await pool.query(`
    INSERT INTO users (id, email, password, roles) VALUES
    ('test-user-001', 'test@example.com', '$2b$10$examplehash', ['user']),
    ('test-user-002', 'admin@example.com', '$2b$10$examplehash', ['admin']);
  `);

  // Seed claims
  await pool.query(`
    INSERT INTO claims (id, policy_id, description, vehicle, status) VALUES
    ('test-claim-AAA', 'policy-123', 'Minor accident on the front bumper.', '{"make": "Toyota", "model": "Camry", "year": 2020}', 'PENDING'),
    ('test-claim-BBB', 'policy-456', 'Broken windshield.', '{"make": "Honda", "model": "Civic", "year": 2019}', 'APPROVED');
  `);

  // Seed premium history
  await pool.query(`
    INSERT INTO premium_history (policy_id, amount, date) VALUES
    ('policy-123', 500.00, NOW()),
    ('policy-456', 750.00, NOW());
  `);

  // Seed knowledge base
  await pool.query(`
    INSERT INTO knowledge_base (id, filename, content) VALUES
    ('test-kb-001', 'faq.md', 'FAQ content for testing');
  `);
};

export const teardownTestDatabase = async () => {
  await pool.end();
};
