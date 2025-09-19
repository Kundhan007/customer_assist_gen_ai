import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';

describe('PremiumController (e2e)', () => {
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
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/premium/calc (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/premium/calc')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ policyId: 'policy-123', newCoverage: 100000 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('policyId', 'policy-123');
        expect(res.body).toHaveProperty('calculatedPremium');
      });
  });

  it('/premium/calc (POST) - missing fields', () => {
    return request(app.getHttpServer())
      .post('/premium/calc')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ policyId: 'policy-123' })
      .expect(400);
  });

  it('/premium/:policyId (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/premium/policy-123')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach((record) => {
          expect(record).toHaveProperty('policyId', 'policy-123');
        });
      });
  });

  it('/premium/:policyId (GET) - no history', () => {
    return request(app.getHttpServer())
      .get('/premium/non-existent-policy')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
      });
  });
});
