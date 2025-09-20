import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import { TEST_USERS, TEST_POLICIES, TEST_CLAIMS, NON_EXISTENT_CLAIM_ID } from '@test/test-data';

describe('ClaimsController (e2e)', () => {
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

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/claims/:id (GET) - success', () => {
    return request(app.getHttpServer())
      .get(`/claims/${TEST_CLAIMS.CLM_001}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('claim_id', TEST_CLAIMS.CLM_001);
      });
  });

  it('/claims/:id (GET) - not found', () => {
    return request(app.getHttpServer())
      .get(`/claims/${NON_EXISTENT_CLAIM_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('/claims (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        policyId: TEST_POLICIES.GOLD_001,
        description: 'New claim for testing',
        vehicle: '2021 Ford Mustang',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('claim_id');
        expect(res.body).toHaveProperty('policy_id', TEST_POLICIES.GOLD_001);
      });
  });

  it('/claims (POST) - missing fields', () => {
    return request(app.getHttpServer())
      .post('/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ policyId: TEST_POLICIES.GOLD_001 })
      .expect(400);
  });

  it('/claims (GET) - get all', () => {
    return request(app.getHttpServer())
      .get('/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/claims (GET) - by policyId', () => {
    return request(app.getHttpServer())
      .get(`/claims?policyId=${TEST_POLICIES.GOLD_001}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((claim: any) => {
          expect(claim).toHaveProperty('policy_id', TEST_POLICIES.GOLD_001);
        });
      });
  });

  it('/claims/:id/status (PATCH) - success', () => {
    return request(app.getHttpServer())
      .patch(`/claims/${TEST_CLAIMS.CLM_001}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newStatus: 'APPROVED' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'APPROVED');
      });
  });

  it('/claims/:id/status (PATCH) - not found', () => {
    return request(app.getHttpServer())
      .patch(`/claims/${NON_EXISTENT_CLAIM_ID}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newStatus: 'APPROVED' })
      .expect(404);
  });

  it('/claims/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete(`/claims/${TEST_CLAIMS.CLM_015}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/claims/:id (DELETE) - not found', () => {
    return request(app.getHttpServer())
      .delete(`/claims/${NON_EXISTENT_CLAIM_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
