import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '..', '.env.test')
});

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

console.log('🔧 Test environment setup complete');
console.log(`📊 Using database: ${process.env.DB_URL}`);
console.log(`🔑 JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0} characters`);
