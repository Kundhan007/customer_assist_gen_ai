import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TEST_USERS, TEST_POLICIES, NON_EXISTENT_USER_ID, NON_EXISTENT_POLICY_ID } from '@test/test-data';

describe('PoliciesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Load test environment variables explicitly
    dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
    process.env.NODE_ENV = 'test';
    
    console.log('🔧 Policies test using DB:', process.env.DB_URL);
    console.log('🔑 Policies test JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token for protected routes
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('GET /policies', () => {
    it('should return all policies', () => {
      return request(app.getHttpServer())
        .get('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('policy_id');
          expect(res.body[0]).toHaveProperty('plan_name');
          expect(res.body[0]).toHaveProperty('user');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/policies')
        .expect(401);
    });
  });

  describe('GET /policies/user/:userId', () => {
    it('should return policies for a specific user', async () => {
      // First get the user ID from the auth token or database
      const userResponse = await request(app.getHttpServer())
        .get(`/users/email/${TEST_USERS.JOHN_DOE.email}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const userId = userResponse.body.user_id;
      
      return request(app.getHttpServer())
        .get(`/policies/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          res.body.forEach((policy: any) => {
            expect(policy.user.email).toBe(TEST_USERS.JOHN_DOE.email);
          });
        });
    });

    it('should return empty array for user with no policies', async () => {
      return request(app.getHttpServer())
        .get(`/policies/user/${NON_EXISTENT_USER_ID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /policies/:id', () => {
  it('should return a specific policy by ID', () => {
    return request(app.getHttpServer())
      .get(`/policies/${TEST_POLICIES.GOLD_001}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('policy_id');
        expect(res.body).toHaveProperty('plan_name');
        expect(res.body).toHaveProperty('user');
        expect(res.body.policy_id).toBe(TEST_POLICIES.GOLD_001);
      });
  });

  it('should return 404 for non-existent policy', () => {
    return request(app.getHttpServer())
      .get(`/policies/${NON_EXISTENT_POLICY_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
  });

  describe('POST /policies', () => {
    it('should create a new policy with valid data', async () => {
      // First get the user ID
      const userResponse = await request(app.getHttpServer())
        .get(`/users/email/${TEST_USERS.JOHN_DOE.email}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const userId = userResponse.body.user_id;
      
      const newPolicy = {
        user_id: userId,
        plan_name: 'Silver',
        collision_coverage: 100000,
        roadside_assistance: false,
        deductible: 10000,
        premium: 4000.5
      };

      return request(app.getHttpServer())
        .post('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPolicy)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('policy_id');
          expect(res.body.plan_name).toBe('Silver');
          expect(res.body.collision_coverage).toBe(100000);
        });
    });

    it('should reject policy with invalid premium calculation', async () => {
      // First get the user ID
      const userResponse = await request(app.getHttpServer())
        .get(`/users/email/${TEST_USERS.JOHN_DOE.email}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const userId = userResponse.body.user_id;
      
      const invalidPolicy = {
        user_id: userId,
        plan_name: 'Silver',
        collision_coverage: 100000,
        roadside_assistance: false,
        deductible: 10000,
        premium: 5000 // Wrong premium amount
      };

      return request(app.getHttpServer())
        .post('/policies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPolicy)
        .expect(400);
    });

  it('should reject policy for non-existent user', () => {
    const invalidPolicy = {
      user_id: NON_EXISTENT_USER_ID,
      plan_name: 'Silver',
      collision_coverage: 100000,
      roadside_assistance: false,
      deductible: 10000,
      premium: 8000
    };

    return request(app.getHttpServer())
      .post('/policies')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidPolicy)
      .expect(404);
  });
  });

  describe('DELETE /policies/:id', () => {
  it('should delete an existing policy', () => {
    return request(app.getHttpServer())
      .delete(`/policies/${TEST_POLICIES.GOLD_001}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('policyId', TEST_POLICIES.GOLD_001);
        expect(res.body).toHaveProperty('status', 'deleted');
      });
  });

  it('should return 404 for deleting non-existent policy', () => {
    return request(app.getHttpServer())
      .delete(`/policies/${NON_EXISTENT_POLICY_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
  });
});
