import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';

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
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/claims/:id (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/claims/test-claim-AAA')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-claim-AAA');
      });
  });

  it('/claims/:id (GET) - not found', () => {
    return request(app.getHttpServer())
      .get('/claims/non-existent-claim')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('/claims (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        policyId: 'policy-789',
        description: 'New claim for testing',
        vehicle: { make: 'Ford', model: 'Mustang', year: 2021 },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('policyId', 'policy-789');
      });
  });

  it('/claims (POST) - missing fields', () => {
    return request(app.getHttpServer())
      .post('/claims')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ policyId: 'policy-789' })
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
      .get('/claims?policyId=policy-123')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((claim) => {
          expect(claim).toHaveProperty('policyId', 'policy-123');
        });
      });
  });

  it('/claims/:id/status (PATCH) - success', () => {
    return request(app.getHttpServer())
      .patch('/claims/test-claim-AAA/status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'APPROVED' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'APPROVED');
      });
  });

  it('/claims/:id/status (PATCH) - not found', () => {
    return request(app.getHttpServer())
      .patch('/claims/non-existent-claim/status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'APPROVED' })
      .expect(404);
  });

  it('/claims/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/claims/test-claim-BBB')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/claims/:id (DELETE) - not found', () => {
    return request(app.getHttpServer())
      .delete('/claims/non-existent-claim')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
