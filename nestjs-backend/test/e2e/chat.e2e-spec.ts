import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import { TEST_USERS, TEST_SESSION_ID } from '@test/test-data';

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
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/user/chat (POST) - new session', () => {
    return request(app.getHttpServer())
      .post('/user/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Hello', sessionId: TEST_SESSION_ID })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('response');
      });
  });

  it('/user/chat (POST) - existing session', () => {
    return request(app.getHttpServer())
      .post('/user/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Follow up', sessionId: TEST_SESSION_ID })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('response');
      });
  });

  it('/user/chat (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/user/chat')
      .send({ message: 'Hello', sessionId: 'new-session-123' })
      .expect(401);
  });
});
