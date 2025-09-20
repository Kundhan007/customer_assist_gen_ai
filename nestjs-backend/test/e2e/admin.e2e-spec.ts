import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import * as fs from 'fs';
import * as path from 'path';
import { TEST_USERS, TEST_KB_ENTRY_ID } from '@test/test-data';

describe('AdminController (e2e)', () => {
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
      .send({ email: TEST_USERS.ADMIN.email, password: TEST_USERS.ADMIN.password });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/admin/kb (POST) - no file', () => {
    return request(app.getHttpServer())
      .post('/admin/kb')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'No file provided');
      });
  });

  it('/admin/kb/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete(`/admin/kb/${TEST_KB_ENTRY_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Entry deleted successfully');
      });
  });

  it('/admin/kb/:id (DELETE) - not found', () => {
    return request(app.getHttpServer())
      .delete('/admin/kb/non-existent-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
