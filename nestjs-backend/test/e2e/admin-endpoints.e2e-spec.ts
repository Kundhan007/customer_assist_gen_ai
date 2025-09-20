import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Policy } from '@/entities/policy.entity';
import { Claim } from '@/entities/claim.entity';
import { Premium } from '@/entities/premium.entity';
import { AuthModule } from '@/auth/auth.module';
import { AdminModule } from '@/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from '@/config/config.module';
import { TEST_USERS } from '@test/test-data';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
    process.env.NODE_ENV = 'test';
    
    console.log('🔧 Admin test using DB:', process.env.DB_URL);
    
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: path.resolve(__dirname, '..', '.env.test'),
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DB_URL!,
          entities: [User, Policy, Claim, Premium],
          synchronize: false,
          logging: false,
        }),
        AppConfigModule,
        AuthModule,
        AdminModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get tokens for testing
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password });

    userToken = userLogin.body.access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.ADMIN.email, password: TEST_USERS.ADMIN.password });

    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('Admin User Management', () => {
    it('GET /admin/users - should return all users with admin token', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('role');
        });
    });

    it('GET /admin/users - should return 403 with user token', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('GET /admin/users - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .expect(401);
    });

    it('GET /admin/users/:id - should return specific user with admin token', () => {
      return request(app.getHttpServer())
        .get('/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('GET /admin/users/:id - should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('POST /admin/users - should create new user with admin token', () => {
      const newUser = {
        email: 'newuser@test.com',
        password: 'password123',
        role: 'user'
      };

      return request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
          expect(res.body.email).toBe(newUser.email);
          expect(res.body.role).toBe(newUser.role);
        });
    });

    it('POST /admin/users - should return 400 with invalid data', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123'
      };

      return request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);
    });

    it('POST /admin/users - should return 403 with user token', () => {
      const newUser = {
        email: 'test@test.com',
        password: 'password123',
        role: 'user'
      };

      return request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUser)
        .expect(403);
    });
  });

  describe('Admin Policy Management', () => {
    it('GET /admin/policies - should return all policies with admin token', () => {
      return request(app.getHttpServer())
        .get('/admin/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('policy_id');
          expect(res.body[0]).toHaveProperty('user_id');
        });
    });

    it('GET /admin/policies - should return 403 with user token', () => {
      return request(app.getHttpServer())
        .get('/admin/policies')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('POST /admin/policies - should create new policy with admin token', () => {
      const newPolicy = {
        user_id: '1',
        policy_type: 'SILVER',
        coverage_amount: 50000,
        start_date: '2023-01-01',
        end_date: '2024-01-01',
        premium_amount: 1000
      };

      return request(app.getHttpServer())
        .post('/admin/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPolicy)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('policy_id');
          expect(res.body).toHaveProperty('policy_type');
          expect(res.body.policy_type).toBe(newPolicy.policy_type);
        });
    });

    it('POST /admin/policies - should return 400 with invalid data', () => {
      const invalidPolicy = {
        user_id: 'invalid',
        policy_type: 'INVALID_TYPE'
      };

      return request(app.getHttpServer())
        .post('/admin/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPolicy)
        .expect(400);
    });

    it('POST /admin/policies - should return 403 with user token', () => {
      const newPolicy = {
        user_id: '1',
        policy_type: 'SILVER',
        coverage_amount: 50000,
        start_date: '2023-01-01',
        end_date: '2024-01-01',
        premium_amount: 1000
      };

      return request(app.getHttpServer())
        .post('/admin/policies')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newPolicy)
        .expect(403);
    });
  });

  describe('Admin Knowledge Base Management', () => {
    it('POST /admin/kb - should upload knowledge base with admin token', () => {
      // Note: This is a mock test since we can't actually upload files in e2e tests
      // In a real scenario, you would use multer middleware or mock the file upload
      const kbData = {
        title: 'Test Knowledge Base Entry',
        content: 'This is test content for the knowledge base',
        category: 'general'
      };

      return request(app.getHttpServer())
        .post('/admin/kb')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(kbData)
        .expect(200); // May return 201 depending on implementation
    });

    it('POST /admin/kb - should return 403 with user token', () => {
      const kbData = {
        title: 'Test Knowledge Base Entry',
        content: 'This is test content for the knowledge base'
      };

      return request(app.getHttpServer())
        .post('/admin/kb')
        .set('Authorization', `Bearer ${userToken}`)
        .send(kbData)
        .expect(403);
    });

    it('DELETE /admin/kb/:id - should delete knowledge base entry with admin token', () => {
      return request(app.getHttpServer())
        .delete('/admin/kb/test-kb-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('DELETE /admin/kb/:id - should return 404 for non-existent entry', () => {
      return request(app.getHttpServer())
        .delete('/admin/kb/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('DELETE /admin/kb/:id - should return 403 with user token', () => {
      return request(app.getHttpServer())
        .delete('/admin/kb/test-kb-001')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Admin Access Control', () => {
    it('should prevent user access to all admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'get', path: '/admin/users' },
        { method: 'post', path: '/admin/users' },
        { method: 'get', path: '/admin/users/1' },
        { method: 'get', path: '/admin/policies' },
        { method: 'post', path: '/admin/policies' },
        { method: 'post', path: '/admin/kb' },
        { method: 'delete', path: '/admin/kb/test-id' }
      ];

      for (const endpoint of adminEndpoints) {
        const req = request(app.getHttpServer());
        if (endpoint.method === 'get') {
          await req.get(endpoint.path)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        } else if (endpoint.method === 'post') {
          await req.post(endpoint.path)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        } else if (endpoint.method === 'delete') {
          await req.delete(endpoint.path)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        }
      }
    });

    it('should prevent unauthenticated access to all admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'get', path: '/admin/users' },
        { method: 'post', path: '/admin/users' },
        { method: 'get', path: '/admin/users/1' },
        { method: 'get', path: '/admin/policies' },
        { method: 'post', path: '/admin/policies' },
        { method: 'post', path: '/admin/kb' },
        { method: 'delete', path: '/admin/kb/test-id' }
      ];

      for (const endpoint of adminEndpoints) {
        const req = request(app.getHttpServer());
        if (endpoint.method === 'get') {
          await req.get(endpoint.path)
            .expect(401);
        } else if (endpoint.method === 'post') {
          await req.post(endpoint.path)
            .expect(401);
        } else if (endpoint.method === 'delete') {
          await req.delete(endpoint.path)
            .expect(401);
        }
      }
    });
  });
});
