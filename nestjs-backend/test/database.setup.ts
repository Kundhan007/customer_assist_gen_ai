import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
  TEST_USERS,
  TEST_POLICIES,
  TEST_CLAIMS,
  PASSWORD_HASH_SECRET,
} from './test-data';

let pool: Pool | null = null;

const getTestDbUrl = () => {
  const envTestPath = path.join(__dirname, '..', '.env.test');
  if (!fs.existsSync(envTestPath)) {
    throw new Error(`.env.test file not found at ${envTestPath}`);
  }
  const envContent = fs.readFileSync(envTestPath, 'utf8');
  const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DB_URL='));
  if (!dbUrlLine) {
    throw new Error('DB_URL not found in .env.test file');
  }
  const dbUrl = dbUrlLine.split('=')[1];
  console.log('Parsed DB URL from .env.test:', dbUrl);
  return dbUrl;
};

const getPool = () => {
  if (!pool) {
    const dbUrl = getTestDbUrl();
    console.log('Creating new DB pool, connecting to:', dbUrl);
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
};

// Helper function to execute SQL file with retry logic for deadlocks
const executeSqlFile = async (filePath: string): Promise<void> => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      await getPool().query(sql);
      console.log(`✅ Executed SQL file: ${path.basename(filePath)} (attempt ${attempt})`);
      return;
    } catch (error: any) {
      if (error.code === '40P01' && attempt < maxRetries) {
        // Deadlock detected, retry after delay
        console.warn(`⚠️ Deadlock detected executing ${path.basename(filePath)}, retrying in ${retryDelay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error(`❌ Error executing SQL file ${filePath}:`, error);
        throw error;
      }
    }
  }
};

const seedTestData = async () => {
  const currentPool = getPool();
  const client = await currentPool.connect();
  try {
    console.log('🌱 Seeding test data...');
    
    await client.query('BEGIN');

    // Insert sample users
    await client.query(`
      INSERT INTO users (email, password_hash, role) VALUES
        ('${TEST_USERS.ADMIN.email}', '${PASSWORD_HASH_SECRET}', 'admin'),
        ('${TEST_USERS.SUPERADMIN.email}', '${PASSWORD_HASH_SECRET}', 'admin'),
        ('${TEST_USERS.SUPPORT.email}', '${PASSWORD_HASH_SECRET}', 'admin'),
        ('${TEST_USERS.JOHN_DOE.email}', '${PASSWORD_HASH_SECRET}', 'user'),
        ('${TEST_USERS.JANE_SMITH.email}', '${PASSWORD_HASH_SECRET}', 'user'),
        ('${TEST_USERS.BOB_WILSON.email}', '${PASSWORD_HASH_SECRET}', 'user'),
        ('${TEST_USERS.ALICE_BROWN.email}', '${PASSWORD_HASH_SECRET}', 'user'),
        ('${TEST_USERS.CHARLIE_DAVIS.email}', '${PASSWORD_HASH_SECRET}', 'user')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insert sample policies with a different approach to avoid null user_id
    const policyData = [
      { email: TEST_USERS.JOHN_DOE.email, policyId: TEST_POLICIES.GOLD_001, planName: 'Gold', collisionCoverage: 200000, roadsideAssistance: true, deductible: 5000, premium: 20000.00, startDate: '2024-01-01', endDate: '2024-12-31' },
      { email: TEST_USERS.JANE_SMITH.email, policyId: TEST_POLICIES.GOLD_002, planName: 'Gold', collisionCoverage: 150000, roadsideAssistance: true, deductible: 3000, premium: 17500.00, startDate: '2024-02-01', endDate: '2025-01-31' },
      { email: TEST_USERS.BOB_WILSON.email, policyId: TEST_POLICIES.GOLD_003, planName: 'Gold', collisionCoverage: 100000, roadsideAssistance: false, deductible: 5000, premium: 15000.00, startDate: '2024-03-01', endDate: '2025-02-28' },
      { email: TEST_USERS.ALICE_BROWN.email, policyId: TEST_POLICIES.GOLD_004, planName: 'Gold', collisionCoverage: 250000, roadsideAssistance: true, deductible: 2000, premium: 22500.00, startDate: '2024-04-01', endDate: '2025-03-31' },
      { email: TEST_USERS.JOHN_DOE.email, policyId: TEST_POLICIES.GOLD_005, planName: 'Gold', collisionCoverage: 180000, roadsideAssistance: true, deductible: 4000, premium: 18500.00, startDate: '2024-05-01', endDate: '2025-04-30' },
      { email: TEST_USERS.CHARLIE_DAVIS.email, policyId: TEST_POLICIES.GOLD_006, planName: 'Gold', collisionCoverage: 120000, roadsideAssistance: false, deductible: 6000, premium: 16000.00, startDate: '2024-06-01', endDate: '2025-05-31' },
      { email: TEST_USERS.JOHN_DOE.email, policyId: TEST_POLICIES.SILVER_001, planName: 'Silver', collisionCoverage: 100000, roadsideAssistance: false, deductible: 10000, premium: 12000.00, startDate: '2024-01-15', endDate: '2024-12-14' },
      { email: TEST_USERS.ALICE_BROWN.email, policyId: TEST_POLICIES.SILVER_002, planName: 'Silver', collisionCoverage: 75000, roadsideAssistance: true, deductible: 7500, premium: 9500.00, startDate: '2024-02-15', endDate: '2025-02-14' },
      { email: TEST_USERS.JANE_SMITH.email, policyId: TEST_POLICIES.SILVER_003, planName: 'Silver', collisionCoverage: 50000, roadsideAssistance: false, deductible: 10000, premium: 8000.00, startDate: '2024-03-15', endDate: '2025-03-14' },
      { email: TEST_USERS.CHARLIE_DAVIS.email, policyId: TEST_POLICIES.SILVER_004, planName: 'Silver', collisionCoverage: 90000, roadsideAssistance: true, deductible: 8000, premium: 10500.00, startDate: '2024-04-15', endDate: '2025-04-14' },
      { email: TEST_USERS.BOB_WILSON.email, policyId: TEST_POLICIES.SILVER_005, planName: 'Silver', collisionCoverage: 60000, roadsideAssistance: false, deductible: 9000, premium: 8800.00, startDate: '2024-05-15', endDate: '2025-05-14' },
      { email: TEST_USERS.ALICE_BROWN.email, policyId: TEST_POLICIES.SILVER_006, planName: 'Silver', collisionCoverage: 80000, roadsideAssistance: true, deductible: 7000, premium: 9800.00, startDate: '2024-06-15', endDate: '2025-06-14' }
    ];

    for (const data of policyData) {
      await client.query(`
        INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, roadside_assistance, deductible, premium, start_date, end_date)
        SELECT $1, user_id, $2, $3, $4, $5, $6, $7, $8
        FROM users WHERE email = $9
        ON CONFLICT (policy_id) DO NOTHING
      `, [data.policyId, data.planName, data.collisionCoverage, data.roadsideAssistance, data.deductible, data.premium, data.startDate, data.endDate, data.email]);
    }

    // Insert sample claims
    await client.query(`
      INSERT INTO claims (claim_id, policy_id, status, damage_description, vehicle, photos, last_updated) VALUES
        ('${TEST_CLAIMS.CLM_001}', '${TEST_POLICIES.GOLD_001}', 'Approved', 'Rear-end collision at traffic light. Moderate damage to bumper and trunk.', '2022 Toyota Camry', ARRAY['rear_damage.jpg', 'bumper_closeup.jpg'], '2024-01-15'),
        ('${TEST_CLAIMS.CLM_006}', '${TEST_POLICIES.GOLD_003}', 'Approved', 'Hail damage to roof and hood', '2020 Ford Mustang', ARRAY['hail_damage_roof.jpg', 'hail_damage_hood.jpg'], '2024-03-15'),
        ('${TEST_CLAIMS.CLM_011}', '${TEST_POLICIES.SILVER_002}', 'Approved', 'Minor door dent from shopping cart', '2021 Honda Civic', ARRAY['door_dent.jpg'], '2024-04-20'),
        ('${TEST_CLAIMS.CLM_014}', '${TEST_POLICIES.GOLD_005}', 'Approved', 'Front bumper damage from low-speed collision', '2023 Tesla Model 3', ARRAY['bumper_damage.jpg', 'repair_estimate.pdf'], '2024-06-10'),
        ('${TEST_CLAIMS.CLM_002}', '${TEST_POLICIES.GOLD_001}', 'In Review', 'Broken windshield from highway debris', '2022 Toyota Camry', ARRAY['windshield_crack.jpg'], '2024-02-20'),
        ('${TEST_CLAIMS.CLM_007}', '${TEST_POLICIES.SILVER_003}', 'In Review', 'Vandalism - keyed door and scratched paint', '2019 Hyundai Elantra', ARRAY['vandalism_door.jpg'], '2024-04-05'),
        ('${TEST_CLAIMS.CLM_012}', '${TEST_POLICIES.GOLD_004}', 'In Review', 'Water damage from flooding', '2022 BMW X5', ARRAY['flood_damage.jpg', 'interior_damage.jpg'], '2024-05-15'),
        ('${TEST_CLAIMS.CLM_003}', '${TEST_POLICIES.SILVER_001}', 'Submitted', 'Side mirror damage in parking lot incident', '2022 Toyota Camry', ARRAY['mirror_damage.jpg'], '2024-03-10'),
        ('${TEST_CLAIMS.CLM_008}', '${TEST_POLICIES.GOLD_002}', 'Submitted', 'Theft of catalytic converter', '2023 Honda CR-V', ARRAY['undercarriage.jpg', 'police_report.jpg'], '2024-04-10'),
        ('${TEST_CLAIMS.CLM_015}', '${TEST_POLICIES.SILVER_005}', 'Submitted', 'Tree branch fell on roof during storm', '2020 Toyota RAV4', ARRAY['roof_damage.jpg', 'storm_photo.jpg'], '2024-06-12'),
        ('${TEST_CLAIMS.CLM_004}', '${TEST_POLICIES.GOLD_002}', 'Rejected', 'Claim for pre-existing engine damage not covered under policy', '2023 Honda CR-V', ARRAY['engine_damage.jpg'], '2024-02-05'),
        ('${TEST_CLAIMS.CLM_009}', '${TEST_POLICIES.SILVER_004}', 'Rejected', 'Intentional damage not covered by policy', '2021 Nissan Altima', ARRAY['intentional_damage.jpg'], '2024-04-25'),
        ('${TEST_CLAIMS.CLM_013}', '${TEST_POLICIES.GOLD_006}', 'Rejected', 'Damage occurred before policy start date', '2018 Ford Fiesta', ARRAY['old_damage.jpg'], '2024-05-20'),
        ('${TEST_CLAIMS.CLM_005}', '${TEST_POLICIES.SILVER_002}', 'Closed', 'Minor fender bender, repairs completed and paid', '2021 Nissan Altima', ARRAY['fender_before.jpg', 'fender_after.jpg'], '2024-01-30'),
        ('${TEST_CLAIMS.CLM_010}', '${TEST_POLICIES.SILVER_006}', 'Closed', 'Stolen vehicle recovered with minimal damage', '2022 Mazda CX-5', ARRAY['recovered_vehicle.jpg'], '2024-05-01'),
        ('${TEST_CLAIMS.CLM_016}', '${TEST_POLICIES.GOLD_004}', 'Closed', 'Hit and run - repairs completed through uninsured motorist coverage', '2023 Audi A4', ARRAY['hit_and_run.jpg', 'repair_invoice.pdf'], '2024-06-05')
      ON CONFLICT (claim_id) DO NOTHING;
    `);

    // Insert sample premium history
    await client.query(`
      INSERT INTO premium_history (policy_id, current_coverage, new_coverage, current_premium, new_premium, calculation_date) VALUES
        ('${TEST_POLICIES.GOLD_001}', 150000, 200000, 17500.00, 20000.00, '2024-01-01'),
        ('${TEST_POLICIES.GOLD_001}', 200000, 220000, 20000.00, 21500.00, '2024-06-01'),
        ('${TEST_POLICIES.GOLD_002}', 120000, 150000, 16000.00, 17500.00, '2024-01-01'),
        ('${TEST_POLICIES.GOLD_002}', 150000, 180000, 17500.00, 19000.00, '2024-07-01'),
        ('${TEST_POLICIES.GOLD_003}', 0, 100000, 0.00, 15000.00, '2024-03-01'),
        ('${TEST_POLICIES.GOLD_004}', 200000, 250000, 21000.00, 22500.00, '2024-04-01'),
        ('${TEST_POLICIES.GOLD_005}', 150000, 180000, 16500.00, 18500.00, '2024-05-01'),
        ('${TEST_POLICIES.GOLD_006}', 100000, 120000, 14500.00, 16000.00, '2024-06-01'),
        ('${TEST_POLICIES.SILVER_001}', 75000, 100000, 9500.00, 12000.00, '2024-02-15'),
        ('${TEST_POLICIES.SILVER_002}', 50000, 75000, 8000.00, 9500.00, '2024-03-01'),
        ('${TEST_POLICIES.SILVER_003}', 0, 50000, 0.00, 8000.00, '2024-05-01'),
        ('${TEST_POLICIES.SILVER_004}', 60000, 90000, 8200.00, 10500.00, '2024-04-15'),
        ('${TEST_POLICIES.SILVER_005}', 45000, 60000, 7500.00, 8800.00, '2024-05-15'),
        ('${TEST_POLICIES.SILVER_006}', 70000, 80000, 9100.00, 9800.00, '2024-06-15'),
        ('${TEST_POLICIES.SILVER_001}', 100000, 110000, 12000.00, 12800.00, '2024-08-01')
      ON CONFLICT DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding test data failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const setupTestDatabase = async () => {
  const currentPool = getPool();
  const client = await currentPool.connect();
  
  try {
    console.log('🔍 Seeding test data...');
    
    await client.query('BEGIN');
    
    // Check if tables already exist to avoid unnecessary recreation
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as users_exist
    `);
    
    const policiesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'policies'
      ) as policies_exist
    `);
    
    const users_exist = usersCheck.rows[0].users_exist;
    const policies_exist = policiesCheck.rows[0].policies_exist;
    
    // Only execute schema if tables don't exist
    if (!users_exist || !policies_exist) {
      console.log('📝 Tables missing, executing schema...');
      await client.query('COMMIT'); // Commit transaction before schema execution
      
      const schemaPath = path.join(__dirname, 'test-schema.sql');
      await executeSqlFile(schemaPath);
      
      // Start new transaction for data seeding
      await client.query('BEGIN');
    } else {
      console.log('📝 Tables already exist, skipping schema creation');
    }
    
    // Seed test data
    await seedTestData();
    
    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test data seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

const verifyDatabaseSetup = async () => {
  try {
    const currentPool = getPool();
    // Check if users table exists and has data
    const userResult = await currentPool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Found ${userResult.rows[0].count} users in database`);
    
    // Check if policies table exists and has data
    const policyResult = await currentPool.query('SELECT COUNT(*) FROM policies');
    console.log(`📊 Found ${policyResult.rows[0].count} policies in database`);
    
    // Check if claims table exists and has data
    const claimResult = await currentPool.query('SELECT COUNT(*) FROM claims');
    console.log(`📊 Found ${claimResult.rows[0].count} claims in database`);
    
    // Check if knowledge base table exists and has data
    const kbResult = await currentPool.query('SELECT COUNT(*) FROM knowledge_base');
    console.log(`📊 Found ${kbResult.rows[0].count} knowledge base entries in database`);
    
    if (userResult.rows[0].count === 0) {
      throw new Error('No users found in database - setup may have failed');
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw new Error('Database is not properly set up. Please run the pretest setup first.');
  }
};

export const teardownTestDatabase = async () => {
  const currentPool = getPool();
  const client = await currentPool.connect();
  
  try {
    console.log('🧹 Cleaning up test database...');
    console.log('Teardown connecting to:', getTestDbUrl());
    
    await client.query('BEGIN');
    
    // Drop all tables in reverse order of dependencies
    await client.query(`
      DROP TABLE IF EXISTS premium_history CASCADE;
      DROP TABLE IF EXISTS claims CASCADE;
      DROP TABLE IF EXISTS policies CASCADE;
      DROP TABLE IF EXISTS knowledge_base CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    
    await client.query('COMMIT');
    console.log('✅ Test database cleanup completed!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test database cleanup failed:', error);
    // Don't throw error for cleanup failures to allow other tests to continue
  } finally {
    client.release();
    await currentPool.end();
    console.log('🔌 Database connection closed');
  }
};
