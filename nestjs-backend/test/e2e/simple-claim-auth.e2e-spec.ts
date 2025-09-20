import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import { TEST_USERS, TEST_POLICIES, TEST_CLAIMS, TEST_SESSION_ID } from '@test/test-data';

describe('SimpleClaimAuthE2E', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as user john.doe@test.com to get JWT token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('should create a new claim with JWT authentication', async () => {
    const claimData = {
      policyId: TEST_POLICIES.GOLD_001,
      description: 'Test claim for e2e testing',
      vehicle: { make: 'Toyota', model: 'Camry', year: 2022 },
      photos: ['test_photo.jpg']
    };

    const response = await request(app.getHttpServer())
      .post('/user/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .send(claimData)
      .expect(201);

    expect(response.body).toHaveProperty('claim_id');
    expect(response.body).toHaveProperty('policy_id', TEST_POLICIES.GOLD_001);
    expect(response.body).toHaveProperty('status', 'Submitted');
    expect(response.body).toHaveProperty('damage_description', 'Test claim for e2e testing');
  });

  it('should fail to create claim without JWT token', async () => {
    const claimData = {
      policyId: TEST_POLICIES.GOLD_001,
      description: 'Test claim without auth',
      vehicle: { make: 'Toyota', model: 'Camry', year: 2022 }
    };

    await request(app.getHttpServer())
      .post('/user/claims')
      .send(claimData)
      .expect(401);
  });

  it('should get user claims with JWT authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verify claims have the expected properties
    response.body.forEach((claim: any) => {
      expect(claim).toHaveProperty('claim_id');
      expect(claim).toHaveProperty('policy_id');
      expect(claim).toHaveProperty('status');
      expect(claim).toHaveProperty('damage_description');
      expect(claim).toHaveProperty('vehicle');
    });
  });

  it('should fail to get claims without JWT token', async () => {
    await request(app.getHttpServer())
      .get('/user/claims')
      .expect(401);
  });

  it('should get specific claim by ID with JWT authentication', async () => {
    const response = await request(app.getHttpServer())
      .get(`/user/claims/${TEST_CLAIMS.CLM_001}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('claim_id', TEST_CLAIMS.CLM_001);
    expect(response.body).toHaveProperty('policy_id', TEST_POLICIES.GOLD_001);
  });

  it('should fail to get specific claim without JWT token', async () => {
    await request(app.getHttpServer())
      .get(`/user/claims/${TEST_CLAIMS.CLM_001}`)
      .expect(401);
  });
});
