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
import { ChatModule } from '@/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from '@/config/config.module';
import { TEST_USERS } from '@test/test-data';

describe('ChatOrchestratorController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
    process.env.NODE_ENV = 'test';
    
    console.log('🔧 Chat Orchestrator test using DB:', process.env.DB_URL);
    
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
        ChatModule,
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

  describe('POST /chat/send', () => {
    it('should send chat message with user token', () => {
      const chatMessage = {
        message: 'Hello, I need help with my insurance policy',
        sessionId: 'test-session-123'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
          expect(typeof res.body.response).toBe('string');
        });
    });

    it('should send chat message with admin token', () => {
      const chatMessage = {
        message: 'Admin needs help with system configuration',
        sessionId: 'admin-session-456'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
          expect(typeof res.body.response).toBe('string');
        });
    });

    it('should work without sessionId', () => {
      const chatMessage = {
        message: 'Hello without session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
        });
    });

    it('should return 401 without token', () => {
      const chatMessage = {
        message: 'Hello without auth'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .send(chatMessage)
        .expect(401);
    });

    it('should return 400 with empty message', () => {
      const chatMessage = {
        message: '',
        sessionId: 'test-session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(400);
    });

    it('should return 400 without message', () => {
      const chatMessage = {
        sessionId: 'test-session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(400);
    });

    it('should handle policy-related questions', () => {
      const chatMessage = {
        message: 'What does my gold policy cover?',
        sessionId: 'policy-session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
        });
    });

    it('should handle claim-related questions', () => {
      const chatMessage = {
        message: 'How do I file a claim for my car accident?',
        sessionId: 'claim-session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
        });
    });

    it('should handle premium-related questions', () => {
      const chatMessage = {
        message: 'How is my premium calculated?',
        sessionId: 'premium-session'
      };

      return request(app.getHttpServer())
        .post('/chat/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
        });
    });
  });
});
