import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';

describe('ChatController (e2e)', () => {
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

  it('/chat (POST) - new session', () => {
    return request(app.getHttpServer())
      .post('/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Hello', sessionId: 'new-session-123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('response');
      });
  });

  it('/chat (POST) - existing session', () => {
    return request(app.getHttpServer())
      .post('/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Follow up', sessionId: 'new-session-123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('response');
      });
  });

  it('/chat (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/chat')
      .send({ message: 'Hello', sessionId: 'new-session-123' })
      .expect(401);
  });
});
