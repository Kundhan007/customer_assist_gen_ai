import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/auth/login (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/login (POST) - wrong password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('/auth/login (POST) - user not found', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: 'password' })
      .expect(401);
  });
});
