import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import * as fs from 'fs';
import * as path from 'path';

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
      .send({ email: 'admin@example.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/admin/kb (POST) - success', async () => {
    const filePath = path.join(__dirname, '../fixtures/test-file.md');
    fs.writeFileSync(filePath, 'Test file content');

    await request(app.getHttpServer())
      .post('/admin/kb')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', filePath)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'File uploaded successfully');
        expect(res.body).toHaveProperty('entry');
        expect(res.body.entry).toHaveProperty('filename', 'test-file.md');
      });

    fs.unlinkSync(filePath);
  });

  it('/admin/kb (POST) - no file', () => {
    return request(app.getHttpServer())
      .post('/admin/kb')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });

  it('/admin/kb/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/admin/kb/test-kb-001')
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
