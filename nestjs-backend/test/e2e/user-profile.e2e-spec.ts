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
import { UserModule } from '@/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from '@/config/config.module';
import { TEST_USERS } from '@test/test-data';

describe('UserProfileController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
    process.env.NODE_ENV = 'test';
    
    console.log('🔧 User Profile test using DB:', process.env.DB_URL);
    
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
        UserModule,
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

  describe('GET /user/profile', () => {
    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
          expect(res.body.email).toBe(TEST_USERS.JOHN_DOE.email);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .expect(401);
    });
  });

  describe('PATCH /user/profile', () => {
    it('should update user email with valid token', () => {
      const newEmail = 'updated.john.doe@test.com';
      
      return request(app.getHttpServer())
        .patch('/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: newEmail })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(newEmail);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/user/profile')
        .send({ email: 'test@test.com' })
        .expect(401);
    });

    it('should return 400 with invalid email', () => {
      return request(app.getHttpServer())
        .patch('/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('User Policies', () => {
    it('GET /user/policies - should return user policies', () => {
      return request(app.getHttpServer())
        .get('/user/policies')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /user/policies/active - should return active policies', () => {
      return request(app.getHttpServer())
        .get('/user/policies/active')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /user/policies/:id - should return specific policy', () => {
      return request(app.getHttpServer())
        .get('/user/policies/GOLD-001')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('policy_id');
          expect(res.body).toHaveProperty('user_id');
        });
    });

    it('GET /user/policies/:id - should return 404 for non-existent policy', () => {
      return request(app.getHttpServer())
        .get('/user/policies/NONEXISTENT')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/user/policies')
        .expect(401);
    });
  });

  describe('User Claims', () => {
    it('GET /user/claims - should return user claims', () => {
      return request(app.getHttpServer())
        .get('/user/claims')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /user/claims/:id - should return specific claim', () => {
      return request(app.getHttpServer())
        .get('/user/claims/CLM-001')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('claim_id');
          expect(res.body).toHaveProperty('description');
        });
    });

    it('GET /user/claims/:id - should return 404 for non-existent claim', () => {
      return request(app.getHttpServer())
        .get('/user/claims/non-existent-claim')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('POST /user/claims - should create new claim', () => {
      const newClaim = {
        policyId: 'GOLD-001',
        description: 'Test claim description',
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: 'TESTVIN123'
        },
        photos: ['photo1.jpg', 'photo2.jpg']
      };

      return request(app.getHttpServer())
        .post('/user/claims')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newClaim)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('claim_id');
          expect(res.body).toHaveProperty('description');
          expect(res.body.description).toBe(newClaim.description);
        });
    });

    it('POST /user/claims - should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/user/claims')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ policyId: 'INVALID' })
        .expect(400);
    });
  });

  describe('User Premium', () => {
    it('POST /user/premium/calculate - should calculate premium', () => {
      const premiumCalculation = {
        policy_id: 'GOLD-001',
        previous_coverage: 50000,
        new_coverage: 75000
      };

      return request(app.getHttpServer())
        .post('/user/premium/calculate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(premiumCalculation)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('premium_amount');
          expect(typeof res.body.premium_amount).toBe('number');
        });
    });

    it('POST /user/premium/calculate - should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/user/premium/calculate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ policy_id: 'INVALID' })
        .expect(400);
    });
  });

  describe('User Chat', () => {
    it('POST /user/chat - should send chat message', () => {
      const chatMessage = {
        message: 'Hello, I need help with my policy',
        sessionId: 'test-session-123'
      };

      return request(app.getHttpServer())
        .post('/user/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chatMessage)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('response');
        });
    });

    it('POST /user/chat - should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/user/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ })
        .expect(400);
    });
  });
});
